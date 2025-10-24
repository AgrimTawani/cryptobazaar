# 🔐 USDT Locker - Complete Setup Guide

## What This Does

This smart contract allows users to lock USDT tokens for a specified period. Perfect for testing escrow functionality in your P2P trading platform!

**Features:**
- Lock exactly 5 USDT with one click
- Set custom lock duration
- Withdraw after unlock time
- View all your locks
- MetaMask integration

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. **MetaMask Wallet** installed
2. **MATIC tokens** on Polygon Amoy (for gas fees)
   - Get from: https://faucet.polygon.technology/
3. **USDT tokens** on Polygon Amoy (for testing)
   - USDT Address: `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582`
   - Get from faucets or ask in Discord/Telegram

---

## 🚀 Deployment Steps

### Step 1: Setup Environment Variables

1. In the `contracts` folder, create a `.env` file:

```bash
cd contracts
```

2. Add your private key to `.env`:

```env
PRIVATE_KEY=your_wallet_private_key_here
```

**⚠️ IMPORTANT:** 
- Remove the `0x` prefix from your private key
- NEVER commit this file to Git (it's already in .gitignore)

**How to get your private key:**
- Open MetaMask
- Click the 3 dots → Account Details
- Click "Show Private Key"
- Enter your password
- Copy the key (without `0x`)

### Step 2: Get Test Tokens

#### Get MATIC (for gas):
1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Paste your wallet address
4. Request tokens

#### Get USDT (for locking):
You need at least 5 USDT. Options:
- Circle USDT Faucet (if available)
- Polygon Faucet
- Ask in community Discord

### Step 3: Deploy the Contract

**Option A - Using PowerShell (Windows):**
```powershell
cd contracts
.\deploy.ps1
```

**Option B - Manual Commands:**
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy-locker.js --network polygonAmoy
```

### Step 4: Save the Contract Address

After deployment, you'll see output like:
```
✅ USDTLocker deployed to: 0x1234567890abcdef...
```

**COPY THIS ADDRESS!** You'll need it for the next step.

### Step 5: Update Next.js App

1. Open: `cryptobazaar/src/components/LockUSDTButton.tsx`

2. Find this line:
```typescript
const USDT_LOCKER_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

3. Replace with your actual contract address:
```typescript
const USDT_LOCKER_ADDRESS = "0x1234567890abcdef..."; // Your address here
```

4. Save the file

---

## 🧪 Testing the Lock Functionality

### Step 1: Start Your Next.js App

```bash
cd cryptobazaar
pnpm dev
```

### Step 2: Navigate to Dashboard

1. Open http://localhost:3000
2. Login with your account
3. Go to `/exchange` page

### Step 3: Connect Wallet

1. Click "Connect Wallet" button (top right)
2. Select MetaMask
3. **IMPORTANT:** Switch to Polygon Amoy network in MetaMask
4. Approve the connection

### Step 4: Lock 5 USDT

1. Scroll down to the "Lock USDT" card
2. Click "Lock 5 USDT (1 Hour)" button
3. **MetaMask will open TWICE:**
   - **First popup:** Approve USDT spending (this allows the contract to use your USDT)
   - **Second popup:** Lock the USDT (this actually locks 5 USDT)
4. Confirm both transactions
5. Wait for success message!

---

## 🔍 Verify Your Lock

### View on Blockchain Explorer

Visit: `https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS`

You can see:
- All transactions
- Contract code
- Your locked tokens

### Check in MetaMask

Your USDT balance will decrease by 5 USDT (now locked in contract).

---

## 📊 Contract Functions Explained

### `lock5USDT(uint256 lockDuration)`
Locks exactly 5 USDT for specified seconds.

**Example:**
- Lock for 1 hour: `lock5USDT(3600)`
- Lock for 1 day: `lock5USDT(86400)`
- Lock for 1 week: `lock5USDT(604800)`

### `withdrawTokens(uint256 lockId)`
Withdraw after unlock time expires.

**Parameters:**
- `lockId`: Index of your lock (first lock = 0, second = 1, etc.)

### `getUserLocks(address user)`
View all locks for an address.

**Returns:** Array of lock objects with:
- `amount`: Locked amount
- `lockedAt`: Timestamp when locked
- `unlockTime`: Timestamp when unlockable
- `withdrawn`: Already withdrawn?

---

## ⚠️ Troubleshooting

### Error: "Transfer failed. Make sure you approved the contract."

**Solution:** You need to approve the contract first. The component handles this automatically, but if you see this error:
1. Refresh the page
2. Try clicking the lock button again
3. Make sure you confirm BOTH MetaMask popups

### Error: "Insufficient funds"

**Solutions:**
- **For USDT:** You need at least 5 USDT. Get more from faucet.
- **For Gas:** You need MATIC for transaction fees. Get from Polygon faucet.

### Wrong Network

**Solution:**
1. Open MetaMask
2. Click the network dropdown
3. Switch to "Polygon Amoy"
4. If not listed, add it manually:
   - Network Name: Polygon Amoy
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency: MATIC
   - Explorer: https://amoy.polygonscan.com/

### Transaction Stuck

**Solution:**
1. Wait a few minutes (Polygon Amoy can be slow)
2. Check on PolygonScan if transaction is pending
3. If truly stuck, try increasing gas in MetaMask

---

## 🎯 Next Steps

After successfully locking USDT, you can:

1. **View Your Locks:** Add a display component showing all active locks
2. **Withdraw Feature:** Add a button to withdraw after unlock time
3. **Custom Lock Duration:** Let users choose lock duration
4. **Multiple Tokens:** Support ETH, other ERC20 tokens
5. **Escrow System:** Build full P2P trading with dispute resolution

---

## 📁 File Structure

```
contracts/
├── contracts/
│   └── USDTLocker.sol          # Main smart contract
├── scripts/
│   └── deploy-locker.js        # Deployment script
├── .env.example                # Environment template
├── .env                        # Your private key (CREATE THIS)
├── hardhat.config.js           # Hardhat configuration
├── deploy.ps1                  # PowerShell deployment script
├── deploy.sh                   # Bash deployment script
└── DEPLOYMENT_GUIDE.md         # This file

cryptobazaar/
└── src/
    └── components/
        └── LockUSDTButton.tsx  # React component for locking
```

---

## 🔒 Security Notes

1. **Never commit `.env`** - Your private key should NEVER be in Git
2. **Use test funds only** - This is a testnet, don't use real money
3. **Audit before mainnet** - Get the contract audited before deploying to mainnet
4. **Test thoroughly** - Test all functions before using with real users

---

## 🆘 Need Help?

- **Contract Issues:** Check PolygonScan for transaction details
- **MetaMask Issues:** Make sure you're on Polygon Amoy network
- **Gas Issues:** Get more MATIC from the faucet
- **USDT Issues:** Verify you have USDT on Polygon Amoy

---

## ✅ Checklist

Before testing, ensure:
- [ ] `.env` file created with private key
- [ ] MATIC tokens in wallet (for gas)
- [ ] USDT tokens in wallet (at least 5)
- [ ] Contract deployed successfully
- [ ] Contract address updated in `LockUSDTButton.tsx`
- [ ] Next.js app running
- [ ] Wallet connected to Polygon Amoy
- [ ] Ready to lock!

---

Happy Testing! 🚀
