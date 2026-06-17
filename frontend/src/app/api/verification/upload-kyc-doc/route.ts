import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { r2 } from "@/lib/r2";

export const maxDuration = 30;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null; // "aadhaar" | "pan"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!docType || !["aadhaar", "pan"].includes(docType))
      return NextResponse.json({ error: "Invalid docType" }, { status: 400 });

    const ext = ALLOWED_TYPES[file.type];
    if (!ext)
      return NextResponse.json({ error: "Only JPEG, PNG, WEBP, or PDF allowed" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: "Max file size is 10MB" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    // Organised as: kyc/{userId}/aadhaar.{ext} or kyc/{userId}/pan.{ext}
    const key = `kyc/${user.id}/${docType}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: file.type,
    }));

    // Save R2 key to user row
    await db.user.update({
      where: { id: user.id },
      data: docType === "aadhaar" ? { aadhaarR2Key: key } : { panR2Key: key },
    });

    return NextResponse.json({ r2Key: key });
  } catch (err) {
    console.error("[upload-kyc-doc]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
