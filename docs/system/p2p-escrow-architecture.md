# P2P Escrow — Smart Contract Architecture & Trade Flow

> Reference doc. Captures the authoritative design decisions made for the escrow system.
> Supersedes the "per-order contract" language in `features/06-trade-execution.md` (that was the old assumption — corrected here).

---

## Core Architecture Decision: One Master Contract

**Decision: One master escrow contract per chain, not one contract per order.**

### Why not per-order?
- Deploying a contract costs ~200,000–500,000 gas. A storage write (creating an order inside an existing contract) costs ~50,000 gas.
- At 1,000 orders/month that is a 5–10× cost difference.
- Per-order contracts are hard to audit, upgrade, or track events from.
- Users would need to `approve()` a new contract address for every single trade.

### Why one master contract?
- Single auditable, upgradeable contract (OpenZeppelin UUPS proxy pattern).
- Users `approve()` once and can trade indefinitely.
- All events emitted from one address — easy to index, easy to track.
- Standard approach used by all major P2P DEXes.

### One contract per supported chain
The master contract is deployed independently on each chain we support:

| Chain | Asset | Notes |
|---|---|---|
| Polygon | USDT (ERC-20, 6 decimals) | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` |
| BSC | USDT (BEP-20, 18 decimals) | `0x55d398326f99059fF775485246999027B3197955` |
| Solana | USDC (SPL, 6 decimals) | Anchor program, not Solidity |
| TRON | USDT (TRC-20, 6 decimals) | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` |

---

## Order Struct

```solidity
enum Status {
    OPEN,        // seller posted, waiting for a buyer to lock
    LOCKED,      // buyer locked in, waiting for INR payment
    PAID,        // buyer marked payment done (UTR submitted)
    DISPUTED,    // dispute raised — funds frozen in contract
    COMPLETED,   // seller confirmed receipt — USDT released to buyer
    CANCELLED    // cancelled before any buyer locked (USDT returned to seller)
}

struct Order {
    uint256 id;
    address seller;
    address buyer;        // address(0) until lockOrder() is called
    uint256 amount;       // USDT amount held in escrow (in token's native units)
    uint256 priceInr;     // INR per unit × 100 (e.g. 9500 = ₹95.00) — display only
    Status  status;
    uint256 createdAt;
    uint256 lockedAt;     // set in lockOrder(), used for timeout enforcement
    uint256 paidAt;       // set in markPaid(), used for auto-dispute timer
}

mapping(uint256 => Order) public orders;
uint256 public nextOrderId;
```

---

## State Machine

```
OPEN
  ├─ seller calls cancelOrder()    → CANCELLED  (USDT returned to seller)
  └─ buyer calls lockOrder()       → LOCKED

LOCKED
  ├─ 30 min timeout (no markPaid)  → seller can call timeoutCancel() → CANCELLED
  └─ buyer calls markPaid()        → PAID

PAID
  ├─ seller calls confirmPayment() → COMPLETED  (USDT released to buyer, 0.75% to insurance fund)
  ├─ seller calls raiseDispute()   → DISPUTED
  └─ 15 min auto-escalation (cron) → DISPUTED   (server-side timer, not on-chain)

DISPUTED
  └─ admin calls resolveDispute()  → COMPLETED or CANCELLED

COMPLETED — terminal
CANCELLED  — terminal
```

**Critical rule (anti-scam):** Once a buyer calls `markPaid()`, the seller permanently loses the ability to cancel. They can only confirm or dispute. This eliminates the #1 P2P scam — seller cancelling after receiving fiat.

---

## Contract Functions

### `createOrder(uint256 amount, uint256 priceInr)`
Called by: Seller

```
1. USDT.transferFrom(seller, address(this), amount)
2. orders[nextOrderId] = Order(nextOrderId, seller, address(0), amount, priceInr, OPEN, block.timestamp, 0, 0)
3. emit OrderCreated(id, seller, amount, priceInr)
4. nextOrderId++
```

Seller must call `USDT.approve(escrowContract, amount)` first.

---

### `lockOrder(uint256 orderId)`
Called by: Buyer

```
1. require(order.status == OPEN)
2. require(msg.sender != order.seller)   // can't buy own order
3. order.buyer = msg.sender              // BUYER ADDRESS STORED HERE — not before
4. order.status = LOCKED
5. order.lockedAt = block.timestamp
6. emit OrderLocked(orderId, buyer)
```

The buyer address is intentionally **not stored at order creation** — it is unknown until this call. This is standard and fully safe.

Backend response to `OrderLocked` event: create chat room in DB for this (seller, buyer, orderId) pair.

---

### `markPaid(uint256 orderId)`
Called by: Buyer

```
1. require(msg.sender == order.buyer)
2. require(order.status == LOCKED)
3. order.status = PAID
4. order.paidAt = block.timestamp
5. emit PaymentMarked(orderId, buyer)
```

