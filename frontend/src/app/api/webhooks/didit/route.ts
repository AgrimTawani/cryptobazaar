import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

function verifySignature(payload: string, timestamp: string, signature: string): boolean {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret || secret === "your_webhook_secret_here") return true; // skip in dev until secret is set

  const canonical = `${timestamp}:${payload}`;
  const expected = createHmac("sha256", secret).update(canonical).digest("hex");
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

    if (!verifySignature(body, timestamp, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { session_id, status, vendor_data: userId, decision } = payload;

    if (!userId || !session_id) {
      return NextResponse.json({ error: "Missing vendor_data or session_id" }, { status: 400 });
    }

    const passed = status === "Approved";
    const failed = status === "Declined";

    if (!passed && !failed) {
      // Intermediate status (In Progress, In Review) — acknowledge but don't update
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
          rejectionReason: failed ? (decision?.id_verifications?.[0]?.status ?? "Declined") : null,
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
