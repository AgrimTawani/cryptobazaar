# Database Schema — CryptoBazaar

## Overview

PostgreSQL via NeonDB. ORM: Prisma with `@prisma/adapter-neon` (serverless-compatible).

All monetary values stored as `Decimal` (exact precision, not float). IPFS hashes stored as strings. No raw Aadhaar/PAN numbers stored anywhere — only masked references and session IDs.

---

## User Status Tags

Every user has exactly one status at all times:

| Status | Meaning |
|---|---|
| `LOGIN_DONE` | Signed in via Google. No onboarding started. |
| `ONBOARDING_PENDING` | Actively in the onboarding flow (KYC/EDD/Interview) |
| `WALLET_PENDING` | Passed all 3 verification layers. Needs to connect wallet. |
| `VERIFICATION_PENDING` | Wallet connected. Nominis screening in progress. |
| `VERIFIED` | Fully verified. Can trade. |
| `REJECTED` | Failed one or more verification layers. Cannot trade. |
| `SUSPENDED` | Banned by compliance team. |

---

## Tables

### `users`

Core user record. Created immediately on first Clerk login.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `clerk_id` | String (unique) | From Clerk OAuth |
| `status` | Enum | See UserStatus above |
| `email` | String | From Google account |
| `name` | String | From Google account |
| `avatar_url` | String | From Google account |
| `phone` | String | From Didit KYC |
| `date_of_birth` | DateTime | From Didit KYC document |
| `gender` | String | From Didit KYC document |
| `aadhaar_last4` | String | Last 4 digits only — reference only |
| `pan_masked` | String | e.g. `ABCDE****F` — reference only |
| `address` | String | Full address from Aadhaar via Didit |
| `city` | String | From Aadhaar |
| `state` | String | From Aadhaar |
| `pincode` | String | From Aadhaar |
| `kyc_session_id` | String | Didit session ID (reference, not PII) |
| `kyc_provider` | String | `"didit"` |
| `kyc_verified_at` | DateTime | When KYC passed |
| `kyc_expires_at` | DateTime | 6 months after KYC |
| `did` | String (unique) | Hyperledger Identus DID |
| `kyc_credential_id` | String | Identus VC ID for KYC layer |
| `edd_credential_id` | String | Identus VC ID for EDD layer |
| `interview_cred_id` | String | Identus VC ID for interview layer |
| `wallet_address` | String (unique) | User's crypto wallet address |
| `wallet_chain` | String | Primary chain (polygon/solana/tron) |
| `wallet_verified_at` | DateTime | When Nominis screening passed |
| `subscription_tier` | Enum | STARTER / TRADER / PRO |
| `subscription_expires_at` | DateTime | When current subscription ends |
| `monthly_trade_volume_inr` | Decimal | Resets monthly |
| `total_trade_volume_inr` | Decimal | Lifetime cumulative |
| `trade_count` | Int | Total completed trades |
| `volume_reset_at` | DateTime | Last time monthly volume was reset |

**What we store from Didit KYC:**
- Session ID only (not the raw data stream)
- Name, DOB, gender, address, city, state, pincode — from OCR output
- Aadhaar last 4 digits — for reference display
- PAN masked — for reference display
- Phone — if captured during liveness
- Verification timestamp + expiry
- We NEVER store: full Aadhaar number, full PAN, biometric data, face images

**What we store from Hyperledger Identus:**
- The DID itself (the decentralised identifier)
- Credential IDs for each layer (KYC, EDD, Interview) — reference pointers to VCs issued to the DID
- Verification and expiry timestamps per layer
- We NEVER store: VC content (lives on the DID/chain), private keys (user holds these)

---

### `onboarding_records`

One record per verification attempt per layer. A user can have multiple records for a layer (retries after rejection).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `user_id` | FK → users | |
| `layer` | Enum | KYC / EDD / INTERVIEW |
| `status` | Enum | PENDING / IN_PROGRESS / PASSED / FAILED |
| `attempt_number` | Int | Increments on retry |
| `score` | Float | ML score (EDD) or AI score (interview) |
| `result` | JSON | Raw result payload from provider |
| `rejection_reason` | String | Why it failed |
| `vc_credential_id` | String | Identus VC ID issued on pass |
| `reapply_after` | DateTime | 30 days from rejection |
| `completed_at` | DateTime | When this attempt concluded |
| `expires_at` | DateTime | When this credential expires (6 months) |

---

### `wallet_screens`

Every wallet address is screened via Nominis before a user can trade.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `user_id` | FK → users | |
| `wallet_address` | String | The address screened |
| `provider` | String | `"nominis"` |
| `risk_score` | Float | 0-100 |
| `risk_level` | Enum | LOW / MEDIUM / HIGH / BLOCKED |
| `flags` | JSON | Array of flags from Nominis |
| `is_passed` | Boolean | Whether screening passed |
| `raw_response` | JSON | Full Nominis API response |
| `screened_at` | DateTime | |

---

### `subscriptions`

One record per monthly payment. History preserved.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `user_id` | FK → users | |
| `tier` | Enum | STARTER / TRADER / PRO |
| `status` | Enum | ACTIVE / EXPIRED / CANCELLED |
| `amount_paid` | Decimal | INR amount paid |
| `utr` | String | UTR number of the UPI payment |
| `paid_at` | DateTime | When payment was confirmed |
| `valid_from` | DateTime | |
| `valid_until` | DateTime | |
| `notes` | String | Optional admin notes |

---

### `orders`

