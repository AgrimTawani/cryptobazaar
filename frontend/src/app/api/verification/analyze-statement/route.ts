import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

export const maxDuration = 60;

// Tools known to be used for image manipulation / document forgery
const IMAGE_EDITING_TOOLS = [
  "photoshop",
  "illustrator",
  "gimp",
  "inkscape",
  "canva",
  "paint.net",
  "affinity",
  "pixelmator",
  "coreldraw",
  "paintshop",
  "krita",
];

type ForensicResult = {
  passed: boolean;
  flags: string[];
  metadata: {
    creator: string | null;
    producer: string | null;
    pages: number;
    hasText: boolean;
    wasModified: boolean;
  };
};

function extractPdfMeta(buffer: Buffer) {
  // Read PDF as latin1 to safely inspect raw bytes without browser APIs
  const raw = buffer.toString("latin1");

  const str = (pattern: RegExp) => {
    const m = raw.match(pattern);
    return m ? m[1].trim() : null;
  };

  return {
    rawCreator: str(/\/Creator\s*\(([^)]*)\)/) ?? str(/\/Creator\s*<([^>]*)>/) ?? null,
    rawProducer: str(/\/Producer\s*\(([^)]*)\)/) ?? str(/\/Producer\s*<([^>]*)>/) ?? null,
    creationDate: str(/\/CreationDate\s*\(([^)]*)\)/) ?? null,
    modDate: str(/\/ModDate\s*\(([^)]*)\)/) ?? null,
    // BT (Begin Text) markers indicate actual text content in the PDF stream
    hasText: /BT[\s\r\n]/.test(raw),
    pages: (raw.match(/\/Type\s*\/Page[^s]/g) ?? []).length || 1,
  };
}

async function runForgeryCheck(buffer: Buffer): Promise<ForensicResult> {
  const { rawCreator, rawProducer, creationDate, modDate, hasText, pages } = extractPdfMeta(buffer);

  const creator = (rawCreator ?? "").toLowerCase();
  const producer = (rawProducer ?? "").toLowerCase();

  const flags: string[] = [];

  // 1. Check for image editing software
  const suspiciousTool = IMAGE_EDITING_TOOLS.find(
    (t) => creator.includes(t) || producer.includes(t)
  );
  if (suspiciousTool) {
    flags.push(
      `Document appears to have been created or edited with image editing software (${rawCreator || rawProducer})`
    );
  }

  // 2. Check modification date vs creation date
  let wasModified = false;
  if (creationDate && modDate && creationDate !== modDate) {
    const normalize = (d: string) => d.replace(/^D:/, "").slice(0, 14);
    if (normalize(creationDate) !== normalize(modDate)) {
      wasModified = true;
      flags.push("Document was modified after its original creation date");
    }
  }

  // 3. Check for text layer
  if (!hasText) {
    flags.push(
      "PDF contains no readable text layer — appears to be a scanned image or photograph of a document"
    );
  }

  const passed = flags.length === 0;

  return {
    passed,
    flags,
    metadata: {
      creator: rawCreator,
      producer: rawProducer,
      pages,
      hasText,
      wasModified,
    },
  };
}

const ANALYSIS_PROMPT = `You are an EDD (Enhanced Due Diligence) analyst reviewing a bank statement for a P2P crypto exchange. The user must demonstrate stable, legitimate income to be approved.

Analyse the bank statement and return a JSON object with exactly these fields:
{
  "score": number,
  "monthlyIncomeAvg": number,
  "hasRegularIncome": boolean,
  "flagged": boolean,
  "flags": string[],
  "summary": string
}

Field descriptions:
- score: 0-100 EDD score (higher = better; 80+ approve, 60-79 review, below 60 reject)
- monthlyIncomeAvg: average monthly credits in INR (0 if unclear)
- hasRegularIncome: true if salary or business income appears on a regular schedule
- flagged: true if any red flags detected
- flags: list of specific red flags found (empty array if none)
- summary: 1-2 sentence plain-English summary for the compliance record

Red flags to check:
- Large unexplained cash deposits
- Round-number transfers suggesting layering
- Frequent international transfers
- Gambling or suspicious merchant transactions
- Income spikes inconsistent with stated employment
- No regular income credits over the statement period
- Very low account balance relative to stated income

Return ONLY the JSON object. No markdown, no explanation, no code fences.`;

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey || apiKey === "your_google_ai_api_key_here") {
      return NextResponse.json({ error: "Google AI API key not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "PDF only" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── Step 1: Forgery / integrity check ────────────────────────────────────
    const forensic = await runForgeryCheck(buffer);

    if (!forensic.passed) {
      const existing = await db.onboardingRecord.findFirst({
        where: { userId: user.id, layer: "EDD" },
        orderBy: { attemptNumber: "desc" },
      });
      await db.onboardingRecord.create({
        data: {
          userId: user.id,
          layer: "EDD",
          status: "FAILED",
          attemptNumber: existing ? existing.attemptNumber + 1 : 1,
          score: 0,
          result: { forensic } as object,
          rejectionReason: forensic.flags.join("; "),
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        passed: false,
        score: 0,
        flags: forensic.flags,
        summary: "Document failed integrity checks before analysis.",
        forensicFail: true,
      });
    }

    // ── Step 2: AI income analysis with Gemini ────────────────────────────────
    const base64 = buffer.toString("base64");

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType: "application/pdf" } },
      ANALYSIS_PROMPT,
    ]);

    const raw = result.response.text().trim();

    let analysis: {
      score: number;
      monthlyIncomeAvg: number;
      hasRegularIncome: boolean;
      flagged: boolean;
      flags: string[];
      summary: string;
    };

    try {
      analysis = JSON.parse(raw);
    } catch {
      console.error("[analyze-statement] Gemini returned non-JSON:", raw);
      return NextResponse.json({ error: "Analysis failed — unexpected AI response" }, { status: 502 });
    }

    const score = Math.max(0, Math.min(100, analysis.score ?? 0));
    const passed = score >= 60 && !analysis.flagged;

    // ── Step 3: Write result to DB ────────────────────────────────────────────
    const existing = await db.onboardingRecord.findFirst({
      where: { userId: user.id, layer: "EDD" },
      orderBy: { attemptNumber: "desc" },
    });

    await db.onboardingRecord.create({
      data: {
        userId: user.id,
        layer: "EDD",
        status: passed ? "PASSED" : "FAILED",
        attemptNumber: existing ? existing.attemptNumber + 1 : 1,
        score,
        result: { ...analysis, forensic } as object,
        rejectionReason: passed ? null : (analysis.flags?.join("; ") || "Score below threshold"),
        completedAt: new Date(),
      },
    });

    if (passed) {
      await db.user.update({
        where: { id: user.id },
        data: { status: "ONBOARDING_PENDING" },
      });
    }

    return NextResponse.json({
      passed,
      score,
      flags: analysis.flags,
      summary: analysis.summary,
      forensicFail: false,
    });
  } catch (err) {
    console.error("[analyze-statement]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
