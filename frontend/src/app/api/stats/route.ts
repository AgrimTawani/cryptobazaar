import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [verifiedMembers, completedOrders] = await Promise.all([
    db.user.count({ where: { status: "VERIFIED" } }),
    db.order.findMany({
      where: { status: "COMPLETED" },
      select: { totalValueInr: true },
    }),
  ]);

  const totalTrades = completedOrders.length;
  const totalVolumeInr = completedOrders.reduce(
    (sum, o) => sum + parseFloat(o.totalValueInr.toString()),
    0
  );

  return NextResponse.json({ verifiedMembers, totalTrades, totalVolumeInr });
}
