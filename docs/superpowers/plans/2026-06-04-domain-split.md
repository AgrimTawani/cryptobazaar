# Domain Split: cryptobazaar.co.in + app.cryptobazaar.co.in Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single Next.js app at `frontend/` into two deployments — a lean landing/auth app at `cryptobazaar.co.in` and a full application at `app.cryptobazaar.co.in` — without rebuilding shared logic.

**Architecture:** Convert the monorepo root into an npm workspace with two apps: `apps/landing/` (marketing page, `/terms`, `/login`, `/sso-callback`, `/api/stats`) and `apps/app/` (everything else). Both apps share the same Neon database and Clerk instance. Clerk's **satellite domain** feature handles cross-domain auth: login happens on the primary domain (`cryptobazaar.co.in`) and sessions are transparently shared to the satellite (`app.cryptobazaar.co.in`). Two separate Vercel projects, each pointing to one app directory.

**Tech Stack:** Next.js 16 App Router · React 19 · Clerk v7 (satellite domains) · Prisma 6 + Neon · Thirdweb 5 · Tailwind CSS v4 · npm workspaces · Turborepo

---

## What I found in the repo (read this before touching anything)

**Repo root:** No workspace config exists yet. The single deployable app lives at `frontend/`. Vercel project `cryptobazaar` (id: `prj_fafDAHnToAaj4NYgeI6P3wR2Q4gX`, team `team_yOcSeaw9MklWWeClKau0qxYk`) has `directory: "frontend"` set.

**Current routes:**
- Public/landing: `/` · `/terms` · `/login` · `/sso-callback` · `/api/stats`
- App (require auth or wallet): `/onboarding/**` · `/dashboard` · `/marketplace` · `/marketplace/[id]` · `/marketplace/sell`
- API (app): `/api/users/sync` · `/api/onboarding/**` · `/api/orders/**` · `/api/dashboard/**` · `/api/wallet/**` · `/api/verification/**` · `/api/webhooks/didit`

**Auth:** Clerk v7, Google OAuth only. Sessions are Clerk-managed JWTs stored in Clerk's own cookie. **There is no `middleware.ts` currently** — all auth checks are client-side (`useUser()`) or per-route (`auth()` in API handlers). Clerk middleware is required for satellite domain support.

**After sign-in redirect chain:** `/login` → Clerk OAuth → `/sso-callback` → `redirectUrlComplete: ${window.location.origin}/onboarding`. This hardcoded `window.location.origin` must change to an absolute URL pointing to the app domain.

**Vercel env vars (25 total, all Production-only):** See §3c below for the full split.

**Files shared between landing and app:**
- `src/app/globals.css` — Tailwind config + CSS custom properties (will be duplicated)
- `src/components/ScrollbarThemer.tsx` — 15 lines (will be duplicated)
- `src/app/layout.tsx` — diverges: landing strips Thirdweb, app keeps it
- `src/app/template.tsx` — identical (will be duplicated)

**Critical cross-domain link changes needed in `apps/landing/`:**
- `page.tsx`: `href="/marketplace"` → `https://app.cryptobazaar.co.in/marketplace`
- `page.tsx`: `href="/dashboard"` → `https://app.cryptobazaar.co.in/dashboard`
- `page.tsx`: `<iframe src="/marketplace"` → `src="https://app.cryptobazaar.co.in/marketplace"`
- `login/page.tsx`: `redirectUrlComplete: ${window.location.origin}/onboarding` → `'https://app.cryptobazaar.co.in/onboarding'`
- `sso-callback/page.tsx`: `signInForceRedirectUrl="/onboarding"` → `"https://app.cryptobazaar.co.in/onboarding"`

---

## File Structure (after migration)

