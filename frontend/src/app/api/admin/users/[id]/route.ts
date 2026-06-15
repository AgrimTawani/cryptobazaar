import { createElement } from "react";
import { db } from "@/lib/db";
import { isSecondaryPasswordUnlocked } from "@/lib/admin-auth";
import { NextResponse } from "next/server";
import { notify } from "@/lib/notify";
import AccountApprovedEmail from "@/lib/emails/account-approved";
import AccountRejectedEmail from "@/lib/emails/account-rejected";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isSecondaryPasswordUnlocked())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id, 10);
    const { status } = await req.json();

    const user = await db.user.update({
      where: { id: userId },
      data: { status },
    });

    if (user.email) {
      if (status === "VERIFIED") {
        await notify({
          email: {
            to: user.email,
            subject: "Your CryptoBazaar account has been approved",
            react: createElement(AccountApprovedEmail, { name: user.name ?? "there" }),
          },
        }).catch(() => {});
      } else if (status === "REJECTED") {
        await notify({
          email: {
            to: user.email,
            subject: "Update on your CryptoBazaar account application",
            react: createElement(AccountRejectedEmail, { name: user.name ?? "there" }),
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[Admin User Update]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
