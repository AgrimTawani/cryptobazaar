import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function speedRating(secs: number | null, role: "buyer" | "seller"): number {
  if (!secs || secs <= 0) return 3;
  if (role === "buyer") {
    if (secs <= 300)  return 5;
    if (secs <= 600)  return 4;
    if (secs <= 1200) return 3;
    if (secs <= 1500) return 2;
    return 1;
  } else {
    if (secs <= 120)  return 5;
    if (secs <= 300)  return 4;
    if (secs <= 600)  return 3;
    if (secs <= 1200) return 2;
    return 1;
  }
}

function rollingAvg(current: number | null, count: number, next: number) {
  return ((current ?? 0) * count + next) / (count + 1);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const order = await db.order.findUnique({
      where: { id },
      include: { ratings: { select: { raterId: true } } },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "COMPLETED")
      return NextResponse.json({ error: "Order not completed" }, { status: 400 });

    const isSeller = order.sellerId === user.id;
    const isBuyer  = order.buyerId  === user.id;
    if (!isSeller && !isBuyer)
      return NextResponse.json({ error: "Not a party to this order" }, { status: 403 });

    if (order.ratings.some((r) => r.raterId === user.id))
      return NextResponse.json({ error: "Already rated" }, { status: 409 });

    const { politenessRating, overallRating, comment } = await req.json() as {
      politenessRating: number;
      overallRating: number;
      comment?: string;
    };

    if (
      !Number.isInteger(politenessRating) || politenessRating < 1 || politenessRating > 5 ||
      !Number.isInteger(overallRating)    || overallRating    < 1 || overallRating    > 5
    ) return NextResponse.json({ error: "Ratings must be 1–5" }, { status: 400 });

    const raterRole   = isSeller ? "seller" : "buyer";
    const ratedUserId = isSeller ? order.buyerId! : order.sellerId;

    // Speed is auto-computed from timing data — no manual input needed
    const speed = speedRating(
      isSeller ? order.sellerConfirmTimeSecs : order.buyerPaymentTimeSecs,
      raterRole
    );

    await db.tradeRating.create({
      data: {
        orderId: id,
        raterId: user.id,
        ratedUserId,
        raterRole,
        speedRating:      speed,
        politenessRating,
        overallRating,
        comment: comment?.trim() || null,
      },
    });

    // Update rolling averages on the rated user
    const rated = await db.user.findUnique({ where: { id: ratedUserId } });
    if (!rated) return NextResponse.json({ ok: true });

    if (isSeller) {
      // Seller rates the buyer
      const c = rated.buyerRatingCount;
      await db.user.update({
        where: { id: ratedUserId },
        data: {
          buyerRatingCount:        c + 1,
          avgBuyerRating:          rollingAvg(rated.avgBuyerRating?.toNumber() ?? null, c, overallRating),
          avgBuyerSpeedRating:     rollingAvg(rated.avgBuyerSpeedRating?.toNumber() ?? null, c, speed),
          avgBuyerPoliteness:      rollingAvg(rated.avgBuyerPoliteness?.toNumber() ?? null, c, politenessRating),
          avgBuyerPaymentTimeSecs: order.buyerPaymentTimeSecs
            ? Math.round(rollingAvg(rated.avgBuyerPaymentTimeSecs, c, order.buyerPaymentTimeSecs))
            : rated.avgBuyerPaymentTimeSecs,
        },
      });
    } else {
      // Buyer rates the seller
      const c = rated.sellerRatingCount;
      await db.user.update({
        where: { id: ratedUserId },
        data: {
          sellerRatingCount:        c + 1,
          avgSellerRating:          rollingAvg(rated.avgSellerRating?.toNumber() ?? null, c, overallRating),
          avgSellerSpeedRating:     rollingAvg(rated.avgSellerSpeedRating?.toNumber() ?? null, c, speed),
          avgSellerPoliteness:      rollingAvg(rated.avgSellerPoliteness?.toNumber() ?? null, c, politenessRating),
          avgSellerConfirmTimeSecs: order.sellerConfirmTimeSecs
            ? Math.round(rollingAvg(rated.avgSellerConfirmTimeSecs, c, order.sellerConfirmTimeSecs))
            : rated.avgSellerConfirmTimeSecs,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[rate]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