```
cryptobazaar/                         ← repo root (was empty of app code)
├── package.json                      ← NEW: npm workspaces root
├── turbo.json                        ← NEW: Turborepo config
├── apps/
│   ├── landing/                      ← MOVED from frontend/ (stripped)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        ← MODIFIED: remove ThirdwebProvider/ThirdwebAutoConnect
│   │   │   │   ├── page.tsx          ← MODIFIED: cross-domain links
│   │   │   │   ├── template.tsx      ← copied as-is
│   │   │   │   ├── globals.css       ← copied as-is
│   │   │   │   ├── icon.png          ← copied as-is
│   │   │   │   ├── robots.ts         ← copied as-is
│   │   │   │   ├── sitemap.ts        ← copied as-is
│   │   │   │   ├── terms/page.tsx    ← copied as-is
│   │   │   │   ├── login/page.tsx    ← MODIFIED: absolute redirectUrlComplete
│   │   │   │   ├── sso-callback/page.tsx  ← MODIFIED: absolute redirect URLs
│   │   │   │   └── api/stats/route.ts     ← MODIFIED: use @neondatabase/serverless directly
│   │   │   └── components/
│   │   │       └── ScrollbarThemer.tsx    ← copied as-is
│   │   ├── middleware.ts             ← NEW: clerkMiddleware() (no route protection)
│   │   ├── package.json              ← MODIFIED: stripped deps (no thirdweb/prisma/R2/Didit/AI)
│   │   ├── next.config.ts            ← MODIFIED: remove serverExternalPackages
│   │   ├── tsconfig.json             ← copied as-is
│   │   ├── postcss.config.mjs        ← copied as-is
│   │   ├── eslint.config.mjs         ← copied as-is
│   │   └── vercel.json               ← MODIFIED: remove long-running function overrides
│   └── app/                          ← MOVED from frontend/ (all routes)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        ← MODIFIED: ClerkProvider gets isSatellite/domain props
│       │   │   ├── template.tsx      ← copied as-is
│       │   │   ├── globals.css       ← copied as-is
│       │   │   ├── icon.png          ← copied as-is
│       │   │   ├── dashboard/
│       │   │   ├── marketplace/
│       │   │   ├── onboarding/
│       │   │   ├── api/              ← all API routes
│       │   │   └── (no page.tsx / terms / login / sso-callback)
│       │   ├── components/           ← all existing components
│       │   └── lib/                  ← all existing lib files
│       ├── prisma/                   ← full schema (unchanged)
│       ├── middleware.ts             ← NEW: clerkMiddleware() for satellite handshake
│       ├── package.json              ← same as current frontend/package.json
│       ├── next.config.ts            ← same as current
│       ├── tsconfig.json             ← same as current
│       ├── postcss.config.mjs        ← same as current
│       ├── eslint.config.mjs         ← same as current
│       └── vercel.json               ← keep long-running function overrides
├── contracts/                        ← untouched
└── docs/                             ← untouched
```

---

## Tasks

### Task 1: Initialize npm workspace root + Turborepo

**Files:**
- Create: `package.json` (repo root)
- Create: `turbo.json` (repo root)

This wires up npm workspaces so `apps/landing` and `apps/app` can be managed together. Turborepo enables `turbo dev` to run both dev servers with one command.

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "cryptobazaar-monorepo",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.5.4"
  }
}
```

Save to: `package.json` (repo root, same level as `contracts/` and `docs/`)

- [ ] **Step 2: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

Save to: `turbo.json` (repo root)

- [ ] **Step 3: Install Turborepo at repo root**

Run from repo root (`/home/agrim22/Desktop/cryptobazaar`):
```bash
npm install
```

Expected output: `node_modules/` created at repo root, turbo installed.

- [ ] **Step 4: Commit**

```bash
git add package.json turbo.json package-lock.json
git commit -m "chore: initialize npm workspace root with Turborepo"
```

---

### Task 2: Create `apps/landing/` — copy and strip the landing app

**Files:**
- Create: `apps/landing/` directory with selected files from `frontend/`

The landing app needs only the public-facing routes. It does NOT need Prisma, Thirdweb, AWS S3, Didit, or Anthropic — those are app-only dependencies.

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p apps/landing/src/app/terms
mkdir -p apps/landing/src/app/login
mkdir -p apps/landing/src/app/sso-callback
mkdir -p apps/landing/src/app/api/stats
mkdir -p apps/landing/src/components
mkdir -p apps/landing/public
```

- [ ] **Step 2: Copy static/config files**

```bash
cp frontend/src/app/globals.css apps/landing/src/app/globals.css
cp frontend/src/app/template.tsx apps/landing/src/app/template.tsx
cp frontend/src/app/robots.ts apps/landing/src/app/robots.ts
cp frontend/src/app/sitemap.ts apps/landing/src/app/sitemap.ts
cp frontend/src/app/icon.png apps/landing/src/app/icon.png
cp frontend/src/app/terms/page.tsx apps/landing/src/app/terms/page.tsx
cp frontend/src/components/ScrollbarThemer.tsx apps/landing/src/components/ScrollbarThemer.tsx
cp frontend/tsconfig.json apps/landing/tsconfig.json
cp frontend/postcss.config.mjs apps/landing/postcss.config.mjs
cp frontend/eslint.config.mjs apps/landing/eslint.config.mjs
cp -r frontend/public/* apps/landing/public/
```

- [ ] **Step 3: Create `apps/landing/package.json`** (stripped deps — no Prisma, Thirdweb, R2, Didit, AI)

