# CryptoBazaar — Dev Notes for Claude

## ⚠️ CRITICAL: UI Preservation Rules

**NEVER rewrite, simplify, or replace existing UI components.** This has caused major regressions.
Specific rules — treat these as hard constraints, not suggestions:

1. **Mobile responsiveness = additive only.** Add `sm:`, `md:`, `lg:` breakpoint variants and `flex-wrap`/`grid-cols-1` fallbacks. Never remove existing classes, restructure JSX, replace component logic, or change desktop layout.

2. **Never strip imports or state.** If a file imports `Slider`, `AnimatePresence`, `motion`, `useRouter`, `useRef` etc. — leave them. Removing imports deletes features (sort/filter panel, chain popup, animations, polling).

3. **Never simplify data-fetching.** The marketplace uses a polling interval (`setInterval`) and separate guest/authenticated paths. Do not replace with a single `Promise.all`.

4. **Never change component interfaces or remove props** from `OrderRow`, `ChainConfirmPopup`, or any other type/component while making layout changes.

5. **Before touching any page that has an existing desktop UI:** read the file first, identify the minimum-diff change needed, and only touch those lines. If unsure, do nothing and ask.

6. **Reference commit for marketplace page:** `81ac30f` — this is the last known-good state of `frontend/src/app/marketplace/page.tsx`. If the marketplace page is ever wrong, restore from this commit.

---

## Pending: block Tron and Solana chain warnings

In `frontend/src/app/marketplace/[id]/page.tsx`, the network mismatch warning
for Tron and Solana orders is currently **advisory only** (shows a warning but
does NOT disable the Buy/Lock/Confirm buttons).

Once escrow contracts are deployed on Tron and Solana, change the non-EVM
branch to also block actions, exactly like Polygon and BSC do.

**Where to change** — find this block in the trade page:

```typescript
const chainOk = !isEvm || !account || !expectedChainId || activeChain?.id === expectedChainId;
const wrongChainMsg = account
  ? isEvm && !chainOk
    ? `...EVM mismatch message...`
    : !isEvm
    ? `...advisory only message...`   // ← change this branch to also set chainOk = false
    : null
  : null;
```

**What to do when Tron/Solana contracts are live:**
1. Add Tron chain IDs to `ORDER_CHAIN_ID` (e.g. `TRON: 3448148188` for Nile testnet)
2. Add Solana chain ID to `ORDER_CHAIN_ID` (e.g. `SOLANA: 1399811149`)
3. Add `"TRON"` and `"SOLANA"` to the `isEvm`-style check (or replace `isEvm` with a more general `hasEscrow` boolean)
4. The `chainOk` and button disabled logic will then apply to those chains automatically

---

## Contract deploy checklist

See `docs/CONTRACT_DEPLOY_CHECKLIST.md` — run through every item before
and after deploying a new contract to any chain.

### After every smart contract redeployment — do ALL of these:

1. **Update `contracts/evm/.env`** — set `NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS` to the new address
2. **Update `frontend/.env.local`** — set `NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS` to the new address
3. **Update Vercel env vars** — go to Vercel Dashboard → Project → Settings → Environment Variables and update `NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS` for all environments (Production, Preview, Development)
4. **Whitelist any new tokens** — if the deploy script doesn't already whitelist all required tokens, run `Whitelist.s.sol` or call `setWhitelist` manually
5. **Update the frontend contract calls** — if any method signatures changed, update the inline method strings in `frontend/src/app/marketplace/[id]/page.tsx` and `frontend/src/app/marketplace/sell/page.tsx`
6. **Old orders are orphaned** — any orders created against the old contract address cannot be completed via the new contract. Resolve or close all active orders on the old contract before switching, or support both addresses in the frontend
7. **Commit the new address** — commit the `.env` change and push so the team knows the active contract address
8. **Redeploy frontend on Vercel** — trigger a new Vercel deployment after updating env vars so the new address is live

## Wallet warning reference

See `docs/WALLET_WARNINGS.md` — full list of network/chain warning locations
across the site with priority levels.
