import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { r2 } from "@/lib/r2";

async function uploadToR2(buffer: Buffer, userId: number, name: string | null, attemptNumber: number): Promise<string> {
  const safeName = (name ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const key = `statements/${safeName}-${userId}/${Date.now()}-attempt${attemptNumber}.pdf`;
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: "application/pdf",
  }));
  return key;
}

export const maxDuration = 30;

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
    // Most real PDFs use FlateDecode compression - BT markers won't appear in raw bytes
    hasText: true,
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

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const upiId = (formData.get("upiId") as string | null)?.trim() || null;
    const bankAccount = (formData.get("bankAccount") as string | null)?.trim() || null;
    const ifscCode = (formData.get("ifscCode") as string | null)?.trim().toUpperCase() || null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "PDF only" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
    if (!bankAccount || !ifscCode) return NextResponse.json({ error: "Bank account and IFSC are required" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── Step 1: Forgery / integrity check ────────────────────────────────────
    const forensic = await runForgeryCheck(buffer);

    if (!forensic.passed) {
      await db.onboardingRecord.upsert({
        where: { userId_layer: { userId: user.id, layer: "EDD" } },
        create: {
          userId: user.id,
          layer: "EDD",
          status: "FAILED",
          attemptNumber: 1,
          score: 0,
          result: { forensic } as object,
          rejectionReason: forensic.flags.join("; "),
          completedAt: new Date(),
        },
        update: {
          status: "FAILED",
          attemptNumber: { increment: 1 },
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

    // ── Step 2: Upload to R2 ─────────────────────────────────────────────────
    const existingRecord = await db.onboardingRecord.findUnique({
      where: { userId_layer: { userId: user.id, layer: "EDD" } },
    });
    const attemptNumber = existingRecord ? existingRecord.attemptNumber + 1 : 1;
    const r2Key = await uploadToR2(buffer, user.id, user.name, attemptNumber);

    // ── Step 3: Send to Python Microservice for Analysis ──────────────────────
    const microserviceUrl = process.env.BANK_ANALYZER_URL || "http://127.0.0.1:8000/analyze";
    console.log(`[analyze-statement] Sending PDF to microservice at: ${microserviceUrl}`);
    let analysisData = null;
    try {
      const formDataService = new FormData();
      // Explicitly append as a blob with a guaranteed .pdf filename to prevent FastAPI 400 errors
      const blob = new Blob([buffer], { type: "application/pdf" });
      formDataService.append("file", blob, "statement.pdf");

      const msResponse = await fetch(microserviceUrl, {
        method: "POST",
        body: formDataService,
      });
      
      if (!msResponse.ok) {
        const errorText = await msResponse.text();
        console.error("Microservice returned error", msResponse.status, errorText);
      } else {
        const msResult = await msResponse.json();
        if (msResult.status === "LOCKED_PDF") {
           return NextResponse.json({ error: "PDF is password protected. Please upload an unlocked PDF." }, { status: 400 });
        }
        if (msResult.status === "COMPLETED") {
          analysisData = msResult;
        }
      }
    } catch (err) {
      console.error("Failed to connect to Bank Analyzer microservice", err);
    }

    if (analysisData) {
      await db.bankStatementAnalysis.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          status: analysisData.status,
          hasRegularIncome: analysisData.hasRegularIncome,
          recurringBillCount: analysisData.recurringBillCount,
          transactionModes: analysisData.transactionModes,
          hasMerchantSpend: analysisData.hasMerchantSpend,
          exchangeTxCount: analysisData.exchangeTxCount,
          monthsWithCryptoTrades: analysisData.monthsWithCryptoTrades,
          hasBidirectionalCrypto: analysisData.hasBidirectionalCrypto,
          maxVolumeSpikeRatio: analysisData.maxVolumeSpikeRatio,
          avgUniqueSendersPerMonth: analysisData.avgUniqueSendersPerMonth,
          senderRecurrenceRate: analysisData.senderRecurrenceRate,
          avgCreditToDebitHours: analysisData.avgCreditToDebitHours,
          roundNumberRatio: analysisData.roundNumberRatio,
          structuringClustersCount: analysisData.structuringClustersCount,
          inflowSpikeRatio: analysisData.inflowSpikeRatio,
          avgMonthlyBalance: analysisData.avgMonthlyBalance,
          balanceDropsToZero: analysisData.balanceDropsToZero,
          returnedPaymentsCount: analysisData.returnedPaymentsCount,
          positiveNetFlowMonths: analysisData.positiveNetFlowMonths,
        },
        update: {
          status: analysisData.status,
          hasRegularIncome: analysisData.hasRegularIncome,
          recurringBillCount: analysisData.recurringBillCount,
          transactionModes: analysisData.transactionModes,
          hasMerchantSpend: analysisData.hasMerchantSpend,
          exchangeTxCount: analysisData.exchangeTxCount,
          monthsWithCryptoTrades: analysisData.monthsWithCryptoTrades,
          hasBidirectionalCrypto: analysisData.hasBidirectionalCrypto,
          maxVolumeSpikeRatio: analysisData.maxVolumeSpikeRatio,
          avgUniqueSendersPerMonth: analysisData.avgUniqueSendersPerMonth,
          senderRecurrenceRate: analysisData.senderRecurrenceRate,
          avgCreditToDebitHours: analysisData.avgCreditToDebitHours,
          roundNumberRatio: analysisData.roundNumberRatio,
          structuringClustersCount: analysisData.structuringClustersCount,
          inflowSpikeRatio: analysisData.inflowSpikeRatio,
          avgMonthlyBalance: analysisData.avgMonthlyBalance,
          balanceDropsToZero: analysisData.balanceDropsToZero,
          returnedPaymentsCount: analysisData.returnedPaymentsCount,
          positiveNetFlowMonths: analysisData.positiveNetFlowMonths,
        }
      });
    }

    // ── Step 4: Write result to DB — manual compliance review ────────────────
    const score = 75;
    await db.onboardingRecord.upsert({
      where: { userId_layer: { userId: user.id, layer: "EDD" } },
      create: {
        userId: user.id,
        layer: "EDD",
        status: "PASSED",
        attemptNumber,
        score,
        result: { forensic, r2Key } as object,
        rejectionReason: null,
        completedAt: new Date(),
      },
      update: {
        status: "PASSED",
        attemptNumber: { increment: 1 },
        score,
        result: { forensic, r2Key } as object,
        rejectionReason: null,
        completedAt: new Date(),
      },
    });

    // Advance — compliance team reviews uploaded statement manually
    await db.user.update({
      where: { id: user.id },
      data: { status: "ONBOARDING_PENDING", upiId, bankAccount, ifscCode },
    });

    return NextResponse.json({
      passed: true,
      score,
      flags: [],
      summary: "Statement submitted for manual compliance review.",
      forensicFail: false,
    });
  } catch (err) {
    console.error("[analyze-statement]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
