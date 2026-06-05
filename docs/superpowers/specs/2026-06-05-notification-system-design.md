# Notification System Design
**Date:** 2026-06-05
**Project:** CryptoBazaar

---

## Overview

Add a dual-channel notification system (browser push + email) to alert buyers and sellers about time-sensitive trade events. The system must be reliable enough that a seller never misses a "buyer locked your order" event even when their tab is closed.

---

## Event Matrix

| Event | API trigger point | Push recipients | Email recipients |
|---|---|---|---|
| Order created | `POST /api/orders` | Seller | Seller |
| Buyer locks order | `PATCH action:lock` | Seller (urgent), Buyer | Seller, Buyer |
| Buyer submits payment | `PATCH action:markPaid` | Seller (urgent), Buyer | Seller, Buyer |
| Seller confirms / releases | `PATCH action:confirm` | Buyer, Seller | Buyer, Seller |
| Dispute raised | `PATCH action:dispute` | Buyer, Seller | Buyer, Seller, admin (alert@cryptobazaar.co.in) |
| Buyer cancels lock | `PATCH action:buyerCancel` — frontend calls on-chain `buyerCancel()` first, then calls this API to update DB status back to LISTED and fire notification (same pattern as `timeout`) | Seller | Seller |
| Order times out | `PATCH action:timeout` | Buyer | Buyer |
| Chat message | `POST /api/orders/[id]/chat` | Counterparty (push only, no email) | None |

---

## Technology

- **Email:** Resend (`resend` npm package) with React Email templates (`@react-email/components`)
- **Sender:** `alert@cryptobazaar.co.in` — Resend DNS records must be added to verify this domain
- **Browser push:** Web Push API — native, no third-party service. VAPID key pair generated once and stored in env vars
- **Push subscriptions:** Stored in `push_subscriptions` DB table (one row per browser per user)

---

## Architecture

### Central dispatcher: `src/lib/notify.ts`

Single function called from every API route after the DB write:

```ts
await notify({
  push:  { userId: 42, title: "Buyer locked your order", body: "Arpit locked 5 USDC · ₹500", url: "/marketplace/abc123" },
  email: { to: "seller@example.com", template: "order-locked", data: { buyerName, amount, asset, totalInr, orderId } }
})
```

`notify()` fans out to `sendPush()` and `sendEmail()` concurrently. Either channel failing must not crash the other or throw to the caller — both are fire-and-forget with silent error logging.

### Email: `src/lib/emails/`

One React Email template file per event:

```
src/lib/emails/
  order-created.tsx          seller only
  order-locked.tsx           role: "seller" | "buyer" — different subject/copy per role
  payment-submitted.tsx      role: "seller" | "buyer" — different subject/copy per role
  payment-confirmed.tsx      buyer only
  dispute-raised.tsx         role: "seller" | "buyer" | "admin"
  buyer-cancelled.tsx        seller only
  order-timed-out.tsx        buyer only
```

Each template accepts `role` + typed `data` props and renders different subject lines and body copy per role. All templates share a consistent branded layout with the CryptoBazaar name, event summary, and a CTA button linking to the trade page. The `notify()` caller passes the correct role when sending to each recipient.

### Browser push: service worker + VAPID

- `public/sw.js` — service worker that:
  1. Receives `push` event
  2. Checks `clients.matchAll({ type: 'window' })` — if the exact trade URL is open and visible, skips the OS notification (the page handles it with an in-app toast)
  3. Otherwise shows an OS-level notification with title, body, and the trade URL as the click target
- VAPID keys stored as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` env vars
- `src/app/api/notifications/subscribe/route.ts` — authenticated POST that upserts a `PushSubscription` row for the current user
- `src/app/api/notifications/unsubscribe/route.ts` — authenticated DELETE

### Chat message throttle

Push fires immediately on every chat message. The service worker focus-check handles suppression when the user is actively on the trade page. No email is sent for chat messages.

---

## Schema Addition

```prisma
model PushSubscription {
  id        String   @id @default(uuid())
  userId    Int      @map("user_id")
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("push_subscriptions")
}
```

`User` model gets a `pushSubscriptions PushSubscription[]` relation.

---

## UI: Enable Notifications

### Component: `src/components/EnableNotifications.tsx`

- Checks `Notification.permission` on mount
- States: `default` (not asked), `granted` (enabled), `denied` (blocked)
- On click: calls `requestPermission()`, registers service worker, POSTs subscription to `/api/notifications/subscribe`
- Shows a lock icon + "Notifications blocked — enable in browser settings" if `denied`

### Placement

1. **Dashboard page** (`/dashboard`) — banner card at the top of the page, shown only when `permission !== 'granted'`. Dismissible per session.
2. **Trade chat page** (`/marketplace/[id]`) — small inline button in the chat header alongside the timer, shown only when `permission !== 'granted'`.

---

## Environment Variables Required

```
RESEND_API_KEY=re_...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:alert@cryptobazaar.co.in
```

---

## Files Created / Modified

### New
- `src/lib/notify.ts`
- `src/lib/emails/order-created.tsx`
- `src/lib/emails/order-locked.tsx`
- `src/lib/emails/payment-submitted.tsx`
- `src/lib/emails/payment-confirmed.tsx`
- `src/lib/emails/dispute-raised.tsx`
- `src/lib/emails/buyer-cancelled.tsx`
- `src/lib/emails/order-timed-out.tsx`
- `public/sw.js`
- `src/app/api/notifications/subscribe/route.ts`
- `src/app/api/notifications/unsubscribe/route.ts`
- `src/components/EnableNotifications.tsx`

### Modified
- `frontend/prisma/schema.prisma` — add `PushSubscription` model + relation on `User`
- `src/app/api/orders/route.ts` — add `notify()` on order created
- `src/app/api/orders/[id]/route.ts` — add `notify()` on lock, markPaid, confirm, dispute, cancel, timeout
- `src/app/api/orders/[id]/chat/route.ts` — add push notify on message sent
- `src/app/dashboard/page.tsx` — add `<EnableNotifications />` banner
- `src/app/marketplace/[id]/page.tsx` — add `<EnableNotifications />` in chat header
- `src/middleware.ts` — add `/api/notifications/(.*)` to public routes? No — these are authenticated routes, leave as-is

---

## Out of Scope

- In-app notification bell / unread count (future)
- Email for chat messages
- SMS notifications
- Admin notification dashboard
