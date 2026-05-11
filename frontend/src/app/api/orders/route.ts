import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const orders = await db.order.findMany({
      where: { status: "LISTED" },
      include: { seller: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      orders.map((o) => ({
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
      }))
    );
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
