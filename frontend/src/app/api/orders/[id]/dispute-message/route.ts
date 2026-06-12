import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { r2 } from "@/lib/r2";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

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

    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isParty = user.id === order.sellerId || user.id === order.buyerId;
    if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const dispute = await db.dispute.findUnique({ where: { orderId: id } });
    if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 });

    const formData = await req.formData();
    const content = (formData.get("content") as string | null)?.trim();
    const file = formData.get("file") as File | null;

    if (!content) return NextResponse.json({ error: "Message content required" }, { status: 400 });

    let fileKey: string | null = null;
    if (file) {
      const ext = ALLOWED_TYPES[file.type];
      if (!ext) return NextResponse.json({ error: "Only PNG, JPG, WebP, or PDF allowed" }, { status: 400 });
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });

      const bytes = await file.arrayBuffer();
      fileKey = `disputes/${dispute.id}/reply-${user.id}-${Date.now()}.${ext}`;
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
        Body: Buffer.from(bytes),
        ContentType: file.type,
      }));
    }

    await db.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        fromAdmin: false,
        senderId: user.id,
        content,
        fileKey,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[dispute-message POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
