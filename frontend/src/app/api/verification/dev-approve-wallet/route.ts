import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.user.update({
    where: { id: user.id },
    data: {
      walletAddress: `dev-wallet-${user.id.slice(0, 8)}`,
      walletChain: "POLYGON",
      walletVerifiedAt: new Date(),
      status: "VERIFIED",
    },
  });

  return NextResponse.json({ ok: true });
}
