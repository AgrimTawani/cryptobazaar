import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { name, phone, dateOfBirth, aadhaarNumber, panNumber } = await req.json() as {
      name: string;
      phone: string;
      dateOfBirth: string; // YYYY-MM-DD
      aadhaarNumber: string; // 12 digits — we store only last 4
      panNumber: string;     // 10-char PAN — we store masked (ABCDE1234F → ABCDE****F)
    };

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    if (!dateOfBirth) return NextResponse.json({ error: "Date of birth is required" }, { status: 400 });
    if (!aadhaarNumber || aadhaarNumber.replace(/\s/g, "").length !== 12)
      return NextResponse.json({ error: "Aadhaar must be 12 digits" }, { status: 400 });
    if (!panNumber || panNumber.trim().length !== 10)
      return NextResponse.json({ error: "PAN must be 10 characters" }, { status: 400 });

    const aadhaarClean = aadhaarNumber.replace(/\s/g, "");
    const aadhaarLast4 = aadhaarClean.slice(-4);
    const pan = panNumber.trim().toUpperCase();
    const panMasked = pan.slice(0, 5) + "****" + pan.slice(-1);

    await db.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        dateOfBirth: new Date(dateOfBirth),
        aadhaarLast4,
        panMasked,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[save-kyc-details]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
