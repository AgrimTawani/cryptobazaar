import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    await db.user.update({
      where: { id: user.id },
      data: {
        walletAddress,
        walletChain,
        walletVerifiedAt: new Date(),
        status: "VERIFIED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[link-wallet]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
