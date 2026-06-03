# Wallet & Network Warnings — Implementation List

All the places where users can make network/chain mistakes and lose a transaction.
Priority order: HIGH = real money at risk, MEDIUM = confusing, LOW = cosmetic.

---

## CRITICAL — Must fix before adding Tron or Solana

### Address architecture (schema change required)

Currently every user has ONE walletAddress + ONE walletChain in the DB.
This breaks when supporting multiple chain families:

| Chain family | Address format | Relationship to EVM |
|---|---|---|
| Polygon + BSC | `0x9939D...` (same address on both) | Same — no issue |
| Tron | `TStJtSU...` (base58) | Same underlying private key as EVM but different format — must store separately |
| Solana | `67psDuS...` (base58, ed25519) | Completely different key — must store separately |

**If we release Tron USDT to a user's stored EVM address without converting to Tron format, the user may not realise they control it.**
**If we release Solana USDC to an EVM address, it either fails or goes to an uncontrolled address — funds lost.**

Required DB change before going live with Tron/Solana:
```
User wallet storage must become:
  evmAddress:    "0x9939D..."   (Polygon + BSC)
  tronAddress:   "TStJtSU..."  (Tron — collected during Tron onboarding)
  solanaAddress: "67psDuS..."  (Solana — collected during Solana onboarding)
```

Each address collected at the point a user first connects that chain type.

---

## HIGH PRIORITY — Real money at risk

### 1. Trade page — buyer before locking
**Where:** Buy confirmation screen, before "Lock Order & Start Timer" button  
**Check:** MetaMask current chain ID vs order.chain  
**Warning:** "This order is on Polygon. Your wallet is on BNB Chain. Switch network to continue."  
**Action:** Disable the Lock button until networks match.  
**Why dangerous:** Buyer can lock the order, send real INR, and never receive USDC because their wallet is on the wrong chain. INR is gone, USDC stays locked.

### 2. Trade page — seller before confirming payment
**Where:** "Payment Received ✓" button  
**Check:** MetaMask current chain ID vs order.chain  
**Warning:** "Switch to Polygon to release funds to the buyer."  
**Action:** Disable the confirm button until networks match.  
**Why dangerous:** Seller clicks confirm, MetaMask fires on wrong chain, transaction fails. Buyer already sent INR and is waiting.

### 3. Trade page — buyer's balance on order chain
**Where:** Right sidebar trade summary, below the amount  
**Check:** Fetch buyer's USDT balance specifically on order.chain  
**Warning:** "Your Polygon USDT balance: 0.00 — you need at least 9 USDC on Polygon to receive this trade."  
**Why dangerous:** Buyer locks, sends INR, seller confirms, buyer gets 0 — because their USDT is on BSC not Polygon. Release fires on Polygon contract but buyer's Polygon wallet is empty (the release sends to their Polygon address, which is correct — but they might not realise they need the right chain active to see/use it).

---

## MEDIUM PRIORITY — Transaction will fail but no money lost

### 4. Sell page — wrong network before submitting
**Where:** Review panel, before the Submit/Post Order button  
**Check:** MetaMask current chain vs the chain being posted  
**Warning:** "You are on BNB Chain but posting a Polygon order. Switch MetaMask to Polygon first."  
**Action:** Disable submit button until networks match.  
**Why:** Approve and createOrder will fire on the wrong chain and fail. USDT not moved (safe) but confusing.

### 5. Sell page — zero balance on selected chain
**Where:** Amount input field  
**Check:** User's USDT/USDC balance on the chain they're posting to  
**Warning:** "You have 0 USDC on Polygon. Make sure your tokens are on this chain."  
**Why:** Approve will succeed (approving 0 is valid) but createOrder's safeTransferFrom will fail.

### 6. Trade page — buyer switches network after locking
**Where:** Persistent banner in chat panel if network changes after BUYER_MATCHED  
**Check:** Continuous poll of MetaMask chain vs order.chain  
**Warning:** "You switched networks. Switch back to Polygon to submit payment proof and interact with this order."  
**Why:** markPaid doesn't need the wallet but confirmPayment does. Seller confirm will fail.

---

## LOW PRIORITY — Confusing but no financial loss

### 7. Dashboard wallet balance card
**Where:** WalletBalanceCard — when user switches the chain tab  
**Note:** "Showing BNB Chain balance. Your registered trading chain is Polygon."  
**Why:** User might think their BNB USDT is what's used for trading when it isn't.

### 8. Onboarding — wallet connect step
**Where:** Wallet connection page during onboarding  
**Check:** Detect which chain they're connecting on  
**Warning:** "You are connecting on BNB Chain. Orders on this platform will use your BNB Chain wallet."  
**Why:** User might connect on BSC while all their USDT is on Polygon.

### 9. Marketplace listings — chain badge
**Where:** Each listing row in the marketplace table  
**Already done:** Chain badge (Polygon/Solana/Tron) is shown — good.  
**Improvement:** On hover or tooltip: "This order requires [X] USDC on Polygon."

---

## How to detect network mismatch (implementation note)

```typescript
import { useActiveWalletChain } from "thirdweb/react";

const CHAIN_IDS: Record<string, number> = {
  POLYGON: 80002,   // Amoy testnet (137 on mainnet)
  BSC:     97,      // Chapel testnet (56 on mainnet)
};

const activeChain = useActiveWalletChain();
const orderChainId = CHAIN_IDS[order.chain];
const networkMismatch = !!activeChain && activeChain.id !== orderChainId;
```

---

## Known safe behaviours (no warning needed)

- Locking an order (`lockOrder`) does NOT require holding tokens — only the release does. This is by design.
- Dispute resolution sends full amount to winner — fee-free. No chain issue here.
- Bank-to-bank INR transfer is off-chain entirely — no wallet needed.
- Seller's payment details (UPI/bank) are stored in DB, not dependent on wallet chain.
