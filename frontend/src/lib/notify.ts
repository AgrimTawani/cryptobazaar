import webpush from "web-push";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { db } from "@/lib/db";
import type { ReactElement } from "react";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

interface PushPayload {
  userId: number;
  title: string;
  body: string;
  url: string;
}

interface EmailPayload {
  to: string;
  subject: string;
  react: ReactElement;
}

interface NotifyOptions {
  push?: PushPayload;
  email?: EmailPayload;
}

async function sendPush(payload: PushPayload) {
  const subs = await db.pushSubscription.findMany({ where: { userId: payload.userId } });
  const msg = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url });
  await Promise.allSettled(
    subs.map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          msg
        )
        .catch(async (err) => {
          console.error("[sendPush] webpush error", err.statusCode, err.message);
          if (err.statusCode === 410) {
            await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
          }
        })
    )
  );
}

async function sendEmail(payload: EmailPayload) {
  const html = await render(payload.react);
  await transporter.sendMail({
    from: `"CryptoBazaar" <${process.env.GMAIL_USER}>`,
    to: payload.to,
    subject: payload.subject,
    html,
  });
}

export async function notify(opts: NotifyOptions) {
  const tasks: Promise<void>[] = [];
  if (opts.push)  tasks.push(sendPush(opts.push).catch((e) => console.error("[notify/push]", e)));
  if (opts.email) tasks.push(sendEmail(opts.email).catch((e) => console.error("[notify/email]", e)));
  await Promise.allSettled(tasks);
}
