# CryptoBazaar — Product Design Spec
**Date:** 2026-05-03
**Status:** Approved

---

## 1. Problem Statement

Indian P2P crypto traders (USDT/USDC ↔ INR) on platforms like Binance P2P are having their bank accounts frozen by cyber police. A buyer pays with fiat from an illicit source (scam, phishing, cybercrime proceeds), the victim files a complaint, police trace the money trail, and every account that touched those funds gets debit-frozen — including the innocent seller's.

Over 3,200 Indian accounts were frozen in 2025 due to P2P-linked crypto activity.

**CryptoBazaar's thesis:** If every person on the platform has passed deep Enhanced Due Diligence (EDD) including ML-scored bank statement analysis, the probability of tainted fiat entering any transaction drops dramatically. And if it does slip through, members are covered by an insurance fund.

---

## 2. Product Overview

A **gated P2P stablecoin exchange** where:
- Every member passes a mandatory 3-layer EDD before trading
- The platform coordinates trades but **never holds user funds** — all value lives in audited smart contracts
- Every wallet is screened on-chain before each trade
- An INR insurance fund (from subscriptions) and a crypto insurance fund (from trade levy) cover members for wrongful bank freezes

### Core Principles
1. **Platform holds nothing** — escrow is always a smart contract, never a platform wallet
2. **Every member is verified** — no trading without passing all 3 EDD layers
3. **Every trade is screened on-chain** — wallet addresses checked via Nominis before escrow is funded
4. **Two insurance funds** — INR fund for bank freeze compensation, crypto fund for crypto-side losses

---

## 3. Supported Assets & Chains

| Asset | Chains |
|---|---|
| USDC | Polygon, Solana |
| USDT | Polygon (ERC-20), Solana (SPL), Tron (TRC-20) |

**Cross-chain USDC:** Circle CCTP v2 (native burn-and-mint, Polygon ↔ Solana)
**Cross-chain USDT:** Wormhole bridge

---

## 4. Business Model

### Subscription Tiers (INR, collected in INR)

| Tier | Price | Monthly Trade Cap |
|---|---|---|
| Starter | ₹200/month | ₹5L |
| Trader | ₹500/month | ₹20L |
| Pro | ₹1,000/month | Unlimited |

**How INR subscriptions are collected:**
- Early stage: Business UPI ID — user pays manually, submits UTR, team verifies and activates
- Growth stage: Stripe (registered business, positioned as compliance/subscription software)

Subscription revenue flows entirely into the **INR Insurance Fund**.

### Transaction Levy (Crypto)
- 0.75% of every completed trade's USDT/USDC value deducted from escrow at settlement
- Flows entirely into the **Crypto Insurance Fund** smart contract

### Two Insurance Funds

| Fund | Source | Currency | Covers |
|---|---|---|---|
| INR Insurance Fund | Monthly subscriptions | INR | Bank freeze compensation (INR-denominated losses) |
| Crypto Insurance Fund | 0.75% trade levy | USDT/USDC | Crypto-side losses, platform emergencies |

### Fund Sustainability (Conservative)
```
500 active users
₹20,000 avg trade × 3 trades/user/month = ₹30M/month volume

INR Fund: 500 × ₹350 avg sub = ₹175,000/month
Crypto Fund: 0.75% × ₹30M = ₹225,000/month (~$2,700 USDT)
Expected claims: 2–3 users/month at ₹30,000 avg = ₹75,000/month
Both funds cash-flow positive from month 1.
```

---

## 5. Onboarding & EDD Pipeline

No user can trade until all 3 layers pass. Each layer issues a Verifiable Credential (VC) via Hyperledger Identus. CryptoBazaar stores only the user's DID — never raw Aadhaar, PAN, or bank data.

### State Machine
```
REGISTERED
  → KYC_PENDING → KYC_PASSED → EDD_PENDING → EDD_PASSED → INTERVIEW_PENDING → VERIFIED_MEMBER
               → REJECTED                  → REJECTED                       → REJECTED
               (specific reason shown, reapply after 30 days at each layer)
```

### Layer 1 — KYC (HyperVerge)
- Aadhaar OTP + PAN match + liveness check
- Duration: ~3 minutes
- On pass: `KYCCredential` VC issued to user's DID
- On fail: specific reason shown, 30-day cooldown

### Layer 2 — Bank Statement EDD
- User uploads 6 months of bank statements (PDF)
- Perfios/Authbridge runs **tampering detection first** — tampered PDF = immediate rejection + permanent ban
- ML pipeline scores transaction history (XGBoost Phase 1, GNN Phase 2)
- Risk thresholds: 0–40 auto-approve, 41–70 human review, 71+ reject
- On pass: `EDDCredential` VC issued, valid 6 months
- On fail: specific reason shown (e.g., "High-velocity pass-through transactions detected")
- Re-verification every 6 months or on risk score deterioration

