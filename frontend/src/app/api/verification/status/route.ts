import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const record = await db.onboardingRecord.findFirst({
      where: { userId: user.id, layer: "KYC" },
      orderBy: { attemptNumber: "desc" },
    });

    // Already resolved in DB (webhook fired in production)
    if (record?.status === "PASSED") return NextResponse.json({ status: "PASSED" });
    if (record?.status === "FAILED") return NextResponse.json({ status: "FAILED" });

    // No session started yet
    if (!user.kycSessionId) return NextResponse.json({ status: "NOT_STARTED" });

    // Poll Didit directly (works locally without webhook)
    const apiKey = process.env.DIDIT_API_KEY;
    const diditRes = await fetch(
      `${process.env.DIDIT_API_URL}/v3/session/${user.kycSessionId}/decision/`,
      { headers: { "x-api-key": apiKey! } }
    );

    if (!diditRes.ok) {
      return NextResponse.json({ status: record?.status ?? "IN_PROGRESS" });
    }

    const decision = await diditRes.json();
    const diditStatus = decision.status as string;

    const passed = diditStatus === "Approved";
    const failed = diditStatus === "Declined";

    if ((passed || failed) && record) {
      await db.onboardingRecord.update({
        where: { id: record.id },
        data: {
          status: passed ? "PASSED" : "FAILED",
          result: decision,
          completedAt: new Date(),
        },
      });

      if (passed) {
        await db.user.update({
          where: { id: user.id },
          data: { kycVerifiedAt: new Date(), status: "WALLET_PENDING" },
        });
      }
    }

    return NextResponse.json({
      status: passed ? "PASSED" : failed ? "FAILED" : "IN_PROGRESS",
    });
  } catch (err) {
    console.error("[verification/status]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
