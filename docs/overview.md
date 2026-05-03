# CryptoBazaar — Product Overview

> A gated P2P stablecoin exchange for India. Trade USDT and USDC against INR without the risk of bank account freezes.

---

## The Problem

Indian P2P crypto traders regularly have their bank accounts frozen by cyber police. A buyer pays with money from an illicit source (scam, fraud, cybercrime) to purchase USDT. The police trace the money trail and freeze every account it passed through — including the innocent seller's. The seller had no idea.

CryptoBazaar's answer: **only allow verified, clean-money users on the platform**. If everyone is vetted, the risk of receiving tainted fiat drops dramatically. And if it still happens, the insurance fund covers you.

---

## What the Platform Does

- Vets every user through a 3-layer onboarding process before they can trade
- Locks USDT in a smart contract escrow during every trade — the platform never holds funds
- Lets the seller manually confirm receipt of fiat to release escrow
- Resolves disputes using real bank statements verified for tampering
- Maintains an insurance fund from trade levies to compensate members for wrongful bank freezes

---

## User Flow

### 1. Registration
User connects their crypto wallet. The platform creates a Decentralised Identity (DID) for them via Hyperledger Identus. No email or password required.

→ Detailed doc: `features/01-onboarding.md`
→ Identity layer: `features/09-hyperledger-identus.md`

---

### 2. Layer 1 — KYC
User verifies their Aadhaar, PAN, and completes a liveness check via HyperVerge. Takes ~3 minutes. On pass, a cryptographic KYC credential is issued to their DID. On fail, specific reason is shown and they can reapply after 30 days.

→ Detailed doc: `features/02-kyc.md`

---

### 3. Layer 2 — Bank Statement EDD
User uploads 6 months of bank statements. Perfios/Authbridge parses them and checks for PDF tampering. An ML model scores the transaction history for AML risk patterns — structuring, rapid pass-throughs, counterparty anomalies, income mismatch. Scores below 40 auto-approve, 41–70 go to human review, 71+ are rejected. On pass, an EDD credential is issued to their DID, valid for 6 months.

→ Detailed doc: `features/03-bank-statement-edd.md`

---

### 4. Layer 3 — AI Interview
User fills a text questionnaire — source of funds, trading purpose, expected volume. Claude API scores answers for consistency and red flags. Borderline cases are escalated to an async video interview reviewed by AI and a human. On pass, an interview credential is issued to their DID.

→ Detailed doc: `features/04-ai-interview.md`

---

### 5. Verified Member
All 3 credentials verified → user becomes a Verified Member. Their DID holds 3 cryptographic credentials. CryptoBazaar stores only their DID — no raw Aadhaar, PAN, or bank data. Credentials expire every 6 months and require re-verification.

---

### 6. Subscribe
User picks a subscription tier before trading:

| Tier | Price | Monthly Cap |
|---|---|---|
| Starter | ₹200/month | ₹5L |
| Trader | ₹500/month | ₹20L |
| Pro | ₹1,000/month | Unlimited |

→ Detailed doc: `features/05-subscription.md`

---

### 7. Posting a Trade (Seller)
Seller lists: asset (USDT/USDC), amount, INR rate, accepted payment methods (UPI/IMPS/NEFT), min/max trade size. Their DID credentials and wallet address are checked before the listing goes live.

---

### 8. Initiating a Trade (Buyer)
Buyer picks a listing. Platform checks both parties' DID credentials are valid and unexpired. Both wallets are screened against Nominis for on-chain taint. If clean, the seller's USDT is locked in a smart contract escrow. The trade window opens.

→ Detailed doc: `features/06-trade-execution.md`

---

### 9. Fiat Payment
Buyer sends INR to the seller's bank via UPI, IMPS, or NEFT — directly, bank to bank. No platform involvement. Buyer then submits the UTR (transaction reference number) on the platform and marks the trade as paid.

---

### 10. Confirmation & Release
Seller receives a notification, manually checks their bank account, and clicks Confirm. The smart contract releases the USDT to the buyer's wallet. 0.75% of the trade value is automatically sent to the Insurance Fund contract.

If the seller does not respond within 15 minutes of the buyer marking paid, the trade enters dispute.

---

### 11. Disputes
Either party can raise a dispute. Both parties are required to submit their bank statements for the relevant period. Perfios/Authbridge runs tampering detection on both. CryptoBazaar's support team compares the debit on the buyer's side against the credit on the seller's side and makes a final ruling. The losing party is banned.

→ Detailed doc: `features/07-disputes.md`

---

### 12. Insurance Fund
0.75% of every completed trade flows into an on-chain insurance fund. If a verified member's bank account is frozen due to a CryptoBazaar trade despite passing all EDD layers, they can file a claim. Payouts range from ₹10,000 (emergency, 24h) to ₹5,00,000 (full case resolution, 30 days).

→ Detailed doc: `features/08-insurance-fund.md`

---

## Supported Assets & Chains

| Asset | Chains |
|---|---|
| USDC | Polygon, Solana |
| USDT | Polygon, Solana, Tron (TRC-20) |

Cross-chain USDC: Circle CCTP v2
Cross-chain USDT: Wormhole

---

## Platform Role Summary

| What CryptoBazaar does | What CryptoBazaar does NOT do |
|---|---|
| Vets every user before entry | Hold user funds at any point |
| Coordinates trade listings and matching | Touch INR at any point |
| Holds USDT in smart contract escrow | Make automatic payment decisions |
| Resolves disputes with verified bank data | Take custody of wallets |
| Pays insurance claims | Partner with banks or payment gateways |