```json
{
  "name": "landing",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@clerk/nextjs": "^7.3.2",
    "@neondatabase/serverless": "^1.1.0",
    "framer-motion": "^12.38.0",
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 4: Create `apps/landing/next.config.ts`** (no serverExternalPackages needed)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

- [ ] **Step 5: Create `apps/landing/vercel.json`** (empty — no long-duration functions)

```json
{}
```

- [ ] **Step 6: Copy `frontend/src/app/page.tsx` to `apps/landing/src/app/page.tsx`**

```bash
cp frontend/src/app/page.tsx apps/landing/src/app/page.tsx
```

- [ ] **Step 7: Copy `frontend/src/app/login/page.tsx` and `frontend/src/app/sso-callback/page.tsx`**

```bash
cp frontend/src/app/login/page.tsx apps/landing/src/app/login/page.tsx
cp frontend/src/app/sso-callback/page.tsx apps/landing/src/app/sso-callback/page.tsx
```

- [ ] **Step 8: Commit checkpoint**

```bash
git add apps/landing/
git commit -m "chore: scaffold apps/landing with copied source files"
```

---

### Task 3: Modify `apps/landing/` files for the new domain split

**Files:**
- Modify: `apps/landing/src/app/layout.tsx` (create fresh — no Thirdweb)
- Modify: `apps/landing/src/app/page.tsx` (cross-domain links)
- Modify: `apps/landing/src/app/login/page.tsx` (absolute redirect URL)
- Modify: `apps/landing/src/app/sso-callback/page.tsx` (absolute redirect URLs)
- Create: `apps/landing/src/app/api/stats/route.ts` (neon direct — no Prisma)
- Create: `apps/landing/middleware.ts` (Clerk middleware — required for Clerk to work)

- [ ] **Step 1: Create `apps/landing/src/app/layout.tsx`** (no Thirdweb)

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ScrollbarThemer } from "@/components/ScrollbarThemer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CryptoBazaar",
  description:
    "India's only gated P2P stablecoin exchange. Trade USDT and USDC securely with INR. Every member is verified, and every trade is protected by smart contract escrow.",
  keywords: ["P2P crypto exchange India", "buy USDT INR", "sell USDC INR", "secure crypto trading India", "CryptoBazaar", "crypto escrow", "verified P2P trading"],
  authors: [{ name: "CryptoBazaar" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://cryptobazaar.co.in",
    title: "CryptoBazaar | Gated P2P Stablecoin Exchange for India",
    description: "India's only gated P2P stablecoin exchange. Trade USDT and USDC securely with INR. Every member verified, every trade held in escrow.",
    siteName: "CryptoBazaar",
  },
  twitter: {
    card: "summary_large_image",
    title: "CryptoBazaar | Secure P2P Crypto Exchange",
    description: "Trade USDT and USDC safely in India. Verified members only, smart contract escrow on every trade.",
  },
  alternates: {
    canonical: "https://cryptobazaar.co.in",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital@1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.variable}`}>
          <ScrollbarThemer />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 2: Update cross-domain links in `apps/landing/src/app/page.tsx`**

Find and replace these four occurrences (use your editor's find-replace):

| Find | Replace |
|------|---------|
| `href="/marketplace"` | `href="https://app.cryptobazaar.co.in/marketplace"` |
| `href="/dashboard"` | `href="https://app.cryptobazaar.co.in/dashboard"` |
| `src="/marketplace"` | `src="https://app.cryptobazaar.co.in/marketplace"` |

There are 3 occurrences of `href="/marketplace"` (nav link desktop, nav link mobile, footer), 2 of `href="/dashboard"` (nav desktop, nav mobile), and 1 `src="/marketplace"` in the iframe preview. Update all of them.

- [ ] **Step 3: Update `apps/landing/src/app/login/page.tsx`** — change the `redirectUrlComplete` line

Find:
```typescript
redirectUrlComplete: `${window.location.origin}/onboarding`,
```

Replace with:
```typescript
redirectUrlComplete: 'https://app.cryptobazaar.co.in/onboarding',
```

- [ ] **Step 4: Update `apps/landing/src/app/sso-callback/page.tsx`** — absolute redirect URLs

Replace the entire `AuthenticateWithRedirectCallback` component call:

Find:
```tsx
<AuthenticateWithRedirectCallback
  signInForceRedirectUrl="/onboarding"
  signUpForceRedirectUrl="/onboarding"
/>
```

Replace with:
```tsx
<AuthenticateWithRedirectCallback
  signInForceRedirectUrl="https://app.cryptobazaar.co.in/onboarding"
  signUpForceRedirectUrl="https://app.cryptobazaar.co.in/onboarding"
/>
```

- [ ] **Step 5: Create `apps/landing/src/app/api/stats/route.ts`** (uses `@neondatabase/serverless` directly — no Prisma dependency in the landing app)

```typescript
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE status = 'VERIFIED') AS "verifiedMembers",
        (SELECT COUNT(*)::int FROM orders WHERE status = 'COMPLETED') AS "totalTrades",
        (SELECT COALESCE(SUM(total_value_inr), 0)::float8 FROM orders WHERE status = 'COMPLETED') AS "totalVolumeInr"
    `;
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ verifiedMembers: 0, totalTrades: 0, totalVolumeInr: 0 });
  }
}
```

Note: Table names `users` and `orders` match the `@@map` directives in `prisma/schema.prisma`. The column `total_value_inr` matches `@map("total_value_inr")` on the Order model.

- [ ] **Step 6: Create `apps/landing/middleware.ts`** (Clerk middleware — required for Clerk v7 with App Router)

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
```

