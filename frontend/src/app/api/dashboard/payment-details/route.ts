import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { upiId, bankAccount, ifscCode } = body;

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, upiId: true, bankAccount: true, ifscCode: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = {};

    // Only allow setting if currently null
    if (upiId && !user.upiId) {
      updates.upiId = upiId;
    }

    if (bankAccount && ifscCode && !user.bankAccount) {
      updates.bankAccount = bankAccount;
      updates.ifscCode = ifscCode;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided or fields already set. Cannot edit existing payment details." }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: updates,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[payment-details]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
