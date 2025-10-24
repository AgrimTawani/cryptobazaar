# Deployment Issues & Fixes

This document tracks all deployment issues encountered and their solutions for the CryptoBazaar project.

---

## Issue #1: React Unescaped Entities
**Date:** October 24, 2025  
**Error:**
```
./src/app/page.tsx
369:64  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.
422:72  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.

./src/app/exchange/marketplace/page.tsx
217:24  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.
217:28  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.
```

**Cause:** React/ESLint requires HTML entities for quotes and apostrophes in JSX text.

**Fix:**
- Replace `'` with `&apos;` in text content
- Replace `"` with `&quot;` in text content

**Files Modified:**
- `src/app/page.tsx` (lines 369, 422)
- `src/app/exchange/marketplace/page.tsx` (line 217)

---

## Issue #2: Next.js Image Optimization Warning
**Date:** October 24, 2025  
**Error:**
```
./src/app/exchange/profile/page.tsx
160:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth.

./src/app/exchange/layout.tsx
110:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth.

./src/components/bento-grid.tsx
188:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth.
210:13  Warning: Using `<img>` could result in slower LCP and higher bandwidth.
```

**Cause:** Next.js recommends using the optimized `<Image />` component instead of HTML `<img>` tags.

**Fix:**
```typescript
// Before
<img src={url} alt="description" className="w-16 h-16" />

// After
import Image from "next/image";
<Image src={url} alt="description" width={64} height={64} className="w-16 h-16" />
```

**Files Modified:**
- `src/app/exchange/profile/page.tsx`
- `src/app/exchange/layout.tsx` (imported as `NextImage` to avoid naming conflict)
- `src/components/bento-grid.tsx`

---

## Issue #3: React Hooks Exhaustive Dependencies Warning
**Date:** October 24, 2025  
**Error:**
```
./src/components/ui/sparkles.tsx
51:6  Warning: React Hook useEffect has missing dependencies: 'animate' and 'initCanvas'.
```

**Cause:** ESLint's exhaustive-deps rule detects functions used in useEffect that aren't in the dependency array.

**Fix:**
```typescript
useEffect(() => {
  // ... effect code using animate and initCanvas
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**Rationale:** `animate` and `initCanvas` are stable functions that don't need to be in the dependency array. Adding them would cause infinite re-renders.

**Files Modified:**
- `src/components/ui/sparkles.tsx`

---

## Issue #4: Next.js 15 Async Route Params
**Date:** October 24, 2025  
**Error:**
```
src/app/api/orders/[id]/route.ts
Type error: Route "src/app/api/orders/[id]/route.ts" has an invalid "DELETE" export:
  Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.
```

**Cause:** Next.js 15 changed the API route params to be async (Promise-based).

**Fix:**
```typescript
// Before (Next.js 14)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;
  // ...
}

// After (Next.js 15)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await context.params;
  // ...
}
```

**Files Modified:**
- `src/app/api/orders/[id]/route.ts`

**References:**
- [Next.js 15 Migration Guide - Async Route Params](https://nextjs.org/docs/app/building-your-application/upgrading/version-15#async-request-apis-breaking-change)

---

## Issue #5: Prisma Client Type Errors (Non-blocking)
**Date:** October 24, 2025  
**Error:**
```
Property 'order' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
```

**Cause:** Local TypeScript server cache not picking up regenerated Prisma types.

**Impact:** ⚠️ Does NOT affect deployment. This is a local development TypeScript issue only.

**Fix (Local Development):**
1. Run `npx prisma generate`
2. Restart TypeScript Server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. OR reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"

**Deployment:** No action needed. Prisma generates fresh types during deployment build.

---

## Issue #6: Pino-Pretty Warning (Non-blocking)
**Date:** October 24, 2025  
**Error:**
```
Module not found: Can't resolve 'pino-pretty' in '/vercel/path0/cryptobazaar/node_modules/.pnpm/pino@7.11.0/node_modules/pino/lib'
```

**Cause:** WalletConnect/ThirdWeb SDK dependency (pino logger) looks for optional peer dependency `pino-pretty`.

**Impact:** ⚠️ Warning only. Does NOT prevent deployment. App functions normally.

**Status:** Can be ignored. Optional dependency for pretty-printing logs in development.

---

## Deployment Checklist

Before deploying, ensure:

- [ ] All ESLint errors are fixed (no `Error:` messages)
- [ ] `<img>` tags replaced with `<Image />` from `next/image`
- [ ] Quotes and apostrophes escaped in JSX text (`&apos;`, `&quot;`)
- [ ] Next.js 15 async params used in dynamic routes
- [ ] `npx prisma generate` runs successfully in build
- [ ] TypeScript compiles without type errors
- [ ] Warnings are acceptable (pino-pretty, etc.)

---

## Build Commands

```bash
# Local build test
pnpm run build

# Prisma generate
npx prisma generate

# Type check
pnpm run type-check  # (if available)

# Lint
pnpm run lint
```

---

## Vercel-Specific Notes

1. **Prisma Generation:** Runs automatically via `postinstall` script and `build` script
2. **Environment Variables:** Ensure `DATABASE_URL` and Clerk keys are set in Vercel dashboard
3. **Build Command:** `prisma generate && next build` (already in package.json)
4. **Node Version:** Using Node.js 20.x (Vercel default)
5. **PNPM Version:** Using pnpm@10.x (detected from lockfile)

---

## Success Indicators

A successful deployment shows:
```
✔ Generated Prisma Client (v6.17.1)
✓ Compiled successfully
✓ Linting and checking validity of types
```

---

**Last Updated:** October 24, 2025  
**Project:** CryptoBazaar  
**Framework:** Next.js 15.4.6  
**Deployment Platform:** Vercel
