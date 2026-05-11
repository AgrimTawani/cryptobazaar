import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const STATUS_LABEL: Record<string, string> = {
  LISTED:        "Open",
  BUYER_MATCHED: "Payment Pending",
  BUYER_PAID:    "Awaiting Confirmation",
  COMPLETED:     "Completed",
  DISPUTED:      "Disputed",
  DISPUTE_RESOLVED_BUYER:  "Resolved (Buyer)",
  DISPUTE_RESOLVED_SELLER: "Resolved (Seller)",
  EXPIRED:    "Expired",
  CANCELLED:  "Cancelled",
};

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const completedOrders = await db.order.findMany({
      where: {
        status: "COMPLETED",
        OR: [{ sellerId: user.id }, { buyerId: user.id }],
      },
      select: { totalValueInr: true },
    });

    const totalTrades = completedOrders.length;
    const totalVolumeInr = completedOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalValueInr.toString()),
      0
    );

    const recentOrders = await db.order.findMany({
      where: {
        OR: [{ sellerId: user.id }, { buyerId: user.id }],
      },
      include: {
        seller: { select: { name: true } },
        buyer:  { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const activity = recentOrders.map((o) => {
      const isSeller = o.sellerId === user.id;
      return {
        id: o.id,
        role: isSeller ? "seller" : "buyer",
        action: isSeller ? "Sold" : "Bought",
        amount: o.amount.toString(),
        asset: o.asset,
        totalValueInr: o.totalValueInr.toString(),
        status: o.status,
        statusLabel: STATUS_LABEL[o.status] ?? o.status,
        counterpartyName: isSeller
          ? (o.buyer?.name ?? null)
          : (o.seller.name ?? "Anonymous"),
        updatedAt: o.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ totalTrades, totalVolumeInr, activity });
  } catch (err) {
    console.error("[dashboard/stats GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