This does not protect any routes — it just enables Clerk's session detection on all pages (required by Clerk v7).

- [ ] **Step 7: Commit**

```bash
git add apps/landing/
git commit -m "feat: configure apps/landing for cryptobazaar.co.in split"
```

---

### Task 4: Create `apps/app/` — move the full application

**Files:**
- Create: `apps/app/` from `frontend/` (copy most files, remove landing-only pages)

- [ ] **Step 1: Copy `frontend/` to `apps/app/` (everything except node_modules, .next, .clerk, .env)**

```bash
mkdir -p apps/app
cp -r frontend/src apps/app/src
cp -r frontend/prisma apps/app/prisma
cp -r frontend/public apps/app/public
cp frontend/package.json apps/app/package.json
cp frontend/package-lock.json apps/app/package-lock.json
cp frontend/next.config.ts apps/app/next.config.ts
cp frontend/tsconfig.json apps/app/tsconfig.json
cp frontend/postcss.config.mjs apps/app/postcss.config.mjs
cp frontend/eslint.config.mjs apps/app/eslint.config.mjs
cp frontend/vercel.json apps/app/vercel.json
cp frontend/next-env.d.ts apps/app/next-env.d.ts
```

- [ ] **Step 2: Remove landing-only pages from `apps/app/`**

The app deployment should NOT serve `/`, `/terms`, `/login`, `/sso-callback`, or `/api/stats` (those live on the landing domain). Delete them:

```bash
rm apps/app/src/app/page.tsx
rm -rf apps/app/src/app/terms
rm -rf apps/app/src/app/login
rm -rf apps/app/src/app/sso-callback
rm apps/app/src/app/robots.ts
rm apps/app/src/app/sitemap.ts
rm -rf apps/app/src/app/api/stats
```

- [ ] **Step 3: Create a root redirect page at `apps/app/src/app/page.tsx`**

When someone visits `app.cryptobazaar.co.in/`, redirect them to the landing page:

```typescript
import { redirect } from "next/navigation";

export default function AppRoot() {
  redirect("https://cryptobazaar.co.in");
}
```

- [ ] **Step 4: Update `apps/app/package.json`** — change the `dev` script port so both apps can run simultaneously

Find:
```json
"dev": "NODE_OPTIONS=--max-old-space-size=4096 TURBO_MAX_WORKERS=4 next dev --turbopack",
```

Replace with:
```json
"dev": "NODE_OPTIONS=--max-old-space-size=4096 TURBO_MAX_WORKERS=4 next dev --turbopack --port 3001",
```

- [ ] **Step 5: Create `apps/app/middleware.ts`** (Clerk satellite middleware)

This middleware handles the Clerk satellite domain handshake — without it, unauthenticated users on `app.cryptobazaar.co.in` won't be redirected to sign in properly.

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
```

- [ ] **Step 6: Update `apps/app/src/app/layout.tsx`** — configure Clerk as satellite

Find the `<ClerkProvider>` component (it's the opening tag in the `RootLayout` function). Replace it with:

```tsx
<ClerkProvider
  isSatellite
  domain={process.env.NEXT_PUBLIC_CLERK_DOMAIN ?? "cryptobazaar.co.in"}
  signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "https://cryptobazaar.co.in/login"}
