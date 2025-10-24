import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Fetch current user's orders
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!userProfile) {
      return NextResponse.json([]);
    }

    // Check if we should include all orders or just active ones
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("includeAll") === "true";

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: {
        sellerId: userProfile.id,
        ...(includeAll ? {} : {
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
