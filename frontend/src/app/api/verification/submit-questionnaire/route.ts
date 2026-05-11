import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

export const maxDuration = 30;

const SCORING_PROMPT = `You are a compliance analyst for a gated P2P crypto exchange in India called CryptoBazaar.
A user has submitted a questionnaire as part of their onboarding. Score their responses for risk and eligibility.

Return ONLY a JSON object with exactly these fields:
{
  "score": number,
  "passed": boolean,
  "flags": string[],
  "summary": string
}

Scoring rules:
- score: 0–100 (70+ = pass, below 70 = fail)
- passed: true if score >= 70 and no critical flags
- flags: list of specific risk concerns (empty array if none)
- summary: 1–2 sentence plain-English summary for the compliance record

Risk factors to consider:
- Bank account lien/freeze history = major red flag (−30 points)
- No trading experience + very high volume expectation = moderate risk (−15 points)
- Unclear or suspicious source of funds = major red flag (−25 points)
- Expects very slow transaction times (1 hour+) = minor risk (−5 points)
- New to P2P but realistic volume expectations = acceptable
- Verified Binance P2P account = positive signal (+10 points)
- Active P2P trader with consistent source of funds = positive signal (+10 points)
- Long crypto trading history = positive signal (+5 points)

Start from a base score of 70. Apply adjustments based on the answers.
Return ONLY the JSON object. No markdown, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { answers } = await req.json() as { answers: Record<string, string> };
    if (!answers || Object.keys(answers).filter(k => !k.endsWith("_detail")).length < 10) {
      return NextResponse.json({ error: "All 10 questions must be answered" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey || apiKey === "your_google_ai_api_key_here") {
      return NextResponse.json({ error: "Google AI not configured" }, { status: 500 });
    }

    // Format answers for the prompt
    const formatted = [
      `Expected monthly trading volume: ${answers.volume}`,
      `P2P experience level: ${answers.experience}`,
      `Binance P2P verified account: ${answers.binance}${answers.binance_detail ? ` (UID: ${answers.binance_detail})` : ""}`,
      `Crypto trading duration: ${answers.duration}`,
      `Currently active in P2P: ${answers.active}`,
      `Expected transaction time: ${answers.txn_time}`,
      `Source of funds: ${answers.source_of_funds}`,
      `Bank account lien history: ${answers.lien}${answers.lien_detail ? ` (Details: ${answers.lien_detail})` : ""}`,
      `Purpose of trading: ${answers.purpose}`,
      `Max single transaction size: ${answers.max_txn}`,
    ].join("\n");

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(`${SCORING_PROMPT}\n\nUser answers:\n${formatted}`);
    const raw = result.response.text().trim();

    let analysis: { score: number; passed: boolean; flags: string[]; summary: string };
    try {
      analysis = JSON.parse(raw);
    } catch {
      console.error("[submit-questionnaire] Gemini non-JSON:", raw);
      return NextResponse.json({ error: "Scoring failed — unexpected AI response" }, { status: 502 });
    }

    const score = Math.max(0, Math.min(100, analysis.score ?? 0));
    const passed = score >= 70 && !analysis.flags?.some(f =>
      f.toLowerCase().includes("lien") || f.toLowerCase().includes("freeze") || f.toLowerCase().includes("fraud")
    );

    const existing = await db.onboardingRecord.findFirst({
      where: { userId: user.id, layer: "INTERVIEW" },
      orderBy: { attemptNumber: "desc" },
    });

    await db.onboardingRecord.create({
      data: {
        userId: user.id,
        layer: "INTERVIEW",
        status: passed ? "PASSED" : "FAILED",
        attemptNumber: existing ? existing.attemptNumber + 1 : 1,
        score,
        result: { ...analysis, answers } as object,
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

    return NextResponse.json({ passed, score, flags: analysis.flags, summary: analysis.summary });
  } catch (err) {
    console.error("[submit-questionnaire]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
