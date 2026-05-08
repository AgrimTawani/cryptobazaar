import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
    const avatarUrl = clerkUser.imageUrl ?? null;

    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: { email, name, avatarUrl },
      create: { clerkId: userId, email, name, avatarUrl, status: "LOGIN_DONE" },
    });

    console.log("[sync] ok:", user.id);
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[sync] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
