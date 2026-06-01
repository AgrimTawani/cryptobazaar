import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { answers } = await req.json() as { answers: Record<string, string> };
    if (!answers || Object.keys(answers).filter(k => !k.endsWith("_detail") && k !== "itr_r2Key").length < 11) {
      return NextResponse.json({ error: "All 11 questions must be answered" }, { status: 400 });
    }

    // Answers are stored for manual compliance review; no AI scoring
    const score = 70;
    const aiPassed = true;
    const analysis = { score, passed: true, flags: [] as string[], summary: "Questionnaire submitted for manual compliance review." };

    await db.onboardingRecord.upsert({
      where: { userId_layer: { userId: user.id, layer: "INTERVIEW" } },
      create: {
        userId: user.id,
        layer: "INTERVIEW",
        status: aiPassed ? "PASSED" : "FAILED",
        attemptNumber: 1,
        score,
        result: { ...analysis, answers } as object,
        rejectionReason: aiPassed ? null : (analysis.flags?.join("; ") || "Score below threshold"),
        completedAt: new Date(),
      },
      update: {
        status: aiPassed ? "PASSED" : "FAILED",
        attemptNumber: { increment: 1 },
        score,
        result: { ...analysis, answers } as object,
        rejectionReason: aiPassed ? null : (analysis.flags?.join("; ") || "Score below threshold"),
        completedAt: new Date(),
      },
    });

    // Always advance — compliance team reviews manually
    await db.user.update({
      where: { id: user.id },
      data: { status: "ONBOARDING_PENDING" },
    });

    return NextResponse.json({ passed: true, score, flags: analysis.flags, summary: analysis.summary });
  } catch (err) {
    console.error("[submit-questionnaire]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
