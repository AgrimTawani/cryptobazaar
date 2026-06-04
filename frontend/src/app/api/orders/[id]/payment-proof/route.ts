import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/lib/db";
import { r2 } from "@/lib/r2";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png":  "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
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
    if (user.id !== order.buyerId) return NextResponse.json({ error: "Only buyer can upload payment proof" }, { status: 403 });
    if (order.status !== "BUYER_MATCHED") return NextResponse.json({ error: "Invalid order state" }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return NextResponse.json({ error: "Only PNG, JPEG, or WebP images allowed" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5MB" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const key = `screenshots/${id}/${Date.now()}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: file.type,
    }));

    await db.order.update({
      where: { id },
      data: { paymentScreenshotIpfs: key },
    });

    return NextResponse.json({ r2Key: key });
  } catch (err) {
    console.error("[payment-proof POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
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

    if (!order.paymentScreenshotIpfs) return NextResponse.json({ url: null });

    // Pre-signed URL — works with private buckets, expires in 1 hour
    const url = await getSignedUrl(
      // @ts-expect-error S3Client typing mismatch with getSignedUrl
      r2,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: order.paymentScreenshotIpfs,
      }),
      { expiresIn: 3600 }
    );

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[payment-proof GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
