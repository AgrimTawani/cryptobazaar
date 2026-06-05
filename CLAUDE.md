# CryptoBazaar — Dev Notes for Claude

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
