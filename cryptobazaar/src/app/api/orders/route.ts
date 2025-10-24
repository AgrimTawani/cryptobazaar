import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Fetch all active orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        seller: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create a new sell order
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, rate, walletAddress, expiresAt, lockTxHash } = body;

    // Validate input
    if (!amount || !rate || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0 || rate <= 0) {
      return NextResponse.json(
        { error: "Amount and rate must be positive" },
        { status: 400 }
      );
    }

    // Get or create user profile
    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found. Please complete onboarding." },
        { status: 404 }
      );
    }

    // Calculate total
    const total = amount * rate;

    // Create order
    const order = await prisma.order.create({
      data: {
        sellerId: userProfile.id,
        amount: amount,
        rate: rate,
        total: total,
        walletAddress: walletAddress,
        status: "ACTIVE",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        lockTxHash: lockTxHash || null,
      },
      include: {
        seller: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
