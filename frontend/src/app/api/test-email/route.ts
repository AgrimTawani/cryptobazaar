import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      GMAIL_USER: process.env.GMAIL_USER ?? "MISSING",
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? "SET" : "MISSING",
    },
  };

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_APP_PASSWORD!,
      },
    });

    // Step 1: verify connection
    await transporter.verify();
    results.smtpVerify = "OK";

    // Step 2: send plain HTML email (no react-email, to isolate)
    const info = await transporter.sendMail({
      from: `"CryptoBazaar Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "CryptoBazaar SMTP test",
      html: "<p>SMTP is working from Vercel.</p>",
    });
    results.sendMail = { messageId: info.messageId, response: info.response };
  } catch (err: unknown) {
    results.error = err instanceof Error ? { message: err.message, stack: err.stack } : String(err);
  }

  return NextResponse.json(results);
}
