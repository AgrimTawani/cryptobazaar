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

## Wallet warning reference

See `docs/WALLET_WARNINGS.md` — full list of network/chain warning locations
across the site with priority levels.
