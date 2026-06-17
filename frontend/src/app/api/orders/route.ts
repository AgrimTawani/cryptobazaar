import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { createElement } from "react";
import OrderCreatedEmail from "@/lib/emails/order-created";

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
  status: string; sellerId: number;
  partialAllowed: boolean;
  minTradeSize: { toString(): string } | null;
  originalAmount: { toString(): string };
  seller: {
    name: string | null; avatarUrl: string | null;
    avgSellerRating: { toNumber(): number } | null;
    sellerRatingCount: number;
    avgSellerConfirmTimeSecs: number | null;
  };
}, currentUserId: number) {
  return {
    id: o.id,
    orderId: o.orderId,
    sellerName: o.seller.name ?? "Anonymous",
    sellerAvatar: o.seller.avatarUrl ?? null,
    sellerAvgRating: o.seller.avgSellerRating?.toNumber() ?? null,
    sellerRatingCount: o.seller.sellerRatingCount,
    sellerAvgReleaseSecs: o.seller.avgSellerConfirmTimeSecs ?? null,
    asset: o.asset,
    chain: o.chain,
    amount: o.amount.toString(),
    partialAllowed: o.partialAllowed,
    minTradeSize: o.minTradeSize?.toString() ?? null,
    originalAmount: o.originalAmount.toString(),
    pricePerUnit: o.pricePerUnit.toString(),
    totalValueInr: o.totalValueInr.toString(),
    acceptedPaymentMethods: o.acceptedPaymentMethods,
    escrowTxHash: o.escrowTxHash ?? null,
    escrowContractAddress: o.escrowContractAddress ?? null,
    status: o.status,
    statusLabel: STATUS_LABEL[o.status] ?? o.status,
    isMine: o.sellerId === currentUserId,
  };
}

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";

    // Guest (unauthenticated) — return public listing with redacted seller info
    if (!clerkId) {
      // "mine" makes no sense without auth
      if (mine) return NextResponse.json([]);

      const orders = await db.order.findMany({
        where: { status: "LISTED" },
        include: { seller: { select: { name: true, avatarUrl: true, avgSellerRating: true, sellerRatingCount: true, avgSellerConfirmTimeSecs: true } } },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        orders.map((o) => ({
          id: o.id,
          orderId: o.orderId,
          sellerName: "••••••",
          sellerAvatar: null,
          sellerAvgRating: o.seller.avgSellerRating?.toNumber() ?? null,
          sellerRatingCount: o.seller.sellerRatingCount,
          sellerAvgReleaseSecs: o.seller.avgSellerConfirmTimeSecs ?? null,
          asset: o.asset,
          chain: o.chain,
          amount: o.amount.toString(),
          partialAllowed: o.partialAllowed,
          minTradeSize: o.minTradeSize?.toString() ?? null,
          originalAmount: o.originalAmount.toString(),
          pricePerUnit: o.pricePerUnit.toString(),
          totalValueInr: o.totalValueInr.toString(),
          acceptedPaymentMethods: o.acceptedPaymentMethods,
          escrowTxHash: o.escrowTxHash ?? null,
          escrowContractAddress: o.escrowContractAddress ?? null,
          status: o.status,
          statusLabel: STATUS_LABEL[o.status] ?? o.status,
          isMine: false,
          guest: true,
        }))
      );
    }

    // Authenticated flow
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (mine) {
      const orders = await db.order.findMany({
        where: {
          status: { in: ACTIVE_STATUSES as never[] },
          OR: [{ sellerId: user.id }, { buyerId: user.id }],
        },
        include: { seller: { select: { name: true, avatarUrl: true, avgSellerRating: true, sellerRatingCount: true, avgSellerConfirmTimeSecs: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders.map((o) => mapOrder(o, user.id)));
    }

    // Public marketplace - LISTED only, include own orders (marked isMine)
    const orders = await db.order.findMany({
      where: { status: "LISTED" },
      include: { seller: { select: { name: true, avatarUrl: true, avgSellerRating: true, sellerRatingCount: true, avgSellerConfirmTimeSecs: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders.map((o) => mapOrder(o, user.id)));
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
      orderId, chain, asset, amount, pricePerUnit,
      escrowTxHash, escrowContractAddress, paymentMethods,
      partialAllowed, minOrderAmount,
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
        sellerUpiId: user.upiId ?? null,
        sellerBankAccount: user.bankAccount ?? null,
        sellerIfsc: user.ifscCode ?? null,
        status: "LISTED",
        partialAllowed:  partialAllowed ?? false,
        originalAmount:  amountNum,
        minTradeSize:    (partialAllowed && minOrderAmount) ? minOrderAmount : null,
      },
    });

    await notify({
      push: {
        userId: user.id,
        title: "Listing is live!",
        body: `Your ${amountNum} ${asset} order is on the marketplace`,
        url: `/marketplace/${order.id}`,
      },
      ...(user.email ? {
        email: {
          to: user.email,
          subject: `Your ${amountNum} ${asset} listing is live on CryptoBazaar`,
          react: createElement(OrderCreatedEmail, {
            sellerName: user.name ?? "Seller",
            amount: String(amountNum),
            asset,
            pricePerUnit: String(priceNum),
            orderId: order.id,
            displayId: order.displayId,
          }),
        },
      } : {}),
    }).catch(() => {});

    return NextResponse.json({ id: order.id, orderId: order.orderId });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
