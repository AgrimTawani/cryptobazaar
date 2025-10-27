# 🚀 TokenLocker Contract Deployment & Integration Guide

## Overview

This guide explains how to deploy the new `TokenLocker.sol` contract and integrate it with your Next.js frontend. The new contract uses OpenZeppelin's SafeERC20 for better security and proper event emission.

---

## 📋 Changes from Old Contract

### Old Contract (USDTLocker.sol)
- Basic ERC20 transfers
- No events for lock tracking
- Simple lock structure

### New Contract (TokenLocker.sol)
- ✅ Uses OpenZeppelin's `SafeERC20` (safer transfers)
- ✅ Uses `ReentrancyGuard` (prevents reentrancy attacks)
- ✅ Emits `TokensLocked` and `TokensWithdrawn` events
- ✅ Returns `lockId` in events for tracking
- ✅ Better error messages
- ✅ `getUserLocks()` function to query all user locks
- ✅ `getContractBalance()` to check total locked tokens

---

## 🔧 Step 1: Deploy TokenLocker Contract

### Option A: Using Hardhat (Recommended)

1. **Make sure you're in the contracts directory:**
   ```bash
   cd contracts
   ```

2. **Install OpenZeppelin contracts (if not already installed):**
   ```bash
   npm install @openzeppelin/contracts
   ```

3. **Deploy the contract:**
   ```bash
   npx hardhat run scripts/deploy-token-locker.js --network polygonAmoy
   ```

4. **Save the deployed address** from the output:
   ```
   ✅ TokenLocker deployed to: 0x...
   ```

### Option B: Using Remix

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `TokenLocker.sol`
3. Paste the contract code from `contracts/contracts/TokenLocker.sol`
4. Install OpenZeppelin:
   - Go to Plugin Manager → Install "OpenZeppelin Contracts"
5. Compile with Solidity `0.8.20+`
6. Deploy:
   - Select "Injected Provider - MetaMask"
   - Constructor parameter: `0x8B0180f2101c8260d49339abfEe87927412494B4` (USDC on Amoy)
   - Click "Deploy"
7. **Save the deployed contract address!**

---

## 🔄 Step 2: Update Frontend Contract Address

Update **TWO files** with the new contract address:

### File 1: `cryptobazaar/src/components/CreateOrderModal.tsx`

**Line 9 - Replace:**
```typescript
const TOKEN_LOCKER_ADDRESS = "0xa3038dc5146E7494BDc6c707092a6Bc538C01aeD";
```

**With your new deployed address:**
```typescript
const TOKEN_LOCKER_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

### File 2: `cryptobazaar/src/components/LockUSDTButton.tsx`

**Line 8 - Replace:**
```typescript
const TOKEN_LOCKER_ADDRESS = "0xa3038dc5146E7494BDc6c707092a6Bc538C01aeD";
```

**With your new deployed address:**
```typescript
const TOKEN_LOCKER_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

---

## ✅ Step 3: Verify the Contract (Optional but Recommended)

```bash
npx hardhat verify --network polygonAmoy YOUR_CONTRACT_ADDRESS "0x8B0180f2101c8260d49339abfEe87927412494B4"
```

This makes the contract source code visible on Polygonscan for transparency.

---

## 🧪 Step 4: Test the Integration

1. **Start your Next.js dev server:**
   ```bash
   cd cryptobazaar
   npm run dev
   ```

2. **Test the flow:**
   - Go to `/exchange/marketplace`
   - Click "Create Sell Order"
   - Enter amount (e.g., 5 USDC)
   - Enter duration (e.g., 24 hours)
   - Click "Create Order"

3. **Expected behavior:**
   - MetaMask popup 1: Approve USDC ✅
   - MetaMask popup 2: Lock USDC ✅
   - Success message: "Order created successfully!" ✅
   - Check Polygonscan: Transaction status should be "Success" ✅

4. **Verify the lock:**
   - Try transferring your USDC to another address
   - You should only be able to transfer the **unlocked** amount
   - Locked amount should be unavailable

---

## 📊 Step 5: Query User Locks (Optional)

You can add a feature to display all active locks for a user:

```typescript
// Add this to your component
const getUserLocks = async (userAddress: string) => {
  const provider = window.ethereum;
  
  // Encode getUserLocks(address) function call
  const data = '0x4f69c3d6' + // getUserLocks(address) function selector
    userAddress.slice(2).padStart(64, '0'); // user address
  
  const result = await provider.request({
    method: 'eth_call',
    params: [{
      to: TOKEN_LOCKER_ADDRESS,
      data: data,
    }, 'latest'],
  });
  
  // Decode the result to get Lock[] array
  console.log("User locks:", result);
};
```

---

## 🔐 Key Differences in Integration

### Old Method (Raw Transfer)
```solidity
function lockTokens(uint256 amount, uint256 lockDuration) external {
    usdtToken.transferFrom(msg.sender, address(this), amount); // ❌ Can fail silently
}
```

### New Method (SafeERC20)
```solidity
function lockTokens(uint256 amount, uint256 lockDuration) external nonReentrant {
    token.safeTransferFrom(msg.sender, address(this), amount); // ✅ Reverts on failure
    
    emit TokensLocked(msg.sender, amount, lockId, unlockTime); // ✅ Emits event
}
```

---

## 🚨 Important Notes

1. **The frontend code has NOT changed** - Same UI flow, same MetaMask interactions
2. **Only the contract address needs updating** in the two files mentioned above
3. **Function signature is the same**: `lockTokens(uint256 amount, uint256 lockDuration)`
4. **Function selector is the same**: `0x7f9fadee`
5. **Gas limit remains**: `300,000` (0x493E0)

---

## 📝 What Changed in the Code?

### CreateOrderModal.tsx
```typescript
// OLD
const USDT_LOCKER_ADDRESS = "0xba098ad1..."; // Old contract

// NEW
const TOKEN_LOCKER_ADDRESS = "0xYOUR_NEW_ADDRESS"; // New TokenLocker contract

// Logic remains the same:
// 1. Approve USDC
// 2. Lock tokens using lockTokens(amount, duration)
// 3. Create order in database
```

### LockUSDTButton.tsx
```typescript
// OLD
const USDT_LOCKER_ADDRESS = "0x42715E50..."; // Old contract

// NEW  
const TOKEN_LOCKER_ADDRESS = "0xYOUR_NEW_ADDRESS"; // New TokenLocker contract

// Logic remains the same:
// 1. Approve 5 USDC
// 2. Lock for 1 hour
```

---

## 🎯 Summary Checklist

- [ ] Deploy `TokenLocker.sol` to Polygon Amoy
- [ ] Save the deployed contract address
- [ ] Update `CreateOrderModal.tsx` (line 9)
- [ ] Update `LockUSDTButton.tsx` (line 8)
- [ ] Restart Next.js dev server
- [ ] Test order creation flow
- [ ] Verify lock on Polygonscan
- [ ] (Optional) Verify contract source code

---

## 🔗 Useful Links

- **Polygon Amoy Explorer**: https://amoy.polygonscan.com/
- **Test USDC on Amoy**: `0x8B0180f2101c8260d49339abfEe87927412494B4`
- **Your TokenLocker Contract**: (Update after deployment)

---

## ⚡ Quick Deploy Command

```bash
cd contracts
npx hardhat run scripts/deploy-token-locker.js --network polygonAmoy
```

Copy the deployed address and update both frontend files! 🚀
