# Dispute Resolution

## What it does
Resolves disagreements between buyer and seller about whether a fiat payment was made. Uses verified bank statement data — not screenshots — to determine the truth.

---

## When a dispute is triggered
- Seller clicks "I did not receive payment" after the buyer marks paid
- Seller does not respond within 15 minutes of the buyer marking paid
- Buyer claims they paid but the trade window expired

---

## How it works

### Step 1 — Dispute Opened
The trade is locked. The USDT remains in the smart contract escrow. Neither party can access it. Both parties are notified and given 24 hours to submit evidence.

### Step 2 — Evidence Submission
Both parties must submit:
- Their bank statement covering the date of the disputed trade (PDF upload)
- Any additional context (optional text)

The buyer's statement should show a debit for the trade amount.
The seller's statement should show either a credit (if payment was received) or no corresponding credit (if payment was not received).

### Step 3 — Tampering Detection
CryptoBazaar runs both submitted PDFs through Perfios/Authbridge — the same tool used in EDD onboarding:
- PDF metadata validation
- Digital signature validation
- Anomaly detection for edited fields

**A tampered statement = immediate ruling against that party + permanent ban.**
No appeal. Submitting a forged bank document is criminal fraud. The user is Aadhaar-linked and fully identified.

### Step 4 — CryptoBazaar Support Review
The compliance team receives:
- Both verified bank statements
- The trade record (amount, UTR submitted by buyer, timestamp)
- Both parties' EDD history and on-platform trade history

They compare the buyer's debit against the seller's credit (or lack of). The answer is almost always clear.

### Step 5 — Ruling
The support team makes a final ruling:

| Ruling | Action |
|---|---|
| Payment confirmed (buyer wins) | USDT released to buyer |
| Payment not confirmed (seller wins) | USDT returned to seller |

The losing party's account is flagged. A second dispute loss results in a permanent ban.

---

## Why this works

The EDD process already established that users are comfortable submitting real bank statements and that the platform can detect fake ones. The same infrastructure that screens users on entry is the mechanism that resolves disputes. Bad actors who try to fake statements during a dispute face the same detection — and they're fully identified via Aadhaar, so the consequences are real.

---

## What is NOT used for payment disputes
- Screenshots (easily faked, not accepted as primary evidence)
- Buyer's word vs seller's word (irrelevant — bank data decides)
- Third-party arbitration services like Kleros (unnecessary when bank data is objective)

---

## Tech
- **Tampering detection:** Perfios API or Authbridge BSA API
- **Evidence storage:** IPFS (PDFs pinned on upload)
- **Dispute state:** NeonDB
- **Escrow lockup during dispute:** Smart contract holds funds until ruling is submitted
- **Ruling execution:** CryptoBazaar compliance dashboard triggers smart contract `resolveDispute()` call
