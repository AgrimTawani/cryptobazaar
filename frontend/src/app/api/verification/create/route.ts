import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const apiKey = process.env.DIDIT_API_KEY;
    const workflowId = process.env.DIDIT_WORKFLOW_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!apiKey || !workflowId) {
      return NextResponse.json({ error: "Didit not configured" }, { status: 500 });
    }

    const res = await fetch(`${process.env.DIDIT_API_URL}/v3/session/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: user.id,
        callback: `${appUrl}/onboarding/kyc/callback`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[didit/create] error:", data);
      return NextResponse.json({ error: data.message || "Didit session failed" }, { status: 502 });
    }

    const sessionId = data.session_id;
    const sessionUrl = data.url;

    await db.user.update({
      where: { id: user.id },
      data: { kycSessionId: sessionId },
    });

    const existing = await db.onboardingRecord.findFirst({
      where: { userId: user.id, layer: "KYC" },
      orderBy: { attemptNumber: "desc" },
    });

    await db.onboardingRecord.create({
      data: {
        userId: user.id,
        layer: "KYC",
        status: "IN_PROGRESS",
        attemptNumber: existing ? existing.attemptNumber + 1 : 1,
      },
    });

    return NextResponse.json({ sessionUrl });
  } catch (err) {
    console.error("[didit/create]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
