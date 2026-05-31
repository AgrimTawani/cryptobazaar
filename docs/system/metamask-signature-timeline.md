# MetaMask Signature Timeline — Full Trade Flow

Every on-chain action that triggers a MetaMask popup, in chronological order across both parties.

---

## Happy Path (no disputes, no cancellations)

```
SELLER                                          BUYER
  |                                               |
  |  [1] approve(escrowContract, amount)          |
  |  ERC-20 approval — lets the escrow            |
  |  contract pull USDC from the seller's         |
  |  wallet when createOrder is called.           |
  |  Contract: USDC token contract                |
  |                                               |
  |  [2] createOrder(token, amount, priceInr)     |
  |  Transfers USDC from seller → escrow.         |
  |  Mints an on-chain order record.              |
  |  State: LISTED                                |
  |                                               |
  |                        [3] lockOrder(id)      |
  |                        Buyer commits to the   |
  |                        trade. Starts the      |
  |                        30-minute payment      |
  |                        window on-chain.       |
  |                        State: LOCKED          |
  |                                               |
  |                   (buyer sends INR off-chain) |
  |                                               |
  |                        [4] markPaid(id)       |
  |                        Buyer declares payment |
  |                        on-chain. Freezes the  |
  |                        timeout path so seller |
  |                        cannot reclaim.        |
  |                        State: PAID            |
  |                                               |
  |  [5] confirmPayment(id)                       |
  |  Seller verifies INR received.                |
  |  Escrow releases USDC to buyer                |
  |  minus 0.75% platform fee.                    |
  |  State: COMPLETED                             |
  |                                               |
```

**Total popups — happy path: Seller × 3, Buyer × 2 = 5 total**

---

## Branching Paths

### Seller cancels before any buyer locks

```
SELLER
  |
  |  [1] approve(...)          ← same as above
  |  [2] createOrder(...)      ← same as above
  |
  |  (no buyer yet — order is LISTED)
  |
  |  [3] cancelOrder(id)
  |  Escrow returns full USDC to seller.
  |  State: CANCELLED
```

**Total: Seller × 3, Buyer × 0**

---

### Buyer does not pay — seller reclaims after timeout

```
SELLER                                          BUYER
  |                                               |
  |  [1] approve(...)                             |
  |  [2] createOrder(...)                         |
  |                        [3] lockOrder(id)      |
  |                                               |
  |           (30-minute window expires)          |
  |           (buyer never calls markPaid)        |
  |                                               |
  |  [4] timeoutCancel(id)                        |
  |  Seller reclaims USDC from escrow.            |
  |  Only callable after expiry AND only if       |
  |  buyer never called markPaid.                 |
  |  State: CANCELLED                             |
```

**Total: Seller × 3, Buyer × 1**

---

### Dispute raised

Either party can raise a dispute after `markPaid` and before `confirmPayment`.

```
SELLER                                          BUYER
  |                                               |
  |  [1] approve(...)                             |
  |  [2] createOrder(...)                         |
  |                        [3] lockOrder(id)      |
  |                        [4] markPaid(id)       |
  |                                               |
  |  [5a] raiseDispute(id)     OR     [5b] raiseDispute(id)
  |  Seller disputes if INR            Buyer disputes if seller
  |  was not actually received.        goes silent / unresponsive.
  |  State: DISPUTED                   State: DISPUTED
  |
  |  (admin resolves off-chain — no further on-chain action by parties)
```

**Total: Seller × 4 or Buyer × 3 (whoever raises the dispute)**

---

## Quick Reference

| # | Who | Contract Call | When | Why |
|---|-----|---------------|------|-----|
| 1 | Seller | `USDC.approve(escrow, amount)` | Before posting | Grants escrow permission to pull tokens |
| 2 | Seller | `escrow.createOrder(token, amount, price)` | Posting | Deposits tokens into escrow, creates order |
| 3 | Buyer | `escrow.lockOrder(id)` | Clicking "Buy" | Commits to trade, starts 30-min timer |
| 4 | Buyer | `escrow.markPaid(id)` | After sending INR | Declares payment; blocks seller from timeout-cancelling |
| 5 | Seller | `escrow.confirmPayment(id)` | After verifying INR | Releases USDC to buyer |
| — | Seller | `escrow.cancelOrder(id)` | Any time while LISTED | Returns USDC if no buyer yet |
| — | Seller | `escrow.timeoutCancel(id)` | After timer hits 00:00, only if buyer never called markPaid | Reclaims USDC from a non-paying buyer |
| — | Seller or Buyer | `escrow.raiseDispute(id)` | After markPaid, before confirmPayment | Escalates to admin |

---

## Notes

- **Pop-up #1 (approve) is a one-time cost per session.** If the seller has previously approved an amount ≥ their current order size, MetaMask may not prompt again (depends on allowance remaining). In practice, the current code always calls `approve` fresh, so it always fires.
- **`markPaid` is the controversial one** — it is the only popup that surprises buyers, since they expect submitting a screenshot to be purely off-chain. It exists because the contract uses `msg.sender == o.buyer` to lock out `timeoutCancel`. Removing it is tracked as a future design decision.
- **Gas payer**: every signer pays their own gas in MATIC (Polygon) or BNB (BSC). Buyers need a small MATIC/BNB balance in addition to their USDC.