>
```

The `isSatellite` prop tells Clerk that this app is not the primary domain. The `domain` prop tells it where the primary domain is. The `signInUrl` prop tells it where to redirect for sign-in.

- [ ] **Step 7: Commit**

```bash
git add apps/app/
git commit -m "feat: create apps/app from frontend with satellite Clerk config"
```

---

### Task 5: Verify both apps build locally

This catches import errors and missing deps before touching Vercel.

- [ ] **Step 1: Install deps from repo root**

```bash
cd /home/agrim22/Desktop/cryptobazaar && npm install
```

Expected: Both `apps/landing/node_modules` and `apps/app/node_modules` populated (or hoisted to root).

- [ ] **Step 2: Build landing app**

```bash
cd apps/landing && npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` (or similar Next.js build success). If you see TypeScript errors about missing `@/lib/prisma` or `@/lib/db`, those imports were accidentally left in — remove them.

- [ ] **Step 3: Build app**

```bash
cd /home/agrim22/Desktop/cryptobazaar/apps/app && npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully`. If `prisma generate` fails, run `npx prisma generate` inside `apps/app/` first.

- [ ] **Step 4: Fix any TypeScript/import errors before proceeding**

Common issues:
- `apps/landing/` importing from `@/lib/db` or `@/lib/thirdweb` — delete those imports (the stats route uses neon directly)
- `apps/app/` missing an import that was relative to `frontend/src/` — paths should be fine since we copied the full `src/` tree

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: resolve build errors in apps/landing and apps/app"
```

---

### Task 6: Configure Clerk dashboard for satellite domain

This is a Clerk dashboard action — no code changes needed. **Do this before creating the Vercel project for the app, so the satellite is ready when you first deploy.**

- [ ] **Step 1: Log in to Clerk dashboard**

Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) → select the `cryptobazaar.co.in` application instance.

- [ ] **Step 2: Add satellite domain**

Navigate to: **Configure → Domains**

Click **"Add domain"**. Enter: `app.cryptobazaar.co.in`

Select type: **Satellite**. Primary domain should auto-fill as `cryptobazaar.co.in`.

Click Save.

- [ ] **Step 3: Verify the domain shows up**

After saving, the Domains list should show:
- `cryptobazaar.co.in` — Primary
- `app.cryptobazaar.co.in` — Satellite

No DNS verification is needed for Clerk — this is just an allow-list entry.

---

### Task 7: Update existing Vercel project for `apps/landing/`

The existing project `cryptobazaar` (currently pointing to `frontend/`) needs its root directory updated to `apps/landing/`. **This will redeploy the landing site. Plan for ~2 min of downtime or off-peak window.**

- [ ] **Step 1: Push the `phase1` branch to origin** (so Vercel can pick up the new directory structure)

```bash
git push origin phase1
```

- [ ] **Step 2: Update root directory in Vercel dashboard**

