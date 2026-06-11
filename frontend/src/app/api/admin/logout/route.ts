import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: "admin_token",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return NextResponse.json({ success: true });
}
