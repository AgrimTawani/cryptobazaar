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

// GET — fetch this order's dispute + messages visible to the current user
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

    const role = user.id === order.sellerId ? "seller" : "buyer";

    const dispute = await db.dispute.findUnique({
      where: { orderId: id },
      include: {
        messages: {
          where: {
            OR: [
              { fromAdmin: true, toRole: role },
              { fromAdmin: true, toRole: null },
              { fromAdmin: false, senderId: user.id },
            ],
          },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            fromAdmin: true,
            content: true,
            fileKey: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dispute) return NextResponse.json({ error: "No dispute found" }, { status: 404 });

    const myStatement = role === "buyer" ? dispute.buyerStatement : dispute.sellerStatement;
    const myEvidenceSubmittedAt = role === "buyer"
      ? dispute.buyerEvidenceSubmittedAt
      : dispute.sellerEvidenceSubmittedAt;

    return NextResponse.json({
      disputeId: dispute.id,
      status: dispute.status,
      evidenceDeadline: dispute.evidenceDeadline,
      myStatement,
      myEvidenceSubmittedAt,
      messages: dispute.messages,
    });
  } catch (err) {
    console.error("[dispute GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — submit statement + optional evidence file
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

    if (!["DISPUTED", "EVIDENCE_SUBMITTED", "UNDER_REVIEW"].includes(order.status)) {
      return NextResponse.json({ error: "Order is not in dispute" }, { status: 400 });
    }

    const role = user.id === order.sellerId ? "seller" : "buyer";
    const dispute = await db.dispute.findUnique({ where: { orderId: id } });
    if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 });

    const formData = await req.formData();
    const statement = (formData.get("statement") as string | null)?.trim();
    const file = formData.get("file") as File | null;

    if (!statement) return NextResponse.json({ error: "Statement is required" }, { status: 400 });

    let fileKey: string | null = null;
    if (file) {
      const ext = ALLOWED_TYPES[file.type];
      if (!ext) return NextResponse.json({ error: "Only PNG, JPG, WebP, or PDF allowed" }, { status: 400 });
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10MB" }, { status: 400 });

      const bytes = await file.arrayBuffer();
      fileKey = `disputes/${dispute.id}/${role}-evidence-${Date.now()}.${ext}`;
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
        Body: Buffer.from(bytes),
        ContentType: file.type,
      }));
    }

    const now = new Date();
    if (role === "buyer") {
      await db.dispute.update({
        where: { id: dispute.id },
        data: {
          buyerStatement: statement,
          buyerBankStatementIpfs: fileKey ?? dispute.buyerBankStatementIpfs,
          buyerEvidenceSubmittedAt: now,
          status: "EVIDENCE_SUBMITTED",
        },
      });
    } else {
      await db.dispute.update({
        where: { id: dispute.id },
        data: {
          sellerStatement: statement,
          sellerBankStatementIpfs: fileKey ?? dispute.sellerBankStatementIpfs,
          sellerEvidenceSubmittedAt: now,
          status: "EVIDENCE_SUBMITTED",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[dispute POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
