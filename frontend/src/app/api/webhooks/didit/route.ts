import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

const MAX_AGE_SECS = 300; // reject webhooks older than 5 minutes

function verifySimpleSignature(
  sessionId: string,
  status: string,
  webhookType: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  // Didit X-Signature-Simple format: HMAC-SHA256("{timestamp}:{session_id}:{status}:{webhook_type}")
  const message = `${timestamp}:${sessionId}:${status}:${webhookType}`;
  const expected = createHmac("sha256", secret).update(message).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const timestamp = req.headers.get("x-timestamp") ?? "";
    const signature = req.headers.get("x-signature-simple") ?? "";

    const payload = JSON.parse(body);
    const { session_id, status, vendor_data: userId, decision, webhook_type } = payload;

    if (!userId || !session_id) {
      return NextResponse.json({ error: "Missing vendor_data or session_id" }, { status: 400 });
    }

    const secret = process.env.DIDIT_WEBHOOK_SECRET;
    const isDevSkip = !secret || secret === "your_webhook_secret_here";

    if (!isDevSkip) {
      // 1. Freshness check — reject stale replays
      const ts = parseInt(timestamp, 10);
      if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_AGE_SECS) {
        console.warn("[webhook/didit] stale timestamp:", timestamp);
        return NextResponse.json({ error: "Stale webhook" }, { status: 401 });
      }

      // 2. Signature check
      if (
        !signature ||
        !verifySimpleSignature(session_id, status, webhook_type ?? "", timestamp, signature, secret)
      ) {
        console.warn("[webhook/didit] invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const passed = status === "Approved";
    const failed = status === "Declined";

    if (!passed && !failed) {
      // Intermediate status (In Progress, In Review) — acknowledge but don't act
      return NextResponse.json({ received: true });
    }

    const record = await db.onboardingRecord.findFirst({
      where: { userId, layer: "KYC", status: "IN_PROGRESS" },
      orderBy: { attemptNumber: "desc" },
    });

    if (record) {
      await db.onboardingRecord.update({
        where: { id: record.id },
        data: {
          status: passed ? "PASSED" : "FAILED",
          result: decision ?? {},
          completedAt: new Date(),
          rejectionReason: failed
            ? (decision?.id_verifications?.[0]?.status ?? "Declined")
            : null,
        },
      });
    }

    if (passed) {
      await db.user.update({
        where: { id: userId },
        data: {
          kycSessionId: session_id,
          kycVerifiedAt: new Date(),
          status: "WALLET_PENDING",
        },
      });
    }

    console.log(`[webhook/didit] session=${session_id} status=${status} user=${userId}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook/didit]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
