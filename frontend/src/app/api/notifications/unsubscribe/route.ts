import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { endpoint } = await request.json();
    if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });

    await db.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notifications/unsubscribe DELETE]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
