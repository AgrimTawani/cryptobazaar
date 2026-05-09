import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await db.onboardingRecord.findFirst({
    where: { userId: user.id, layer: "INTERVIEW" },
    orderBy: { attemptNumber: "desc" },
  });

  if (existing) {
    await db.onboardingRecord.update({
      where: { id: existing.id },
      data: { status: "PASSED", completedAt: new Date(), result: { dev: true } },
    });
  } else {
    await db.onboardingRecord.create({
      data: {
        userId: user.id,
        layer: "INTERVIEW",
        status: "PASSED",
        attemptNumber: 1,
        completedAt: new Date(),
        result: { dev: true },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
