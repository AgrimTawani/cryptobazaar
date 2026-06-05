import webpush from "web-push";
import { Resend } from "resend";
import { db } from "@/lib/db";
import type { ReactElement } from "react";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

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
          if (err.statusCode === 410) {
            await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
          }
        })
    )
  );
}

async function sendEmail(payload: EmailPayload) {
  await resend.emails.send({
    from: "CryptoBazaar <alert@cryptobazaar.co.in>",
    to: payload.to,
    subject: payload.subject,
    react: payload.react,
  });
}

export async function notify(opts: NotifyOptions) {
  const tasks: Promise<void>[] = [];
  if (opts.push)  tasks.push(sendPush(opts.push).catch((e) => console.error("[notify/push]", e)));
  if (opts.email) tasks.push(sendEmail(opts.email).catch((e) => console.error("[notify/email]", e)));
  await Promise.allSettled(tasks);
}
