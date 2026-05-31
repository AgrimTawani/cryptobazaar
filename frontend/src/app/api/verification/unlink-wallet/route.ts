import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await db.user.update({
      where: { id: user.id },
      data: {
        walletAddress: null,
        walletChain: null,
        walletVerifiedAt: null,
        status: "ONBOARDING_PENDING",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[unlink-wallet]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
