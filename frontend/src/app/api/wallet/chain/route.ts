import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// EVM chains share the same address — users can switch between them freely
const EVM_CHAINS = new Set(["POLYGON", "BSC"]);

export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { walletChain } = await req.json() as { walletChain: string };
    if (!EVM_CHAINS.has(walletChain)) {
      return NextResponse.json({ error: "Can only switch between EVM chains (POLYGON, BSC)" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user?.walletAddress) return NextResponse.json({ error: "No wallet linked" }, { status: 400 });
    if (!EVM_CHAINS.has(user.walletChain ?? "")) {
      return NextResponse.json({ error: "Chain switching is only available for EVM wallets" }, { status: 400 });
    }

    await db.user.update({ where: { clerkId }, data: { walletChain } });
    return NextResponse.json({ success: true, walletChain });
  } catch (err) {
    console.error("[wallet/chain]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
