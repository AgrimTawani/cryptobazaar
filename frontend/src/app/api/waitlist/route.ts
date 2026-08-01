import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Basic RFC-ish email check — keep it forgiving, DB unique constraint is the real gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public endpoint — intentionally NO auth() so logged-out visitors can join.
export async function GET() {
  try {
    const count = await db.waitlistEntry.count();
    return NextResponse.json({ count });
  } catch (err) {
    console.error("[waitlist GET]", err);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();
    const source =
      typeof body?.source === "string" && body.source.trim()
        ? body.source.trim().slice(0, 64)
        : "membership";

    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Idempotent join — a repeat email is a success, not an error.
    const existing = await db.waitlistEntry.findUnique({ where: { email } });
    let alreadyJoined = Boolean(existing);

    if (!existing) {
      try {
        await db.waitlistEntry.create({ data: { email, source } });
      } catch (e) {
        // Unique-constraint race (P2002): another request created it first — still a success.
        if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
          alreadyJoined = true;
        } else {
          throw e;
        }
      }
    }

    const count = await db.waitlistEntry.count();
    return NextResponse.json({ ok: true, count, alreadyJoined });
  } catch (err) {
    console.error("[waitlist POST]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
