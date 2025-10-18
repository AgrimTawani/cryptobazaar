import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, address, age, pan } = body;

    console.log("Onboarding API received:", { firstName, lastName, address, age, pan, clerkId: user.id });

    // Validate required fields
    if (!firstName || !lastName || !address || !age || !pan) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Upsert user profile with onboarding data (update or create if not exists)
    const updatedProfile = await prisma.userProfile.upsert({
      where: { clerkId: user.id },
      update: {
        firstName,
        lastName,
        address,
        age: parseInt(age),
        pan,
      },
      create: {
        clerkId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress ?? null,
        firstName,
        lastName,
        address,
        age: parseInt(age),
        pan,
      },
    });

    console.log("Profile updated successfully:", updatedProfile);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
