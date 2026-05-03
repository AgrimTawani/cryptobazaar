# Trade Execution

## What it does
Enables verified members to buy and sell USDT/USDC against INR in a peer-to-peer manner. The platform coordinates the trade. The USDT is held in a smart contract escrow — the platform never touches it.

---

## How it works

### Pre-trade Checks
Before any trade can begin, the platform silently verifies:
1. Both parties are Verified Members (all 3 DID credentials valid and unexpired)
2. Both parties have an active subscription
3. Both wallet addresses pass Nominis on-chain screening (checked against known mixers, hacked wallets, darknet markets, sanctioned addresses)

If any check fails, the trade is blocked and the reason is shown.

---

### Seller Side — Posting a Listing

Seller specifies:
- Asset: USDT or USDC
- Chain: Polygon / Solana / Tron
- Amount to sell
- Rate (INR per unit)
- Accepted payment methods: UPI, IMPS, NEFT
- Minimum and maximum trade size
- Their bank UPI ID / account details (stored securely, shown only to matched buyer)

Listing goes live on the order book.

---

### Buyer Side — Initiating a Trade

Buyer browses listings, filters by asset, chain, rate, and payment method. Clicks "Buy" on a listing.

Platform runs pre-trade checks on both parties. If clean:
1. A `TradeEscrow` smart contract is deployed on the relevant chain
2. Seller approves the transfer of their USDT/USDC into the escrow contract
3. Trade window opens — buyer has 30 minutes to send payment

---

### Payment

Buyer sends INR directly to the seller's bank via UPI, IMPS, or NEFT. This is a standard bank transfer — no platform involvement.

Once payment is sent, the buyer:
1. Enters the UTR (Unique Transaction Reference) number from their payment
2. Clicks "I have paid"

The seller receives a notification.

---

### Confirmation & Release

Seller checks their bank account and confirms receipt:
- Clicks "Payment Received" → smart contract releases USDT/USDC to buyer's wallet
- 0.75% of the trade value is automatically deducted from escrow and sent to the Insurance Fund contract
- Trade marked complete

**If the seller does not respond within 15 minutes of the buyer marking paid** → the trade automatically enters dispute status. The clock cannot be gamed by the seller simply ignoring the notification.

**If the buyer does not mark paid within 30 minutes of trade initiation** → the trade cancels automatically, USDT returns to seller.

---

### Trade State Machine

```
LISTED
  → INITIATED (buyer clicks Buy, pre-checks pass)
  → ESCROW_FUNDED (seller deposits USDT into contract)
  → PAYMENT_SUBMITTED (buyer clicks "I have paid" + UTR entered)
  → COMPLETED (seller confirms)
  → DISPUTED (seller disputes or doesn't respond in 15 min)
  → EXPIRED (buyer didn't pay in 30 min → USDT returned to seller)
```

---

### Supported Assets & Chains

| Asset | Chain | Notes |
|---|---|---|
| USDC | Polygon | Native Circle USDC |
| USDC | Solana | Native Circle USDC |
| USDT | Polygon | ERC-20 |
| USDT | Solana | SPL token |
| USDT | Tron | TRC-20 (most common for Indian P2P traders) |

Cross-chain USDC transfers use Circle CCTP v2 (burn-and-mint, no wrapped tokens).
Cross-chain USDT transfers use Wormhole bridge.

---

## Tech
- **Wallet connection & contract interaction:** ThirdWeb SDK
- **Polygon escrow contracts:** Solidity + Foundry (`EscrowFactory.sol`, `TradeEscrow.sol`)
- **Solana escrow programs:** Anchor / Rust
- **Tron escrow contracts:** Solidity (TronWeb-compatible)
- **Order book:** Off-chain in NeonDB (for speed) — value never touches the backend
- **On-chain screening:** Nominis API
- **Cross-chain USDC:** Circle CCTP v2
- **Cross-chain USDT:** Wormhole
