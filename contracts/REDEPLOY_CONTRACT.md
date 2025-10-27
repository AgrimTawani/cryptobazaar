# Redeploy USDTLocker Contract with USDC

## Current Issue
The deployed contract at `0xba098ad1a0B1aD9B02030E7F258AFf4d90634Ed3` was deployed with USDT token address, but we need it to work with USDC.

## Solution
Redeploy the contract with the correct USDC address.

---

## Step 1: Verify Environment Setup

```powershell
cd contracts
```

Check that `.env` file exists with:
```
PRIVATE_KEY=your_wallet_private_key
POLYGONSCAN_API_KEY=your_api_key
```

---

## Step 2: Deploy Contract

```powershell
npx hardhat run scripts/deploy-locker.js --network polygonAmoy
```

**Expected Output:**
```
Deploying USDTLocker contract to Polygon Amoy...
USDC Token Address: 0x8B0180f2101c8260d49339abfEe87927412494B4
✅ USDTLocker deployed to: 0x[NEW_ADDRESS]

📋 Contract Details:
-------------------
Contract Address: 0x[NEW_ADDRESS]
Network: Polygon Amoy Testnet
USDC Token: 0x8B0180f2101c8260d49339abfEe87927412494B4

🔗 View on Explorer:
https://amoy.polygonscan.com/address/0x[NEW_ADDRESS]
```

---

## Step 3: Update Frontend

Replace the contract address in **TWO** files:

### File 1: `cryptobazaar/src/components/CreateOrderModal.tsx`
```typescript
// Line 9 - Change from:
const USDT_LOCKER_ADDRESS = "0xba098ad1a0B1aD9B02030E7F258AFf4d90634Ed3";

// To:
const USDT_LOCKER_ADDRESS = "0x[NEW_ADDRESS_FROM_DEPLOYMENT]";
```

### File 2: `cryptobazaar/src/components/LockUSDTButton.tsx` (if it exists)
```typescript
const USDT_LOCKER_ADDRESS = "0x[NEW_ADDRESS_FROM_DEPLOYMENT]";
```

---

## Step 4: Test the Contract

### 4.1: Verify Contract Deployment
Visit: `https://amoy.polygonscan.com/address/0x[NEW_ADDRESS]`

Check:
- ✅ Contract is verified
- ✅ Constructor shows USDC address: `0x8B0180f2101c8260d49339abfEe87927412494B4`

### 4.2: Test in Frontend

1. **Connect Wallet** (make sure you're on Polygon Amoy)
2. **Get Test USDC**: 
   - Visit: https://faucet.polygon.technology/
   - Or use the USDC faucet if available
3. **Create Sell Order**:
   - Enter amount (e.g., 5 USDC)
   - Enter rate (e.g., 90 INR)
   - Enter duration (e.g., 24 hours)
   - Click "Lock & Create Order"
4. **Approve USDC** (MetaMask transaction 1)
5. **Lock USDC** (MetaMask transaction 2)
6. **Verify**:
   - Check Polygonscan for both transactions
   - Order should appear in marketplace
   - Balance should decrease

---

## Contract Functions Reference

### lockTokens(uint256 amount, uint256 lockDuration)
- **Parameters**:
  - `amount`: Amount in wei (for USDC with 6 decimals: `amount * 1_000_000`)
  - `lockDuration`: Duration in seconds (`hours * 3600`)
- **Function Selector**: `0x7f9fadee`

### lock5USDT(uint256 lockDuration)
- **Parameters**:
  - `lockDuration`: Duration in seconds
- **Function Selector**: `0x6c0360eb`
- **Amount**: Hardcoded to 5 USDC (5 * 10^6)

### withdrawTokens(uint256 lockId)
- **Parameters**:
  - `lockId`: Index of the lock to withdraw
- **Function Selector**: `0x9e6c4d6b`

---

## Troubleshooting

### Issue: "Transfer failed. Make sure you approved the contract."
**Solution**: The approve transaction must complete before the lock transaction.
- Wait 3-5 seconds after approve
- Check approval on Polygonscan
- Increase approval waiting time in code

### Issue: "Insufficient funds"
**Solution**: 
- Make sure you have MATIC for gas fees
- Get test MATIC from: https://faucet.polygon.technology/

### Issue: "Internal JSON-RPC error"
**Possible Causes**:
1. Wrong function selector
2. Wrong parameter encoding
3. Insufficient gas limit
4. Token not approved
5. Wrong contract address (USDT vs USDC)

---

## Verification (Optional)

To verify the contract on Polygonscan:

```powershell
npx hardhat verify --network polygonAmoy 0x[NEW_ADDRESS] "0x8B0180f2101c8260d49339abfEe87927412494B4"
```

---

## Important Notes

1. **USDC Address**: `0x8B0180f2101c8260d49339abfEe87927412494B4` (Polygon Amoy)
2. **Decimals**: USDC has 6 decimals (not 18 like ETH)
3. **Gas Limits**:
   - Approve: 100,000 gas
   - Lock: 300,000 gas
   - Withdraw: 150,000 gas
4. **Network**: Always use Polygon Amoy (Chain ID: 80002 / 0x13882)

---

## After Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address updated in CreateOrderModal.tsx
- [ ] Contract verified on Polygonscan
- [ ] Test USDC obtained
- [ ] Approve transaction successful
- [ ] Lock transaction successful
- [ ] Order created in database
- [ ] Order visible in marketplace
