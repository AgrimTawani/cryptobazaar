# Escrow Contract - Implementation Guide

## Overview
New escrow contract to hold USDC/USDT when sellers create orders. Replaces the current TokenLocker contract with a more robust order management system.

---

## Contract Flow

### 1. Create Sell Order
```
Seller → Approve USDC → createOrder() → USDC locked in Escrow → Order listed in marketplace
```

**Process:**
1. User approves USDC spending for Escrow Contract
2. User calls `createOrder(amount, rate, duration)`
3. USDC transferred from user to Escrow Contract
4. Contract emits `OrderCreated(orderId, seller, amount, expiresAt)`
5. Frontend creates order in database with on-chain orderId

### 2. Complete Order (Buyer Purchases)
```
Buyer pays INR → Seller confirms → releaseOrder() → USDC sent to buyer → Order COMPLETED
```

**Process:**
1. Buyer transfers INR to seller (off-chain)
2. Seller calls `releaseOrder(orderId, buyerAddress)`
3. Escrow transfers USDC to buyer's wallet
4. Order status updated to `COMPLETED`

### 3. Cancel Order
```
Seller → cancelOrder() → USDC returned to seller → Order CANCELLED
```

**Process:**
1. Seller calls `cancelOrder(orderId)` (only if no buyer committed)
2. Escrow returns USDC to seller
3. Order status updated to `CANCELLED`

### 4. Expire Order
```
Time expires → expireOrder() → USDC returned to seller → Order EXPIRED
```

**Process:**
1. Order reaches expiration timestamp
2. Anyone calls `expireOrder(orderId)`
3. Escrow returns USDC to seller
4. Order status updated to `EXPIRED`

---

## Contract Functions

```solidity
// Create order and lock USDC in escrow
function createOrder(uint256 amount, uint256 rate, uint256 duration) external returns (uint256 orderId)

// Release USDC to buyer (seller only)
function releaseOrder(uint256 orderId, address buyer) external

// Cancel order and return USDC (seller only, if no buyer)
function cancelOrder(uint256 orderId) external

// Expire order and return USDC (anyone can call after expiration)
function expireOrder(uint256 orderId) external

// View functions
function getOrder(uint256 orderId) external view returns (Order memory)
function getSellerOrders(address seller) external view returns (uint256[] memory)
```

**Order Struct:**
```solidity
struct Order {
    uint256 orderId;
    address seller;
    uint256 amount;
    uint256 rate;
    uint256 createdAt;
    uint256 expiresAt;
    address buyer;
    OrderStatus status; // ACTIVE, COMPLETED, CANCELLED, EXPIRED
}
```

---

## Critical Tests Required

### ✅ Test 1: USDC Transfer with ZERO POL

**Scenario:**
- Wallet has 100 USDC
- Wallet has **0 POL tokens**
- Try to create sell order

**Questions:**
- ❓ Will transaction fail due to insufficient gas?
- ❓ Does user need POL to pay gas fees?
- ❓ What error message appears in MetaMask?

**Expected Result:**
- ❌ Transaction SHOULD FAIL - "Insufficient funds for gas"
- ✅ POL is required to pay gas fees on Polygon
- ✅ Frontend should check POL balance before transaction

**Test Steps:**
1. Create wallet with USDC but 0 POL
2. Try to approve USDC → observe error
3. Try to call createOrder() → observe error
4. Document minimum POL needed

---

### ✅ Test 2: USDT Transfer with ZERO POL

**Scenario:**
- Wallet has 100 USDT
- Wallet has **0 POL tokens**
- Try to create sell order

**Questions:**
- ❓ Same as USDC test - will USDT transfer need POL?
- ❓ Any difference between USDC and USDT gas requirements?

**Expected Result:**
- ✅ Same as USDC - transaction SHOULD FAIL
- ✅ USDC and USDT are both ERC20 - identical gas behavior
- ✅ Gas is paid in POL, not the token being transferred

**Test Steps:**
1. Deploy escrow with USDT address
2. Create wallet with USDT but 0 POL
3. Verify same failure as USDC test
4. Confirm identical behavior

---

### ✅ Test 3: Minimum POL Required

**Goal:** Find minimum POL balance needed for transactions

**Test Steps:**
1. Start with 0.001 POL, increment gradually
2. Test approve() + createOrder()
3. Document gas costs:
   - Approve gas cost: ~45,000 gas
   - CreateOrder gas cost: ~100,000 gas
   - Total POL needed: ~0.001-0.01 POL

---

### ✅ Test 4: Escrow Balance Verification

**Test Steps:**
1. Check user USDC balance before order
2. Create order for 10 USDC
3. Verify user balance decreased by 10
4. Verify escrow contract balance increased by 10
5. Cancel order
6. Verify USDC returned to user

---

### ✅ Test 5: Edge Cases

| Test Case | Expected Behavior |
|-----------|-------------------|
| Create order with 0 amount | ❌ Revert: "Amount must be > 0" |
| Amount > user balance | ❌ Transfer fails: "Insufficient balance" |
| Release as non-seller | ❌ Revert: "Only seller can release" |
| Cancel after buyer committed | ❌ Revert: "Buyer already committed" |
| Expire before expiration time | ❌ Revert: "Not expired yet" |
| Reentrancy attack | ✅ Protected by ReentrancyGuard |

---

## Frontend Changes Needed

### 1. Pre-Transaction Check
```typescript
async function checkBalances(amount: number) {
  const usdcBalance = await getUSDCBalance(userAddress);
  const polBalance = await getPOLBalance(userAddress);
  
  if (usdcBalance < amount) {
    throw new Error("Insufficient USDC");
  }
  
  if (polBalance < 0.01) {
    throw new Error("Need POL for gas. Get POL from faucet.");
  }
}
```

### 2. Error Handling
```typescript
try {
  await createOrder();
} catch (error: any) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    showError("Need POL for gas fees");
  }
}
```

---

## Database Schema Update

```prisma
model Order {
  id              String   @id @default(cuid())
  orderId         Int      // On-chain order ID
  sellerId        String
  amount          Float
  rate            Float
  walletAddress   String
  buyerAddress    String?
  status          OrderStatus
  expiresAt       DateTime
  escrowTxHash    String
  releaseTxHash   String?
  cancelTxHash    String?
  createdAt       DateTime @default(now())
}
```

---

## Deployment Checklist

- [ ] Deploy Escrow Contract to Polygon Amoy
- [ ] Verify contract on Polygonscan
- [ ] Test all functions on testnet
- [ ] **Perform gas tests with 0 POL**
- [ ] Document minimum POL required
- [ ] Update frontend contract address
- [ ] Add POL balance checks
- [ ] Test complete order flow
- [ ] Deploy to Polygon mainnet

---

## Gas Test Results (Fill after testing)

### USDC with 0 POL:
- Result: [PENDING]
- Error: [PENDING]
- Min POL needed: [PENDING]

### USDT with 0 POL:
- Result: [PENDING]
- Error: [PENDING]
- Min POL needed: [PENDING]

### Gas Costs:
- Approve: [PENDING] gas
- CreateOrder: [PENDING] gas
- Total POL: [PENDING]
