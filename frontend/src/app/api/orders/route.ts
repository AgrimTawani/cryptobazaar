import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ACTIVE_STATUSES = ["LISTED", "BUYER_MATCHED", "BUYER_PAID", "DISPUTED"];

const STATUS_LABEL: Record<string, string> = {
  LISTED:        "Open",
  BUYER_MATCHED: "Payment Pending",
  BUYER_PAID:    "Awaiting Confirmation",
  DISPUTED:      "Disputed",
  COMPLETED:     "Completed",
  CANCELLED:     "Cancelled",
};

function mapOrder(o: {
  id: string; orderId: string; asset: string; chain: string;
  amount: { toString(): string }; pricePerUnit: { toString(): string };
  totalValueInr: { toString(): string }; acceptedPaymentMethods: string[];
  escrowTxHash: string | null; escrowContractAddress: string | null;
  status: string;
  seller: { name: string | null; avatarUrl: string | null };
}) {
  return {
    id: o.id,
    orderId: o.orderId,
    sellerName: o.seller.name ?? "Anonymous",
    sellerAvatar: o.seller.avatarUrl ?? null,
    asset: o.asset,
    chain: o.chain,
    amount: o.amount.toString(),
    pricePerUnit: o.pricePerUnit.toString(),
    totalValueInr: o.totalValueInr.toString(),
    acceptedPaymentMethods: o.acceptedPaymentMethods,
    escrowTxHash: o.escrowTxHash ?? null,
    escrowContractAddress: o.escrowContractAddress ?? null,
    status: o.status,
    statusLabel: STATUS_LABEL[o.status] ?? o.status,
  };
}

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";

    if (mine) {
      // All active orders where user is seller or buyer
      const orders = await db.order.findMany({
        where: {
          status: { in: ACTIVE_STATUSES as never[] },
          OR: [{ sellerId: user.id }, { buyerId: user.id }],
        },
        include: { seller: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders.map(mapOrder));
    }

    // Public marketplace — LISTED only, exclude user's own orders
    const orders = await db.order.findMany({
      where: { status: "LISTED", sellerId: { not: user.id } },
      include: { seller: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders.map(mapOrder));
  } catch (err) {
    console.error("[orders GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.status !== "VERIFIED")
      return NextResponse.json({ error: "Not verified" }, { status: 403 });

    const body = await request.json();
    const {
      orderId,
      chain,
      asset,
      amount,
      pricePerUnit,
      escrowTxHash,
      escrowContractAddress,
      paymentMethods,
      sellerUpiId,
      sellerBankAccount,
      sellerIfsc,
    } = body;

    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(pricePerUnit);

    const order = await db.order.create({
      data: {
        orderId,
        sellerId: user.id,
        chain,
        asset,
        amount: amountNum,
        pricePerUnit: priceNum,
        totalValueInr: amountNum * priceNum,
        acceptedPaymentMethods: paymentMethods,
        escrowContractAddress: escrowContractAddress ?? null,
        escrowTxHash: escrowTxHash ?? null,
        sellerUpiId: sellerUpiId ?? null,
        sellerBankAccount: sellerBankAccount ?? null,
        sellerIfsc: sellerIfsc ?? null,
        status: "LISTED",
      },
    });

    return NextResponse.json({ id: order.id, orderId: order.orderId });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
