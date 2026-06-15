import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import OnboardingCompleteEmail from "@/lib/emails/onboarding-complete";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.walletAddress) {
      return NextResponse.json({ error: "Wallet already linked to this account" }, { status: 400 });
    }

    const { walletAddress, walletChain } = await req.json() as {
      walletAddress: string;
      walletChain: string;
    };

    if (!walletAddress || !walletChain) {
      return NextResponse.json({ error: "walletAddress and walletChain are required" }, { status: 400 });
    }

    // Check no other user already has this wallet
    const existing = await db.user.findUnique({ where: { walletAddress } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "This wallet address is already linked to another account" }, { status: 409 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        walletAddress,
        walletChain,
        walletVerifiedAt: new Date(),
        // We do not set status to VERIFIED here.
        // The admin must manually approve the user in the dashboard.
      },
    });

    if (updated.email) {
      await notify({
        email: {
          to: updated.email,
          subject: "Onboarding complete — pending admin approval",
          react: createElement(OnboardingCompleteEmail, { name: updated.name ?? "there" }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[link-wallet]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
