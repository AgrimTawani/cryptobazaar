# Trade Execution

## What it does
Enables verified members to buy and sell USDT/USDC against INR in a peer-to-peer manner. The platform coordinates the trade. The crypto is held in a smart contract escrow — the platform never touches it.

---

## Pre-trade Checks
Before any trade can begin, the platform silently verifies:
1. Both parties are Verified Members (all 3 verification steps passed)
2. Both parties have an active subscription
3. Both wallet addresses pass Nominis on-chain screening (checked against known mixers, hacked wallets, darknet markets, sanctioned addresses)

If any check fails, the trade is blocked and the reason is shown.

---

## Seller Side — Posting a Listing

Seller specifies:
- Asset: USDT or USDC
- Chain: Polygon / BSC / Solana / TRON
- Amount to sell
- Rate (INR per unit)
- Accepted payment methods: UPI, IMPS, NEFT
- Min and max trade size
- Their UPI ID / bank account details (stored securely, shown only to the matched buyer)

Before posting, the seller approves and deposits the crypto into the master escrow contract. The funds are locked immediately — they cannot list without putting up the collateral.

---

## Buyer Side — Initiating a Trade

Buyer browses listings, filters by asset, chain, rate, and payment method. Clicks "Buy" on a listing.

Platform runs pre-trade checks on both parties. If clean:
1. Buyer calls `lockOrder()` on the master escrow contract — their wallet address is bound to the trade at this point
2. A private chat room opens between buyer and seller
3. Buyer has 30 minutes to send INR payment

---

## Payment

Buyer sends INR directly to the seller's bank via UPI, IMPS, or NEFT. No platform involvement in the money movement.

Once payment is sent, the buyer:
1. Enters the UTR (Unique Transaction Reference) from their payment
2. Clicks "I Have Paid"

The seller receives a notification. Their Cancel button is permanently removed — they can now only confirm or dispute.

---

## Confirmation & Release

Seller checks their bank account and confirms receipt:
- Clicks "Payment Received" → smart contract releases crypto to buyer's wallet
- 0.75% of the trade value is automatically deducted and sent to the Insurance Fund
- Trade marked complete

**If the seller does not respond within 15 minutes of the buyer marking paid** → the trade automatically enters dispute. The seller cannot game this by ignoring notifications.

**If the buyer does not mark paid within 30 minutes of locking the order** → the seller can cancel and reclaim their crypto.

---

## Trade State Machine

```
OPEN          → buyer locks in
LOCKED        → buyer marks INR sent         (30-min timeout: seller can cancel)
PAID          → seller confirms receipt      (15-min timeout: auto-dispute)
COMPLETED     → terminal, funds released
DISPUTED      → admin resolves              (see disputes doc)
CANCELLED     → terminal, funds returned to seller
```

Full state machine with all transitions and rules: `docs/system/p2p-escrow-architecture.md`

---

## Smart Contract Architecture

One master escrow contract is deployed per chain — not one contract per order. Every order is an entry inside that single contract. This keeps gas costs low, makes the contract auditable, and means users only need to approve it once.

The contract is the source of truth for money. The platform DB is the source of truth for everything else (chat, UTR records, metadata).

Details: `docs/system/p2p-escrow-architecture.md`

---

## Supported Assets & Chains

| Asset | Chain | Wallet |
|---|---|---|
| USDT | Polygon | MetaMask / WalletConnect |
| USDT | BSC (BNB Chain) | MetaMask / WalletConnect |
| USDC | Solana | Phantom |
| USDT | TRON (TRC-20) | TronLink / Coinbase Wallet / Trust Wallet |

---

## Tech
- **Wallet connection & contract calls:** ThirdWeb SDK (EVM chains), Phantom native API (Solana), TronWeb (TRON)
- **EVM escrow contract:** Solidity, deployed on Polygon and BSC
- **Solana escrow program:** Anchor / Rust
- **TRON escrow contract:** Solidity (TronWeb-compatible)
- **Order book:** Off-chain in NeonDB (for speed) — crypto never touches the backend
- **On-chain screening:** Nominis API
- **Event indexing:** ThirdWeb SDK listens to contract events and keeps DB in sync
