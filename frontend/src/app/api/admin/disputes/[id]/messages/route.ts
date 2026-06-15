import { createElement } from "react";
import { db } from "@/lib/db";
import { isSecondaryPasswordUnlocked } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/notify";
import AdminEvidenceRequestEmail from "@/lib/emails/admin-evidence-request";

const checkAuth = () => isSecondaryPasswordUnlocked();

// GET — all messages for a dispute (admin sees everything)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const messages = await db.disputeMessage.findMany({
      where: { disputeId: id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("[admin/disputes/messages GET]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — admin sends a message/request to buyer, seller, or both
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const { content, toRole } = await req.json() as { content: string; toRole: "buyer" | "seller" | null };

    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            seller: { select: { id: true, name: true, email: true } },
            buyer:  { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 });

    await db.disputeMessage.create({
      data: {
        disputeId: id,
        fromAdmin: true,
        toRole: toRole ?? null,
        content: content.trim(),
      },
    });

    // Notify the relevant party/parties (push + email)
    const notifyUser = async (user: { id: number; name: string | null; email: string | null } | null | undefined) => {
      if (!user) return;
      await notify({
        push: {
          userId: user.id,
          title: "Admin requests more information",
          body: content.trim().slice(0, 80),
          url: `/marketplace/${dispute.order.id}`,
        },
        ...(user.email ? {
          email: {
            to: user.email,
            subject: "Additional information requested for your dispute",
            react: createElement(AdminEvidenceRequestEmail, {
              name: user.name ?? "there",
              message: content.trim(),
              orderId: dispute.order.id,
            }),
          },
        } : {}),
      }).catch(() => {});
    };

    if (!toRole || toRole === "seller") await notifyUser(dispute.order.seller);
    if (!toRole || toRole === "buyer")  await notifyUser(dispute.order.buyer);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/disputes/messages POST]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