The marketplace listing + trade lifecycle in one table. Every P2P trade starts as an order posted by a seller.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Internal ID |
| `order_id` | String (unique) | Human-readable: `CB-240508-00001` |
| `seller_id` | FK → users | |
| `buyer_id` | FK → users | Null until matched |
| `asset` | Enum | USDT / USDC |
| `chain` | Enum | POLYGON / SOLANA / TRON |
| `amount` | Decimal | Crypto amount |
| `price_per_unit` | Decimal | INR per crypto unit |
| `total_value_inr` | Decimal | amount × price_per_unit |
| `min_trade_size` | Decimal | Min INR a buyer can buy |
| `max_trade_size` | Decimal | Max INR a buyer can buy |
| `accepted_payment_methods` | Enum[] | UPI / IMPS / NEFT |
| `seller_upi_id` | String | Encrypted at app layer |
| `seller_bank_account` | String | Encrypted at app layer |
| `seller_ifsc` | String | Encrypted at app layer |
| `status` | Enum | See Order States below |
| `escrow_contract_address` | String | Smart contract address |
| `escrow_tx_hash` | String | Tx hash when funds were locked |
| `release_tx_hash` | String | Tx hash when funds released to buyer |
| `levy_tx_hash` | String | Tx hash of 0.75% to fund contract |
| `utr` | String | UTR submitted by buyer |
| `payment_method` | Enum | How buyer paid |
| `payment_screenshot_ipfs` | String | IPFS hash of screenshot |
| `payment_window_expires_at` | DateTime | 30 min from escrow funded |
| `payment_submitted_at` | DateTime | When buyer clicked "I paid" |
| `confirmation_window_expires_at` | DateTime | 15 min from buyer_paid |
| `seller_confirmed_at` | DateTime | When seller confirmed |
| `cancelled_at` | DateTime | |
| `completed_at` | DateTime | |

**Order States:**

| State | Meaning |
|---|---|
| `LISTED` | Seller posted. No buyer yet. Seller can cancel. |
| `MATCHED` | Buyer initiated. Pre-checks running. |
| `ESCROW_PENDING` | Pre-checks passed. Waiting for seller to fund escrow. |
| `ESCROW_FUNDED` | Crypto locked. Buyer has 30 min to pay. |
| `BUYER_PAID` | Buyer clicked "I paid" + submitted UTR. **Seller loses cancel button.** |
| `COMPLETED` | Seller confirmed. Smart contract released crypto. |
| `DISPUTED` | Either party raised a dispute. |
| `DISPUTE_RESOLVED_BUYER` | Dispute ruled in buyer's favour. |
| `DISPUTE_RESOLVED_SELLER` | Dispute ruled in seller's favour. |
| `EXPIRED` | Buyer didn't pay in 30 min. Crypto returned to seller. |
| `CANCELLED` | Seller cancelled before escrow was funded. |

---

### `disputes`

One dispute per order (unique constraint on order_id).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `order_id` | FK → orders (unique) | |
| `raised_by_id` | FK → users | Who triggered the dispute |
| `raised_by_role` | String | `"BUYER"` or `"SELLER"` |
| `status` | Enum | OPEN / EVIDENCE_SUBMITTED / UNDER_REVIEW / RESOLVED_BUYER / RESOLVED_SELLER |
| `evidence_deadline` | DateTime | 24h from dispute opened |
| `buyer_bank_statement_ipfs` | String | IPFS hash of buyer's PDF |
| `seller_bank_statement_ipfs` | String | IPFS hash of seller's PDF |
| `buyer_statement` | String | Buyer's written description |
| `seller_statement` | String | Seller's written description |
| `buyer_evidence_submitted_at` | DateTime | |
| `seller_evidence_submitted_at` | DateTime | |
| `buyer_statement_tampered` | Boolean | From Perfios/Authbridge ML |
| `seller_statement_tampered` | Boolean | From Perfios/Authbridge ML |
| `resolution` | String | Compliance team's ruling explanation |
| `resolved_by` | String | Admin identifier |
| `resolved_at` | DateTime | |

---

### `protection_fund_claims`

Claims against the Member Protection Fund.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `user_id` | FK → users | |
| `order_id` | FK → orders | The trade that caused the freeze |
| `tier` | Enum | EMERGENCY / STANDARD / FULL |
| `status` | Enum | SUBMITTED / UNDER_REVIEW / APPROVED / REJECTED / DISBURSED |
| `bank_freeze_notice_ipfs` | String | IPFS hash of freeze notice |
| `fir_or_complaint_ipfs` | String | IPFS hash of FIR/complaint |
| `legal_representation_ipfs` | String | IPFS hash of legal proof |
| `noc_ipfs` | String | IPFS hash of NOC/unfreeze proof |
| `requested_amount` | Decimal | INR requested by member |
| `approved_amount` | Decimal | INR approved by team |
| `disbursed_amount` | Decimal | INR actually disbursed |
| `review_notes` | String | Internal compliance notes |
| `reviewed_by` | String | Admin identifier |
| `reviewed_at` | DateTime | |
| `disbursed_at` | DateTime | |
| `disbursement_tx_hash` | String | On-chain payout transaction |

---

## Key Design Decisions

1. **One orders table for listings AND trades** — A listing becomes a trade in-place via status transitions. Simpler than separate tables, trade history is the order history.

2. **Soft deletion** — Nothing is hard-deleted. Status changes to CANCELLED/REJECTED/SUSPENDED preserve audit trail.

3. **IPFS for evidence** — Bank statements and screenshots are pinned to IPFS. Only hashes stored in DB. Tamper-proof and not on our servers.

4. **Encrypted payment details** — `seller_upi_id`, `seller_bank_account`, `seller_ifsc` are encrypted at the application layer before storage. Decrypted only for the matched buyer.

5. **Monthly volume tracking** — `monthly_trade_volume_inr` resets on the 1st of every month via a cron job. `volume_reset_at` tracks when last reset occurred.

6. **No raw financial identifiers** — We store Aadhaar last 4 and masked PAN only. No full numbers stored anywhere.