### Layer 3 — AI Interview
- Text questionnaire scored by Claude API (consistency, plausibility, red flags)
- Borderline cases escalated to async video interview (AI + human review)
- On pass: `InterviewCredential` VC issued
- On fail: specific reason shown, 30-day cooldown

**Total onboarding time:** Under 1 hour for auto-approved users, 24–48 hours for human review cases.

---

## 6. Identity Layer (Hyperledger Identus)

Every user gets a DID (Decentralised Identifier) on the Cardano/Prism blockchain on registration. Each passed EDD layer issues a cryptographically signed VC to that DID.

At trade time, the platform verifies all 3 VCs cryptographically. Any expired or missing VC blocks trading.

CryptoBazaar stores only the DID. No raw personal data is persisted. This is structural DPDPA compliance.

VCs expire every 6 months. If a user's bank account is frozen and they file an insurance claim, their DID credentials serve as on-chain proof they were a verified member at the time of the trade.

---

## 7. Trade Execution

### Pre-Trade Checks (automatic, silent)
1. Both parties are Verified Members (all 3 VCs valid and unexpired)
2. Both have active subscriptions
3. Both wallet addresses pass Nominis on-chain screening (mixers, hacked wallets, sanctioned addresses)

Any failure blocks the trade.

### Seller — Posting a Listing
Seller specifies: asset, chain, amount, INR rate, accepted payment methods (UPI/IMPS/NEFT), min/max trade size, their bank UPI ID or account details.

### Buyer — Initiating a Trade
Buyer selects a listing. Pre-trade checks run. If clean:
1. `TradeEscrow` smart contract deployed on the relevant chain
2. Seller approves USDT/USDC transfer into the escrow contract
3. Trade window opens — buyer has 30 minutes to send payment

### Payment & Confirmation
1. Buyer sends INR directly to seller's bank via UPI/IMPS/NEFT
2. Buyer enters UTR number on the platform and clicks "I have paid"
3. Seller receives notification, manually checks their bank, clicks "Payment Received"
4. Smart contract releases USDT/USDC to buyer's wallet
5. 0.75% levy automatically sent to Crypto Insurance Fund contract

**If seller does not respond within 15 minutes of buyer marking paid → trade enters dispute.**
**If buyer does not mark paid within 30 minutes → trade cancels, USDT returns to seller.**

### Trade State Machine
```
LISTED → INITIATED → ESCROW_FUNDED → PAYMENT_SUBMITTED → COMPLETED
                   → EXPIRED                           → DISPUTED → RESOLVED
                     (buyer didn't pay in 30min)
```

---

## 8. Dispute Resolution

### When a dispute is triggered
- Seller clicks "I did not receive payment"
- Seller does not respond within 15 minutes of buyer marking paid

### Process
1. USDT locked in escrow. Neither party can access it.
2. Both parties have 24 hours to submit bank statements (PDF) for the relevant period.
3. **Perfios/Authbridge runs tampering detection on both PDFs.**
   - Tampered statement = immediate ruling against that party + permanent ban. No appeal.
4. CryptoBazaar support team compares buyer's debit against seller's credit (or absence of credit).
5. Support team makes final ruling — USDT released to winner, loser's account flagged.
6. Second dispute loss = permanent ban.

### What is NOT used
- Screenshots — not accepted, easily faked
- Third-party arbitration (Kleros/UMA) — unnecessary when bank data is objective
- Dispute bonds — removed, EDD identification is the deterrent

### Why lying is rare
Every user is Aadhaar-linked and fully identified. Submitting a forged bank statement is criminal fraud (IPC Section 465). They lose a verified membership they worked hard to obtain.

---

## 9. Subscription Collection

### Early Stage — Business UPI
- CryptoBazaar's registered business UPI ID displayed at checkout
- User pays manually via any UPI app
- User submits UTR number
- Team manually verifies against business bank account and activates subscription
- Same UTR verification flow familiar from the trading experience

### Growth Stage — Stripe
- Registered business account on Stripe
- Positioned as "compliance subscription software"
- Handles automated recurring billing
- Triggers when manual UTR flow becomes operationally unscalable

---

## 10. Insurance Fund

### INR Insurance Fund
- **Source:** Monthly subscription fees (₹200/₹500/₹1,000)
- **Currency:** INR, held in business bank account
- **Covers:** Bank freeze compensation — INR-denominated losses to members
- **Governance:** Business bank account, manual payouts by compliance team (Phase 1)

### Crypto Insurance Fund
- **Source:** 0.75% levy on every completed trade
- **Currency:** USDT/USDC, held in `InsuranceFund` smart contract on Polygon
- **Covers:** Crypto-side losses, platform emergencies, large claims
- **Governance:** 3-of-5 multisig (Phase 1) → community vote for claims >₹1L (Phase 2) → DAO (Phase 3)

