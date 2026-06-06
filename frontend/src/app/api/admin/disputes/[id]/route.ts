import { db } from "@/lib/db";
import { requireAdmin, isSecondaryPasswordUnlocked } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAuthorized = await requireAdmin();
    const isUnlocked = await isSecondaryPasswordUnlocked();

    if (!isAuthorized || !isUnlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json();

    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Transaction to update both dispute and order
    await db.$transaction([
      db.dispute.update({
        where: { id },
        data: {
          status: action === "SELLER" ? "RESOLVED_SELLER" : "RESOLVED_BUYER",
          resolution: action === "SELLER" ? "Admin decided in favor of seller. Contract cancelled." : "Admin decided in favor of buyer. Funds released.",
          resolvedAt: new Date(),
          resolvedBy: "Admin",
        },
      }),
      db.order.update({
        where: { id: dispute.orderId },
        data: {
          status: action === "SELLER" ? "DISPUTE_RESOLVED_SELLER" : "DISPUTE_RESOLVED_BUYER",
          completedAt: new Date(),
        },
      })
    ]);

    // Note: Actual smart contract disbursement is a placeholder here.
    // In a real system, we would trigger a backend worker to sign the release/cancel transaction.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Dispute Resolve]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