Go to [vercel.com/dashboard](https://vercel.com/dashboard) → project `cryptobazaar` → **Settings → General**.

Find **"Root Directory"**. Change from `frontend` to `apps/landing`.

Click Save.

- [ ] **Step 3: Trigger a redeploy**

In Vercel dashboard → **Deployments** → click the three-dot menu on the latest production deployment → **Redeploy**.

Or run: `vercel --prod` from inside `apps/landing/`.

- [ ] **Step 4: Verify the landing site still works at `cryptobazaar.co.in`**

Open `https://cryptobazaar.co.in` — confirm the landing page loads, the nav shows "Get Started" for logged-out users, FAQ accordion works.

- [ ] **Step 5: Update env vars on the landing Vercel project**

In Vercel dashboard → project `cryptobazaar` → **Settings → Environment Variables**:

Update `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` from `/onboarding` to `https://app.cryptobazaar.co.in/onboarding`.

Add new var: `NEXT_PUBLIC_APP_URL` = `https://cryptobazaar.co.in` (if not already set).

Remove these vars (not needed by landing app — reduces secret exposure):
- `THIRDWEB_SECRET_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`
- `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`, `DIDIT_API_URL`
- `GOOGLE_AI_API_KEY`
- `IDENTUS_AGENT_URL`, `IDENTUS_API_KEY`, `IDENTUS_ISSUER_DID`
- `JWT_SECRET`
- `NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS`
- `NEXT_PUBLIC_AMOY_USDC_ADDRESS`
- `NEXT_PUBLIC_POLYGON_CHAIN_ID`
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`

Keep these vars:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (value: `/login` — stays relative since login is on this domain)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (updated above)
- `DATABASE_URL` (needed for `/api/stats`)

- [ ] **Step 6: Redeploy landing after env var changes**

Trigger another redeploy so the new env vars are picked up.

---

### Task 8: Create new Vercel project for `apps/app/`

- [ ] **Step 1: Create new Vercel project**

In Vercel dashboard → **Add New → Project** → Import Git Repository → select `AgrimTawani/cryptobazaar`.

When prompted for settings:
- **Project Name**: `cryptobazaar-app`
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `apps/app`
- **Build Command**: `prisma generate && next build` (same as current `frontend/` build)
- **Install Command**: `npm install`
- **Output Directory**: leave blank (Next.js default)

Click **Deploy**.

The first deploy will fail (env vars not set yet) — that's fine.

- [ ] **Step 2: Set environment variables on `cryptobazaar-app`**

In `cryptobazaar-app` project → **Settings → Environment Variables**, add ALL of the following for **Production** environment:

```
DATABASE_URL                          = <same value as landing project>
NEXT_PUBLIC_THIRDWEB_CLIENT_ID        = <same value>
THIRDWEB_SECRET_KEY                   = <same value>
R2_ACCOUNT_ID                         = <same value>
R2_ACCESS_KEY_ID                      = <same value>
R2_SECRET_ACCESS_KEY                  = <same value>
R2_BUCKET_NAME                        = <same value>
R2_ENDPOINT                           = <same value>
DIDIT_API_KEY                         = <same value>
DIDIT_WORKFLOW_ID                     = <same value>
DIDIT_WEBHOOK_SECRET                  = <same value>
DIDIT_API_URL                         = <same value>
GOOGLE_AI_API_KEY                     = <same value>
IDENTUS_AGENT_URL                     = <same value>
IDENTUS_API_KEY                       = <same value>
IDENTUS_ISSUER_DID                    = <same value>
JWT_SECRET                            = <same value>
NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS    = <same value>
NEXT_PUBLIC_AMOY_USDC_ADDRESS         = <same value>
NEXT_PUBLIC_POLYGON_CHAIN_ID          = <same value>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY     = <same value as landing — same Clerk instance>
CLERK_SECRET_KEY                      = <same value as landing>
NEXT_PUBLIC_CLERK_SIGN_IN_URL         = https://cryptobazaar.co.in/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL   = https://app.cryptobazaar.co.in/onboarding
NEXT_PUBLIC_CLERK_DOMAIN              = cryptobazaar.co.in
NEXT_PUBLIC_CLERK_IS_SATELLITE        = true
NEXT_PUBLIC_APP_URL                   = https://app.cryptobazaar.co.in
```

To get current values: in the `cryptobazaar` landing project → Settings → Environment Variables, use **"Reveal"** on each encrypted var to copy it over.

- [ ] **Step 3: Trigger a redeploy of `cryptobazaar-app`**

Deployments → Redeploy latest. This time it should succeed.

---

### Task 9: Add custom domain `app.cryptobazaar.co.in` to Vercel + DNS

- [ ] **Step 1: Add domain to `cryptobazaar-app` project in Vercel**

In `cryptobazaar-app` → **Settings → Domains** → type `app.cryptobazaar.co.in` → Add.

Vercel will show you the required DNS record. It will be one of:
- `CNAME app → cname.vercel-dns.com` (most common for non-apex subdomains)
- Or an `A` record if your DNS provider doesn't support CNAME at apex (not applicable here — `app` is a subdomain)

Note the exact record value shown by Vercel (it may be a project-specific value).

- [ ] **Step 2: Add DNS record with your domain registrar**

Log in to wherever `cryptobazaar.co.in` is registered (likely GoDaddy, Cloudflare, Namecheap, or Hostinger for `.co.in`).

Add:
```
Type:  CNAME
Name:  app
Value: cname.vercel-dns.com
TTL:   auto (or 300)
```

If Vercel showed a different value in Step 1, use that value instead of `cname.vercel-dns.com`.

- [ ] **Step 3: Wait for DNS propagation**

DNS propagation for a new subdomain typically takes 2–10 minutes if your TTL is short. Run:

```bash
dig CNAME app.cryptobazaar.co.in +short
```

Expected output: `cname.vercel-dns.com.`

- [ ] **Step 4: Verify in Vercel**

Back in Vercel → `cryptobazaar-app` → Domains — the domain `app.cryptobazaar.co.in` should show a green "Valid Configuration" indicator. Vercel also auto-provisions an SSL certificate (Let's Encrypt) — usually done within 1 minute of DNS validation.

---

### Task 10: End-to-end auth flow test

This is the most important test. Clerk satellite auth is the highest-risk part of this migration.

- [ ] **Step 1: Test sign-in flow (new user)**

In a fresh private/incognito window (no existing Clerk session):

1. Go to `https://cryptobazaar.co.in`
2. Click "Get Started" → confirm you land on `/login`
3. Click "Continue with Google" → confirm OAuth redirect to Google
4. After Google auth, confirm you're redirected to `https://app.cryptobazaar.co.in/onboarding`
5. Confirm the onboarding page loads and shows your name in the greeting

Expected behavior: After OAuth, Clerk completes the handshake via `?__clerk_handshake=...` query param — this is invisible but you can see it flash in the URL bar briefly before the app page renders.

- [ ] **Step 2: Test authenticated state on app domain**

While logged in:
1. Go to `https://app.cryptobazaar.co.in/dashboard` directly
2. Confirm it loads and shows your user data (not an error or infinite spinner)

- [ ] **Step 3: Test session from landing domain**

While logged in:
1. Go to `https://cryptobazaar.co.in`
2. Confirm the nav shows your avatar + "Dashboard" link (not "Get Started")
3. Click Dashboard → confirm redirect to `https://app.cryptobazaar.co.in/dashboard`

- [ ] **Step 4: Test the marketplace preview iframe**

On the landing page, click "Have a Peek" — the marketplace preview modal should load `https://app.cryptobazaar.co.in/marketplace` in an iframe without CORS errors. Check browser devtools Console tab — no `Refused to frame` errors.

Note: If the iframe blocks, Vercel adds `X-Frame-Options: SAMEORIGIN` by default. You'll need to add to `apps/app/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ...existing config...
  async headers() {
    return [
      {
        source: "/marketplace",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://cryptobazaar.co.in",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://cryptobazaar.co.in",
          },
        ],
      },
    ];
  },
};
```

- [ ] **Step 5: Test sign-out**

Sign out from `https://app.cryptobazaar.co.in/dashboard`. After sign-out, go to `https://cryptobazaar.co.in` — confirm the nav shows "Get Started" (not your avatar). The session should be cleared from both domains.

