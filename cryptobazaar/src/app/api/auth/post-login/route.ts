import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const email = user.emailAddresses?.[0]?.emailAddress ?? null;

  // Upsert user with clerkId
  const userProfile = await prisma.userProfile.upsert({
    where: { clerkId: user.id },
    update: { email },
    create: { clerkId: user.id, email },
  });

  // Check if profile is complete (all required fields filled)
  const isOnboarded = Boolean(
    userProfile.firstName &&
    userProfile.lastName &&
    userProfile.address &&
    userProfile.age &&
    userProfile.pan
  );

  return NextResponse.json({ onboarded: isOnboarded });
}