### Claim Eligibility (both funds)
All must be true:
1. Active subscription at time of frozen trade
2. Valid EDD VC at time of trade
3. Trade executed through CryptoBazaar escrow (on-chain verifiable)
4. Bank freeze directly attributable to that trade (police notice or bank letter required)

### Claim Tiers

| Tier | Evidence | Max Payout | SLA | Fund |
|---|---|---|---|---|
| Emergency | Bank freeze notice + FIR number | ₹10,000 | 24 hours | INR Fund |
| Standard | Above + legal representation proof | ₹1,00,000 | 7 days | INR Fund |
| Full | Above + NOC / account unfrozen | ₹5,00,000 | 30 days | Both funds |

### Anti-Abuse
- Max 2 claims per user per year
- 90-day waiting period before first claim eligibility
- All claims cross-checked against on-chain trade records
- Fraudulent claim → permanent ban

---

## 11. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Vercel, shadcn/ui, Tailwind |
| Wallet & Web3 | ThirdWeb SDK (wallet connection, contract interaction, auth) |
| Backend API | Hono on Vercel (auth, orderbook, matching, EDD orchestration) |
| ML Service | Python 3.12 + FastAPI on Railway (XGBoost → GNN pipeline) |
| Smart Contracts | Foundry/Solidity (Polygon + Tron), Anchor/Rust (Solana); ThirdWeb for deployment |
| Database | NeonDB (serverless PostgreSQL) — PMLA 5-year audit trail |
| File Storage | IPFS via web3.storage — dispute evidence |
| Identity | Hyperledger Identus TypeScript SDK |
| KYC | HyperVerge API |
| Bank Statement Parsing & Tampering Detection | Perfios API or Authbridge BSA API |
| Wallet Screening | Nominis |
| Dispute Oracle | CryptoBazaar support team (internal dashboard) |
| USDC Cross-chain | Circle CCTP v2 |
| USDT Cross-chain | Wormhole |
| AI Interview Scoring | Claude API (claude-sonnet-4-6) |
| Subscription Billing | Business UPI (early) → Stripe (growth) |
| Monitoring | Sentry + Datadog |

---

## 12. Regulatory & Compliance

| Requirement | Approach |
|---|---|
| PMLA compliance | 5-year transaction records in NeonDB, STR/CTR filing pipeline |
| DPDPA compliance | Identus VCs — no raw personal data stored, explicit consent flows |
| TDS (1% on trades > ₹10,000) | Automated deduction + reporting in trade settlement flow |
| No fiat custody | Platform never touches INR — reduces RBI licensing exposure |
| Business registration | Required — already in place |
| FIU-IND registration | Deferred — to be pursued as platform scales |
| Legal counsel | Required to confirm VASP classification scope before launch |

---

## 13. What Was Deliberately Excluded

| Excluded | Reason |
|---|---|
| Hyperledger Cacti | Circle CCTP + Wormhole handle cross-chain for USDC/USDT specifically. Cacti is for heterogeneous enterprise chains. |
| Custodial wallets | Contradicts "platform holds nothing" |
| Payment gateways for INR trades | Banks won't cooperate with crypto platforms — manual UTR + Stripe for subscriptions only |
| Reclaim Protocol (zkTLS) | Too technically complex for general public UX. Deferred to future consideration. |
| Kleros / UMA dispute arbitration | Bank statements via Perfios are objective. Human arbitrators reviewing screenshots are not. |
| Dispute bonds | EDD identification + ban threat is the deterrent — bonds add friction without adding security |
| FIU registration | Deferred — not required for launch |
| Account Aggregator oracle | Requires FIU registration — deferred |
| Screenshots as dispute evidence | Easily faked — only bank statements via Perfios accepted |
| BTC / ETH trading | Out of scope — USDT and USDC only |

---

## 14. Phased Rollout

### Phase 1 — MVP (Month 0–3)
- 3-layer EDD onboarding (KYC + Bank Statement + AI Interview)
- Polygon + Solana + Tron (USDT/USDC)
- Manual UTR confirmation escrow (Binance-style)
- Dispute resolution via bank statement + Perfios + support team
- Two insurance funds (INR business account + Crypto smart contract)
- Subscription via business UPI + manual UTR activation
- Subscription tiers (Starter/Trader/Pro)

### Phase 2 — Automation (Month 3–6)
- Stripe integration for automated subscription billing
- GNN layer added to ML pipeline
- Community vote governance for large insurance claims
- Mobile app (React Native)

### Phase 3 — Scale (Month 6–12)
- FIU-IND registration pursued
- Account Aggregator oracle for payment verification (post-FIU)
- Insurance fund DAO
- Additional chains (Base, Arbitrum)
