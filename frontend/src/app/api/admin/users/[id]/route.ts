import { db } from "@/lib/db";
import { isSecondaryPasswordUnlocked } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

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

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[Admin User Update]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
