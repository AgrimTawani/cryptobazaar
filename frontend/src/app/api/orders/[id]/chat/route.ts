import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";

const TERMINAL = ["COMPLETED", "CANCELLED", "EXPIRED", "DISPUTE_RESOLVED_BUYER", "DISPUTE_RESOLVED_SELLER"];

async function resolveParties(id: string, clerkId: string) {
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return null;

  const order = await db.order.findUnique({
    where: { id },
    include: { chatRoom: { include: { messages: { include: { sender: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: "asc" } } } } },
  });
  if (!order) return null;

  const isSeller = user.id === order.sellerId;
  const isBuyer  = user.id === order.buyerId;
  if (!isSeller && !isBuyer) return null;

  return { user, order, isSeller, isBuyer };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await resolveParties(id, clerkId);
    if (!ctx) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    const room = ctx.order.chatRoom;
    const messages = room?.messages ?? [];

    // Mark messages from the other party as read
    if (room) {
      await db.chatMessage.updateMany({
        where: {
          chatRoomId: room.id,
          senderId: { not: ctx.user.id },
          isRead: false,
          type: "TEXT",
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        mine: m.senderId === ctx.user.id,
        isRead: m.isRead,
        senderName: m.sender?.name ?? null,
        senderAvatar: m.sender?.avatarUrl ?? null,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("[chat GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ctx = await resolveParties(id, clerkId);
    if (!ctx) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    if (TERMINAL.includes(ctx.order.status)) {
      return NextResponse.json({ error: "Chat is closed for this order" }, { status: 400 });
    }

    const room = ctx.order.chatRoom;
    if (!room) return NextResponse.json({ error: "Chat room not yet open" }, { status: 400 });

    const { content } = await req.json() as { content: string };
    if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const msg = await db.chatMessage.create({
      data: {
        chatRoomId: room.id,
        senderId: ctx.user.id,
        type: "TEXT",
        content: content.trim(),
      },
      include: { sender: { select: { name: true, avatarUrl: true } } },
    });

    // Push-only notification to counterparty (no email for chat)
    const counterpartyId = ctx.isSeller ? ctx.order.buyerId : ctx.order.sellerId;
    if (counterpartyId) {
      notify({
        push: {
          userId: counterpartyId,
          title: ctx.user.name ?? "New message",
          body: content.trim().slice(0, 80),
          url: `/marketplace/${id}`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      senderId: msg.senderId,
      senderName: msg.sender?.name ?? null,
      senderAvatar: msg.sender?.avatarUrl ?? null,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[chat POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
