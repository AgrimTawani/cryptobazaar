import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const order = await db.order.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, avatarUrl: true } },
        buyer:  { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isSeller = user.id === order.sellerId;
    const isBuyer  = user.id === order.buyerId;
    const viewerRole = isSeller ? "seller" : isBuyer ? "buyer" : "observer";

    const SHOW_PAYMENT = ["BUYER_MATCHED", "BUYER_PAID", "COMPLETED", "DISPUTED",
      "DISPUTE_RESOLVED_BUYER", "DISPUTE_RESOLVED_SELLER"];
    const showPaymentDetails = isBuyer && SHOW_PAYMENT.includes(order.status);

    const onChainId = order.orderId.split("_").pop() ?? "0";

    return NextResponse.json({
      id: order.id,
      orderId: order.orderId,
      onChainId,
      sellerName:  order.seller.name  ?? "Anonymous",
      sellerAvatar: order.seller.avatarUrl ?? null,
      buyerName:   order.buyer?.name  ?? null,
      buyerAvatar: order.buyer?.avatarUrl ?? null,
      asset: order.asset,
      chain: order.chain,
      amount: order.amount.toString(),
      pricePerUnit: order.pricePerUnit.toString(),
      totalValueInr: order.totalValueInr.toString(),
      acceptedPaymentMethods: order.acceptedPaymentMethods,
      status: order.status,
      escrowTxHash: order.escrowTxHash ?? null,
      escrowContractAddress: order.escrowContractAddress ?? null,
      utr: (isSeller || isBuyer) ? (order.utr ?? null) : null,
      buyerMatchedAt: order.buyerMatchedAt?.toISOString() ?? null,
      paymentWindowExpiresAt: order.paymentWindowExpiresAt?.toISOString() ?? null,
      completedAt: order.completedAt?.toISOString() ?? null,
      viewerRole,
      sellerUpiId:       showPaymentDetails ? (order.sellerUpiId ?? null)       : null,
      sellerBankAccount: showPaymentDetails ? (order.sellerBankAccount ?? null) : null,
      sellerIfsc:        showPaymentDetails ? (order.sellerIfsc ?? null)        : null,
    });
  } catch (err) {
    console.error("[orders/[id] GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const order = await db.order.findUnique({ where: { id } });
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const body = await request.json();
    const { action, utr } = body;

    const isSeller = user.id === order.sellerId;
    const isBuyer  = user.id === order.buyerId;

    switch (action) {
      case "lock": {
        if (isSeller)
          return NextResponse.json({ error: "Seller cannot lock own order" }, { status: 403 });
        if (order.status !== "LISTED")
          return NextResponse.json({ error: "Order not available" }, { status: 400 });
        if (user.status !== "VERIFIED")
          return NextResponse.json({ error: "Must be verified to buy" }, { status: 403 });

        await db.order.update({
          where: { id },
          data: {
            buyerId: user.id,
            status: "BUYER_MATCHED",
            buyerMatchedAt: new Date(),
            paymentWindowExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
        break;
      }

      case "markPaid": {
        if (!isBuyer)
          return NextResponse.json({ error: "Only buyer can mark paid" }, { status: 403 });
        if (order.status !== "BUYER_MATCHED")
          return NextResponse.json({ error: "Invalid state" }, { status: 400 });

        await db.order.update({
          where: { id },
          data: {
            status: "BUYER_PAID",
            utr: utr ?? null,
            paymentSubmittedAt: new Date(),
          },
        });
        break;
      }

      case "confirm": {
        if (!isSeller)
          return NextResponse.json({ error: "Only seller can confirm" }, { status: 403 });
        if (order.status !== "BUYER_PAID")
          return NextResponse.json({ error: "Invalid state" }, { status: 400 });

        await db.order.update({
          where: { id },
          data: {
            status: "COMPLETED",
            sellerConfirmedAt: new Date(),
            completedAt: new Date(),
          },
        });
        break;
      }

      case "dispute": {
        if (!isSeller && !isBuyer)
          return NextResponse.json({ error: "Not a party to this order" }, { status: 403 });
        if (order.status !== "BUYER_PAID")
          return NextResponse.json({ error: "Can only dispute after payment marked" }, { status: 400 });

        await db.order.update({
          where: { id },
          data: { status: "DISPUTED" },
        });
        break;
      }

      case "cancel": {
        if (!isSeller)
          return NextResponse.json({ error: "Only seller can cancel" }, { status: 403 });
        if (order.status !== "LISTED")
          return NextResponse.json({ error: "Can only cancel open orders" }, { status: 400 });

        await db.order.update({
          where: { id },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
        break;
      }

      case "timeout": {
        if (!isSeller)
          return NextResponse.json({ error: "Only seller can trigger timeout" }, { status: 403 });
        if (order.status !== "BUYER_MATCHED")
          return NextResponse.json({ error: "Invalid state" }, { status: 400 });
        if (!order.paymentWindowExpiresAt || order.paymentWindowExpiresAt > new Date())
          return NextResponse.json({ error: "30-min window not elapsed yet" }, { status: 400 });

        await db.order.update({
          where: { id },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[orders/[id] PATCH]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
