# Dispute Resolution

## What it does
Resolves disagreements between buyer and seller about whether a fiat payment was made. Uses verified bank statement data — not screenshots — to determine the truth.

---

## Trade State Machine

Every trade moves through strict one-way states. Actions available to each party are gated by the current state.

```
CREATED → IN PROGRESS → PAID → COMPLETED
                           ↓
                        DISPUTED
```

| State | Seller can | Buyer can |
|---|---|---|
| CREATED | Cancel (tokens return) | — |
| IN PROGRESS | Cancel (before buyer pays) | Mark "I have paid" |
| PAID | ✅ Confirm receipt OR 🚩 Raise dispute | — |
| DISPUTED | Submit evidence | Submit evidence |
| COMPLETED | — | — |

**Critical rule:** Once the buyer clicks "I have paid" and submits a UTR, the seller's cancel button is permanently removed for that trade. The seller can only confirm payment or raise a dispute. This prevents the #1 P2P scam — seller cancelling after receiving fiat.

---

## Payment Verification Approach

CryptoBazaar does not have a payment gateway or FIU registration. UTR verification is therefore **not done programmatically in real time**.

This is intentional and is how all major P2P exchanges operate (Binance P2P, WazirX P2P, etc.).

### On the happy path
The seller verifies payment themselves by checking their own bank/UPI app. They see the credit, click "Payment Received", and the smart contract releases crypto. The platform never needs to touch the UTR.

### UTR is evidence, not a trigger
The UTR submitted by the buyer is stored on-record and used only if a dispute is raised. It is a supporting data point, not a real-time verification mechanism.

### Screenshots are not primary evidence
Screenshots are stored but not used as the basis for any ruling. They are too easily faked. Bank statements decide disputes.

---

## When a Dispute is Triggered

- Seller clicks "I did not receive payment" after the buyer marks paid
- Seller does not respond within **15 minutes** of the buyer marking paid (auto-escalation)
- Buyer claims they paid but the trade window expired

---

## How it Works

### Step 1 — Dispute Opened
The trade is locked. The USDT remains in the smart contract escrow. Neither party can access it. Both parties are notified and given **24 hours** to submit evidence.

### Step 2 — Evidence Submission
Both parties must submit:
- Their bank statement covering the date of the disputed trade (PDF upload)
- Any additional context (optional text)

The buyer's statement should show a debit for the trade amount.
The seller's statement should show either a credit (if payment was received) or no corresponding credit (if payment was not received).

### Step 3 — Tampering Detection
CryptoBazaar runs both submitted PDFs through Perfios/Authbridge — the same tool used in EDD onboarding:
- PDF metadata validation (edit timestamps, software fingerprint, font hash)
- Digital signature validation
- Anomaly detection for edited fields
- Image layer detection (text overlaid on PDF)
- OCR pattern consistency against known bank templates

**A tampered statement = immediate ruling against that party + permanent ban.**
No appeal. Submitting a forged bank document is criminal fraud under IPC Section 420 (cheating) and IPC Section 468 (forgery for purpose of cheating). Every user is Aadhaar-linked and fully identified. The platform can and will file a complaint.

### Step 4 — Cross-Reference Analysis
This is the core of why the system is robust. Both parties submit statements independently, and a real payment must appear on **both sides**:

```
Buyer's statement  →  Debit ₹10,000 at 14:34, UTR: XXXXXXXXX
Seller's statement →  Credit ₹10,000 at 14:34, UTR: XXXXXXXXX
```

To successfully deceive the platform, a fraudster must:
1. Produce a fake statement convincing enough to pass ML tampering detection **AND**
2. Have the other party's independently submitted genuine statement not contradict them

This second condition is nearly impossible to control. If a buyer fakes a debit that never happened, the seller's real statement will simply show no corresponding credit — case closed. If a seller claims no credit received but the buyer's real statement shows a matching debit and UTR — the contradiction is immediate and obvious.

### Step 5 — CryptoBazaar Support Review
The compliance team receives:
- Both tamper-verified bank statements
- The trade record (amount, UTR submitted by buyer, timestamp)
- Cross-reference analysis output
- Both parties' EDD history and on-platform trade history

They compare the buyer's debit against the seller's credit (or absence of). The answer is almost always unambiguous.

### Step 6 — Ruling

| Ruling | Action |
|---|---|
| Payment confirmed (buyer wins) | USDT released to buyer via `resolveDispute()` |
| Payment not confirmed (seller wins) | USDT returned to seller via `resolveDispute()` |
| Tampered evidence detected | Immediate ruling against forger + permanent ban |

The losing party's account is flagged. A second dispute loss results in a permanent ban.

---

## Last Resort — Insurance Fund

For the extremely rare case where sophisticated forgery passes all detection layers, the insurance fund compensates the victim. The fraudster is permanently banned and their identity is on record for legal action.

This makes the expected cost of attempting fraud far exceed any possible gain.

---

## Why This Works Without Payment Gateway Access

The cross-reference mechanism is the key insight. The platform is not trying to verify a UTR against a bank database — it is comparing two independently submitted documents that must agree with each other to tell a coherent story. This is a much harder problem for a fraudster to solve than defeating a single check in isolation.

Combined with:
- Real verified identity (Aadhaar + PAN) making fraud a criminal matter with real consequences
- ML tampering detection catching edited PDFs
- Insurance fund absorbing edge-case losses

The system is robust without any payment gateway, NPCI API access, or FIU registration.

---

## What is NOT Used for Payment Disputes
- Screenshots (stored as supporting context only, not decision-making evidence)
- Buyer's word vs seller's word (irrelevant — bank data decides)
- UTR real-time lookup (no gateway/FIU access — not needed)
- Third-party arbitration services like Kleros (unnecessary when bank data is objective)

---

## Tech
- **Tampering detection:** Perfios API or Authbridge BSA API
- **Evidence storage:** IPFS (PDFs pinned on upload)
- **Dispute state:** NeonDB
- **Escrow lockup during dispute:** Smart contract holds funds until ruling is submitted
- **Ruling execution:** CryptoBazaar compliance dashboard triggers smart contract `resolveDispute(address winner)` call
- **Auto-escalation:** 15-minute server-side timer; cron job checks IN_PROGRESS trades and auto-opens disputes on expiry
