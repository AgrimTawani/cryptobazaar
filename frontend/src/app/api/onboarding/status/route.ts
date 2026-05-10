import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        onboardingRecords: {
          orderBy: { attemptNumber: "desc" },
        },
      },
    });

    if (!user) {
      // Auto-create user on first visit (handles cases where sync wasn't called)
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress ?? null;
      const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || null;
      const avatarUrl = clerkUser?.imageUrl ?? null;

      await db.user.create({
        data: { clerkId, email, name, avatarUrl, status: "LOGIN_DONE" },
      });

      return NextResponse.json({
        userStatus: "LOGIN_DONE",
        walletAddress: null,
        kyc: "NOT_STARTED",
        edd: "NOT_STARTED",
        interview: "NOT_STARTED",
      });
    }

    const latestByLayer = (layer: string) =>
      user.onboardingRecords.find((r) => r.layer === layer);

    const kyc = latestByLayer("KYC");
    const edd = latestByLayer("EDD");
    const interview = latestByLayer("INTERVIEW");

    return NextResponse.json({
      userStatus: user.status,
      walletAddress: user.walletAddress ?? null,
      kyc: kyc?.status ?? "NOT_STARTED",
      edd: edd?.status ?? "NOT_STARTED",
      interview: interview?.status ?? "NOT_STARTED",
    });
  } catch (err) {
    console.error("[onboarding/status]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
