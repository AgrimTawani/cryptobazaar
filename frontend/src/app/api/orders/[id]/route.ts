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
        seller: {
          select: {
            id: true, name: true, avatarUrl: true,
            avgSellerRating: true, avgSellerSpeedRating: true, avgSellerPoliteness: true,
            sellerRatingCount: true, totalTradeCount: true, avgSellerConfirmTimeSecs: true,
          },
        },
        buyer:   { select: { id: true, name: true, avatarUrl: true } },
        ratings: { select: { raterId: true } },
      },
    });

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const filteredReviews = await db.tradeRating.findMany({
      where: { ratedUserId: order.sellerId, raterRole: "buyer" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        overallRating: true,
        speedRating: true,
        politenessRating: true,
        comment: true,
        createdAt: true,
        rater: { select: { name: true, avatarUrl: true } },
      },
    });

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
      sellerRatingCount: order.seller.sellerRatingCount,
      sellerTotalTrades: order.seller.totalTradeCount,
      sellerAvgRating: order.seller.avgSellerRating?.toNumber() ?? null,
      sellerAvgSpeed: order.seller.avgSellerSpeedRating?.toNumber() ?? null,
      sellerAvgPoliteness: order.seller.avgSellerPoliteness?.toNumber() ?? null,
      sellerAvgConfirmTimeSecs: order.seller.avgSellerConfirmTimeSecs ?? null,
      sellerReviews: filteredReviews.map((r) => ({
        overallRating: r.overallRating,
        speedRating: r.speedRating,
        politenessRating: r.politenessRating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        raterName: r.rater.name ?? "Anonymous",
        raterAvatar: r.rater.avatarUrl ?? null,
      })),
      buyerName:   order.buyer?.name  ?? null,
      buyerAvatar: order.buyer?.avatarUrl ?? null,
      asset: order.asset,
      chain: order.chain,
      amount: order.amount.toString(),
      partialAllowed:  order.partialAllowed,
      minTradeSize:    order.minTradeSize?.toString() ?? null,
      originalAmount:  (order.originalAmount ?? order.amount).toString(),
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
      hasRated: order.ratings.some((r) => r.raterId === user.id),
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

        const orderAmount = parseFloat(order.amount.toString());
        const minTrade = order.minTradeSize ? parseFloat(order.minTradeSize.toString()) : orderAmount;
        const rawBuyAmount = body.buyAmount ? parseFloat(body.buyAmount) : null;
        if (rawBuyAmount !== null && (isNaN(rawBuyAmount) || rawBuyAmount <= 0)) {
          return NextResponse.json({ error: "Invalid buyAmount" }, { status: 400 });
        }
        const buyAmount = rawBuyAmount ?? orderAmount;

        if (!order.partialAllowed && Math.abs(buyAmount - orderAmount) > 0.000001) {
          return NextResponse.json({ error: "This order does not allow partial fills" }, { status: 400 });
        }
        if (buyAmount < minTrade - 0.000001) {
          return NextResponse.json({
            error: `Minimum order is ${minTrade} ${order.asset}`,
          }, { status: 400 });
        }
        if (buyAmount > orderAmount + 0.000001) {
          return NextResponse.json({ error: "Buy amount exceeds available" }, { status: 400 });
        }

        const lockedValueInr = buyAmount * parseFloat(order.pricePerUnit.toString());

        await db.order.update({
          where: { id },
          data: {
            buyerId: user.id,
            status: "BUYER_MATCHED",
            lockedAmount: buyAmount,
            totalValueInr: lockedValueInr,
            buyerMatchedAt: new Date(),
            paymentWindowExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });

        const room = await db.chatRoom.upsert({
          where:  { orderId: id },
          update: { isActive: true, closedAt: null },
          create: { orderId: id },
        });
        await db.chatMessage.create({
          data: {
            chatRoomId: room.id,
            senderId: null,
            type: "SYSTEM",
            content: `Order locked by ${user.name ?? "buyer"} for ${buyAmount} ${order.asset}. You have 30 minutes to send ₹${lockedValueInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })} and submit payment proof.`,
          },
        });
        break;
      }

      case "markPaid": {
        if (!isBuyer)
          return NextResponse.json({ error: "Only buyer can mark paid" }, { status: 403 });
        if (order.status !== "BUYER_MATCHED")
          return NextResponse.json({ error: "Invalid state" }, { status: 400 });

        const paidAt = new Date();
        const buyerPaymentTimeSecs = order.buyerMatchedAt
          ? Math.round((paidAt.getTime() - order.buyerMatchedAt.getTime()) / 1000)
          : null;
        await db.order.update({
          where: { id },
          data: {
            status: "BUYER_PAID",
            utr: utr ?? null,
            paymentSubmittedAt: paidAt,
            buyerPaymentTimeSecs,
          },
        });

        // System message
        const roomPaid = await db.chatRoom.findUnique({ where: { orderId: id } });
        if (roomPaid) {
          await db.chatMessage.create({
            data: {
              chatRoomId: roomPaid.id,
              senderId: null,
              type: "SYSTEM",
              content: `Buyer submitted payment proof${utr ? ` (UTR: ${utr})` : ""}. Seller — check your account before confirming.`,
            },
          });
        }
        break;
      }

      case "confirm": {
        if (!isSeller)
          return NextResponse.json({ error: "Only seller can confirm" }, { status: 403 });
        if (order.status !== "BUYER_PAID")
          return NextResponse.json({ error: "Invalid state" }, { status: 400 });

        const confirmedAt = new Date();
        const sellerConfirmTimeSecs = order.paymentSubmittedAt
          ? Math.round((confirmedAt.getTime() - order.paymentSubmittedAt.getTime()) / 1000)
          : null;

        const locked = order.lockedAmount ? parseFloat(order.lockedAmount.toString()) : parseFloat(order.amount.toString());
        const remaining = parseFloat(order.amount.toString()) - locked;
        const fullyFilled = remaining <= 0.000001;

        await db.order.update({
          where: { id },
          data: {
            status: fullyFilled ? "COMPLETED" : "LISTED",
            amount: fullyFilled ? order.amount : remaining,
            lockedAmount: null,
            buyerId: fullyFilled ? order.buyerId : null,
            sellerConfirmedAt: confirmedAt,
            completedAt: fullyFilled ? confirmedAt : null,
            sellerConfirmTimeSecs,
            totalValueInr: fullyFilled
              ? order.totalValueInr
              : remaining * parseFloat(order.pricePerUnit.toString()),
            ...(fullyFilled ? {} : {
              buyerMatchedAt: null,
              paymentWindowExpiresAt: null,
              paymentSubmittedAt: null,
              utr: null,
            }),
          },
        });

        if (!fullyFilled) {
          await db.chatRoom.update({
            where: { orderId: id },
            data:  { isActive: false, closedAt: confirmedAt },
          });
        }

        const roomConfirm = await db.chatRoom.findUnique({ where: { orderId: id } });
        if (roomConfirm) {
          await db.chatMessage.create({
            data: {
              chatRoomId: roomConfirm.id,
              senderId: null,
              type: "SYSTEM",
              content: fullyFilled
                ? "Seller confirmed INR received. USDC is being released to the buyer's wallet."
                : `Seller confirmed INR received. ${remaining.toFixed(2)} ${order.asset} remaining — order is live again on the marketplace.`,
            },
          });
        }
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

        // System message
        const roomDispute = await db.chatRoom.findUnique({ where: { orderId: id } });
        if (roomDispute) {
          await db.chatMessage.create({
            data: {
              chatRoomId: roomDispute.id,
              senderId: null,
              type: "SYSTEM",
              content: "Dispute raised. Admin will review and resolve within 24 hours. Do not make further payments.",
            },
          });
        }
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

      case "buyerCancel": {
        if (!isBuyer)
          return NextResponse.json({ error: "Only buyer can cancel" }, { status: 403 });
        if (order.status !== "BUYER_MATCHED")
          return NextResponse.json({ error: "Can only cancel a locked order" }, { status: 400 });

        await db.order.update({
          where: { id },
          data: {
            status: "LISTED",
            buyerId: null,
            lockedAmount: null,
            buyerMatchedAt: null,
            paymentWindowExpiresAt: null,
          },
        });

        const roomBuyerCancel = await db.chatRoom.findUnique({ where: { orderId: id } });
        if (roomBuyerCancel) {
          await db.chatMessage.create({
            data: {
              chatRoomId: roomBuyerCancel.id,
              senderId: null,
              type: "SYSTEM",
              content: `Buyer cancelled the order. The listing is now open again on the marketplace.`,
            },
          });
          await db.chatRoom.update({
            where: { orderId: id },
            data: { isActive: false, closedAt: new Date() },
          });
        }
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