**Whether this is an on-chain call or off-chain DB update is a build decision.** Making it on-chain costs the buyer gas but creates an immutable record. Off-chain is cheaper but relies on the backend. Recommendation: make it on-chain for trust, give buyers a gas subsidy if needed.

Backend response to `PaymentMarked` event: notify seller, start 15-minute auto-dispute countdown.

---

### `confirmPayment(uint256 orderId)`
Called by: Seller

```
1. require(msg.sender == order.seller)
2. require(order.status == PAID)
3. uint256 fee = (order.amount * 75) / 10000     // 0.75%
4. USDT.transfer(insuranceFund, fee)
5. USDT.transfer(order.buyer, order.amount - fee)
6. order.status = COMPLETED
7. emit OrderCompleted(orderId, buyer, order.amount - fee, fee)
```

---

### `raiseDispute(uint256 orderId)`
Called by: Seller or Buyer

```
1. require(msg.sender == order.seller || msg.sender == order.buyer)
2. require(order.status == PAID)               // dispute only valid after buyer marks paid
3. order.status = DISPUTED
4. emit DisputeRaised(orderId, msg.sender)
```

Funds remain in contract until `resolveDispute()` is called. Neither party can touch them.

---

### `cancelOrder(uint256 orderId)`
Called by: Seller

```
1. require(msg.sender == order.seller)
2. require(order.status == OPEN)    // can only cancel before any buyer locks
3. USDT.transfer(seller, order.amount)
4. order.status = CANCELLED
5. emit OrderCancelled(orderId)
```

---