---

### Task 11: Clean up `frontend/` (after confirming both apps work in production)

⚠️ **Only do this after Task 10 passes fully.** This is destructive and removes the old deployment source.

- [ ] **Step 1: Update `.vercel/repo.json` to reflect new project structure**

Edit `/home/agrim22/Desktop/cryptobazaar/.vercel/repo.json`:

```json
{
  "remoteName": "origin",
  "projects": [
    {
      "id": "prj_fafDAHnToAaj4NYgeI6P3wR2Q4gX",
      "name": "cryptobazaar",
      "directory": "apps/landing",
      "orgId": "team_yOcSeaw9MklWWeClKau0qxYk"
    },
    {
      "id": "<new-project-id-from-task-8>",
      "name": "cryptobazaar-app",
      "directory": "apps/app",
      "orgId": "team_yOcSeaw9MklWWeClKau0qxYk"
    }
  ]
}
```

Replace `<new-project-id-from-task-8>` with the actual project ID from the Vercel dashboard (`cryptobazaar-app` → Settings → General → Project ID).

- [ ] **Step 2: Archive `frontend/` directory**

```bash
git rm -r frontend/
git commit -m "chore: remove legacy frontend/ (migrated to apps/landing + apps/app)"
```

⚠️ **This commit removes the old deployment source.** Vercel's `cryptobazaar` project is now pointing to `apps/landing/` (updated in Task 7), so this is safe. But don't do this step until you've confirmed `cryptobazaar.co.in` and `app.cryptobazaar.co.in` are both serving correctly.

---

## §3a: Final folder structure summary

```
apps/landing/   → cryptobazaar.co.in    → Vercel project: cryptobazaar
apps/app/       → app.cryptobazaar.co.in → Vercel project: cryptobazaar-app
```

## §3b: Auth and cookie strategy

**How it works now:** Clerk v7 handles everything. When a user signs in on `cryptobazaar.co.in/login`, Clerk sets a session cookie scoped to `cryptobazaar.co.in`. The satellite app at `app.cryptobazaar.co.in` cannot read this cookie.

**How it works after migration:** Clerk's satellite domain feature uses a URL-based handshake (`?__clerk_handshake=` + `?__clerk_db_jwt=` query params). When a logged-in user navigates from `cryptobazaar.co.in` to `app.cryptobazaar.co.in`, Clerk's middleware on the satellite detects no local session, silently redirects to the primary domain to get a short-lived handshake token, then sets a local session cookie on `app.cryptobazaar.co.in`. This is transparent to the user (the redirect takes <100ms).

**Nothing needs to change about how tokens are stored.** Clerk handles all of this. The only requirements from your code:
1. `ClerkProvider` on the app has `isSatellite`, `domain`, and `signInUrl` props (done in Task 4)
2. `middleware.ts` exists on both apps (done in Tasks 3 and 4)
3. Clerk dashboard has `app.cryptobazaar.co.in` added as a satellite domain (done in Task 6)

**Post-login redirect:** Login happens on `cryptobazaar.co.in/login`. The `redirectUrlComplete` in `login/page.tsx` points to `https://app.cryptobazaar.co.in/onboarding` (updated in Task 3). Clerk passes a `__clerk_handshake` token as a query param in this URL. The satellite's middleware picks it up and sets the local session cookie.

## §3c: Environment variable split

