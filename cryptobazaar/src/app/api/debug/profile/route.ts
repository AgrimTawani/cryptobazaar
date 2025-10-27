import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Debug endpoint to check user profile status
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ 
        error: "Not authenticated",
        authenticated: false 
      });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    return NextResponse.json({
      authenticated: true,
      clerkId: userId,
      hasProfile: !!userProfile,
      profile: userProfile,
      message: userProfile 
        ? "✅ Profile exists - you can create orders" 
        : "❌ No profile found - please complete onboarding at /onboarding"
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ 
      error: String(error),
      authenticated: false 
    }, { status: 500 });
  }
}