### `timeoutCancel(uint256 orderId)`
Called by: Seller (after buyer locks but doesn't pay)

```
1. require(msg.sender == order.seller)
2. require(order.status == LOCKED)
3. require(block.timestamp >= order.lockedAt + 30 minutes)
4. USDT.transfer(seller, order.amount)
5. order.status = CANCELLED
6. emit OrderTimedOut(orderId)
```

---

### `resolveDispute(uint256 orderId, address winner)`
Called by: Admin/Compliance wallet (multisig)

```
1. require(hasRole(ADMIN_ROLE, msg.sender))
2. require(order.status == DISPUTED)
3. if winner == order.buyer:
       USDT.transfer(buyer, order.amount)       // buyer wins
   else:
       USDT.transfer(seller, order.amount)      // seller wins (no fee taken on dispute)
4. order.status = COMPLETED
5. emit DisputeResolved(orderId, winner)
```

---

## Timeout Rules

| Scenario | Who acts | Trigger | Action |
|---|---|---|---|
| Buyer locked but didn't pay in 30 min | Seller | On-chain (`block.timestamp`) | `timeoutCancel()` → USDT back to seller |
| Seller didn't confirm within 15 min of `markPaid` | Cron job (backend) | Off-chain timer | Auto-call `raiseDispute()` via admin wallet |
| Dispute open but no evidence submitted in 24h | Admin | Manual review | Rule in favour of cooperative party |

The 15-minute seller-response timeout is **server-side**, not on-chain. A cron job monitors `PAID` orders and calls `raiseDispute()` via the platform's admin wallet when the timer expires. This is intentional — enforcing it on-chain requires a keeper/oracle setup; off-chain is simpler and just as trustless because the dispute state change still goes on-chain.

---

## On-chain vs Off-chain Responsibility Split

| Responsibility | On-chain (Contract) | Off-chain (Backend + DB) |
|---|---|---|
| USDT custody | ✅ | ❌ |
| Seller & buyer address binding | ✅ | ❌ |
| Order state transitions | ✅ | Mirrored for UI speed |
| Fee collection to insurance fund | ✅ | ❌ |
| Dispute resolution execution | ✅ (via admin wallet) | Decision made here |
| INR price, UTR numbers | ❌ | ✅ |
| Chat messages | ❌ | ✅ |
| Dispute evidence (bank PDFs) | IPFS hash on-chain (optional) | Full PDF in R2/IPFS |
| 15-min auto-dispute timer | ❌ (cron job) | ✅ |
| Pre-trade KYC/wallet screening | ❌ | ✅ (Nominis API) |
| Order book / listings UI | ❌ | ✅ (NeonDB) |

**The contract is the source of truth for money. The DB is the source of truth for everything else.**

---

## Full Trade Flow (End-to-End)

### Step 1 — Seller posts listing
- Seller fills in amount, rate, payment methods on the frontend.
- Frontend calls `USDT.approve(escrowContract, amount)` via ThirdWeb.
- Frontend calls `escrowContract.createOrder(amount, priceInr)`.
- Backend listens for `OrderCreated` event → saves order to DB with `status: OPEN`.
- Listing appears on the marketplace.

### Step 2 — Buyer locks the order
- Buyer browses listings, clicks "Buy".
- Backend runs pre-trade checks: both parties VERIFIED, both have active subscription, both wallets pass Nominis screening.
- If clean: frontend calls `escrowContract.lockOrder(orderId)` via ThirdWeb.
- Backend listens for `OrderLocked` event → sets `status: LOCKED` in DB, creates chat room for (seller, buyer, orderId).
- Trade window opens. Buyer's address is now bound to this order in the contract.

### Step 3 — Buyer sends INR
- Chat room is live. Seller's payment details (UPI/account number) are shown to the buyer.
- Buyer sends INR via UPI / IMPS / NEFT directly to seller's bank — no platform involvement.
- Buyer enters UTR number into the trade UI.

### Step 4 — Buyer marks payment done
- Buyer clicks "I Have Paid".
- Frontend calls `escrowContract.markPaid(orderId)` (on-chain) OR backend updates DB (off-chain). See note in `markPaid()` above.
- Backend: seller's Cancel button is removed permanently. Seller now sees only "Payment Received" and "Raise Dispute".
- Backend: 15-minute countdown starts. Cron job registered.
- Seller receives push notification.

### Step 5a — Seller confirms (happy path)
- Seller checks bank app, sees INR credit.
- Seller clicks "Payment Received".
- Frontend calls `escrowContract.confirmPayment(orderId)`.
- Contract: deducts 0.75% → insurance fund. Sends remainder to buyer's wallet.
- Backend: trade marked `COMPLETED`. Chat room closed. Stats updated.

### Step 5b — Seller disputes
- Seller believes no payment was received.
- Seller clicks "Raise Dispute".
- Frontend calls `escrowContract.raiseDispute(orderId)`.
- Backend: trade enters `DISPUTED`. Both parties prompted to upload bank statements within 24h. Flow continues in `features/07-disputes.md`.

### Step 5c — Auto-escalation
- 15 minutes pass after `markPaid`, seller has not acted.
- Cron job fires → platform admin wallet calls `raiseDispute(orderId)`.
- Same dispute flow as Step 5b.

---

## Fee Structure

```
Trade completes → seller confirms → confirmPayment() executes:

  gross = order.amount
  fee   = gross × 0.75%          → transferred to Insurance Fund contract
  net   = gross - fee            → transferred to buyer
```

Fee is only deducted on successful completion. Disputed and cancelled orders return full amounts (no fee taken on loss/dispute).

---

## Events Emitted (for backend indexing)

```solidity
event OrderCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 priceInr);
event OrderLocked(uint256 indexed id, address indexed buyer);
event PaymentMarked(uint256 indexed id, address indexed buyer);
event OrderCompleted(uint256 indexed id, address indexed buyer, uint256 amountTobuyer, uint256 fee);
event DisputeRaised(uint256 indexed id, address indexed raisedBy);
event DisputeResolved(uint256 indexed id, address indexed winner);
event OrderCancelled(uint256 indexed id);
event OrderTimedOut(uint256 indexed id);
```

Backend uses ThirdWeb SDK to listen for these events and keep the DB in sync with on-chain state.

---

## Chain-Specific Notes

### Polygon & BSC (EVM — Solidity)
- Same Solidity contract, deployed separately on each chain.
- USDT has 6 decimals on Polygon, 18 decimals on BSC — contract must account for this in fee math.
- ThirdWeb v5 handles wallet connect + contract calls for both.
- Seller must call `USDT.approve()` before `createOrder()`.

### TRON (TRC-20 — Solidity, TronWeb-compatible)
- Solidity contract works on TRON with minor adjustments (TronWeb ABI encoding).
- USDT TRC-20 has 6 decimals.
- Wallet: TronLink or any `window.tronWeb`-injecting wallet.
- TRON addresses are base58 (T-prefix) on-chain, not 0x hex.

### Solana (SPL — Anchor / Rust)
- Completely separate codebase — Anchor program, not Solidity.
- USDC SPL token, 6 decimals.
- Escrow uses a Program Derived Address (PDA) to hold tokens.
- Wallet: Phantom via `window.phantom.solana`.
- The same state machine and business logic applies, implemented in Rust.

---

## Security Considerations

- **Reentrancy:** Use OpenZeppelin `ReentrancyGuard` on all state-changing functions.
- **Admin wallet:** Use a Gnosis Safe multisig for `resolveDispute()` — never a single EOA.
- **Upgradability:** UUPS proxy so bugs can be patched. Use a timelock on upgrades.
- **Token whitelist:** Contract should only accept pre-approved USDT/USDC token addresses — no arbitrary ERC-20.
- **Integer math:** All fee math in Solidity using `uint256`; no floating point.
- **Audit:** Full third-party audit before mainnet. Deploy to Polygon Mumbai testnet first.

---

## What Still Needs to Be Built

- [ ] Solidity contract (`CryptoBazaarEscrow.sol`) — Foundry project
- [ ] Anchor program for Solana
- [ ] Backend event listener (ThirdWeb + webhook/polling)
- [ ] Marketplace UI (listing browse, trade window, chat)
- [ ] Admin dispute dashboard (compliance team triggers `resolveDispute()`)
- [ ] Cron job for 15-minute auto-dispute escalation
- [ ] Insurance Fund contract
- [ ] Testnet deployment + integration tests