| Variable | Landing | App |
|----------|---------|-----|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✓ same key | ✓ same key |
| `CLERK_SECRET_KEY` | ✓ same key | ✓ same key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` (relative) | `https://cryptobazaar.co.in/login` (absolute) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `https://app.cryptobazaar.co.in/onboarding` | `https://app.cryptobazaar.co.in/onboarding` |
| `NEXT_PUBLIC_CLERK_DOMAIN` | not set | `cryptobazaar.co.in` |
| `NEXT_PUBLIC_CLERK_IS_SATELLITE` | not set | `true` |
| `DATABASE_URL` | ✓ (for `/api/stats`) | ✓ |
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | not needed | ✓ |
| `THIRDWEB_SECRET_KEY` | not needed | ✓ |
| `R2_*` (5 vars) | not needed | ✓ |
| `DIDIT_*` (4 vars) | not needed | ✓ |
| `GOOGLE_AI_API_KEY` | not needed | ✓ |
| `IDENTUS_*` (3 vars) | not needed | ✓ |
| `JWT_SECRET` | not needed | ✓ |
| `NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS` | not needed | ✓ |
| `NEXT_PUBLIC_AMOY_USDC_ADDRESS` | not needed | ✓ |
| `NEXT_PUBLIC_POLYGON_CHAIN_ID` | not needed | ✓ |
| `NEXT_PUBLIC_APP_URL` | `https://cryptobazaar.co.in` | `https://app.cryptobazaar.co.in` |

## §3d: DNS record

```
Type:   CNAME
Name:   app
Value:  cname.vercel-dns.com
TTL:    300
```

Add this at your domain registrar (wherever `cryptobazaar.co.in` DNS is managed). Verify propagation with `dig CNAME app.cryptobazaar.co.in +short`.

## §3e: Step-by-step execution order

1. Task 1 — Init workspace root + Turborepo _(safe, additive)_
2. Task 2 — Scaffold `apps/landing/` _(safe, new files)_
3. Task 3 — Modify landing files for cross-domain _(safe, new code not yet deployed)_
4. Task 4 — Create `apps/app/` _(safe, new files)_
5. Task 5 — Build both apps locally _(safe, catches errors before going live)_
6. Task 6 — Clerk dashboard: add satellite domain _(safe, additive config in Clerk)_
7. Task 7 — Update Vercel `cryptobazaar` project root dir + env vars ⚠️ _**CAUSES REDEPLOY of cryptobazaar.co.in** — do during off-peak hours; expect ~2 min downtime while the new build propagates_
8. Task 8 — Create Vercel `cryptobazaar-app` project _(safe, new project; won't affect existing site)_
9. Task 9 — Add DNS CNAME for `app.cryptobazaar.co.in` _(safe, additive DNS)_
10. Task 10 — End-to-end auth flow test _(verification, no code changes)_
11. Task 11 — Remove `frontend/` ⚠️ _**IRREVERSIBLE** — only after full verification in Task 10_

## §3f: What NOT to do

**1. Do not use `NEXT_PUBLIC_CLERK_IS_SATELLITE` on the landing app.** It must only be set on `apps/app/`. If you accidentally set it on the landing project, Clerk will redirect `/login` to itself in an infinite loop.

**2. Do not use relative URLs for `NEXT_PUBLIC_CLERK_SIGN_IN_URL` on the app.** It must be the absolute URL `https://cryptobazaar.co.in/login`. A relative `/login` will resolve to `app.cryptobazaar.co.in/login` which doesn't exist — resulting in a 404 instead of a login page.

**3. Do not delete `frontend/` before verifying the production app works** (Task 10 first). If you delete it before Task 7 completes successfully, you'll have a broken deployment and no source to revert to. The git history will let you recover, but it's painful.

**4. Do not add a separate Clerk application instance for `app.cryptobazaar.co.in`.** You use the SAME `pk_live_*` / `sk_live_*` keys for both apps. Clerk satellite is a feature of a single instance — users are shared, not separate.

**5. Do not update `NEXT_PUBLIC_CLERK_SIGN_IN_URL` to `/login` on the app project.** The app has no `/login` page. Clerk will 404 when trying to redirect unauthenticated users.

**6. Do not add `app.cryptobazaar.co.in` to the existing Vercel `cryptobazaar` project as an alias.** It should be a separate project with its own build, not an alias. Two different root directories cannot share a Vercel project.

**7. Do not set `X-Frame-Options: DENY` in `apps/app/next.config.ts`.** The marketplace is embedded in an iframe on the landing page. The default Vercel header is `SAMEORIGIN`, which blocks cross-origin iframes — this is why Task 10 Step 4 explicitly handles it. If you set `DENY`, the "Have a Peek" modal will be broken.

**8. Do not switch to pnpm without updating the Vercel install command.** The repo currently uses npm (`package-lock.json`). If you switch package managers mid-migration, Vercel's build will fail unless you also update the install command in both projects to `pnpm install`.
