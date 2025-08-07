# CryptoBazar USDC Setup Guide

## Network Setup

### Add Polygon Amoy Testnet to MetaMask
```
Network Name: Polygon Amoy Testnet
New RPC URL: https://rpc-amoy.polygon.technology/
Chain ID: 80002
Currency Symbol: POL
Block Explorer URL: https://amoy.polygonscan.com/
```

## Get Test Tokens

### 1. Get POL for Gas Fees
Visit: https://faucets.chain.link/polygon-amoy
- Connect your MetaMask wallet
- Request POL tokens (for transaction fees)

### 2. Get Test USDC
Visit: https://faucet.circle.com/
- Connect your MetaMask wallet
- Select "Polygon Amoy" network
- Request test USDC tokens

## Environment Configuration

### .env.local
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cryptobazar"

# Polygon Amoy Network
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology/

# Circle USDC Contract on Polygon Amoy
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582

# Your deployed escrow contract address (after deployment)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...

# thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key

# Razorpay (for later)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# App
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Updated Database Schema

### Prisma Schema (Updated for USDC)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  walletAddress String @unique
  bankAccount Json?    // {accountNumber, ifsc, holderName}
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  sellAds     SellAd[]
  purchases   Transaction[] @relation("Buyer")
  sales       Transaction[] @relation("Seller")
}

model SellAd {
  id          String   @id @default(cuid())
  sellerId    String
  seller      User     @relation(fields: [sellerId], references: [id])
  
  usdcAmount  Float    // Amount in USDC (6 decimals)
  pricePerUSDC Float   // Price per USDC in INR
  totalAmount Float    // usdcAmount * pricePerUSDC
  
  status      AdStatus @default(ACTIVE)
  escrowTxHash String? // Blockchain transaction hash for escrow creation
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  transactions Transaction[]
}

model Transaction {
  id          String   @id @default(cuid())
  
  sellAdId    String
  sellAd      SellAd   @relation(fields: [sellAdId], references: [id])
  
  buyerId     String
  buyer       User     @relation("Buyer", fields: [buyerId], references: [id])
  
  sellerId    String
  seller      User     @relation("Seller", fields: [sellerId], references: [id])
  
  usdcAmount  Float    // Amount in USDC
  inrAmount   Float    // Amount in INR
  
  status      TransactionStatus @default(PENDING)
  
  razorpayOrderId   String?
  razorpayPaymentId String?
  escrowReleaseTxHash String? // Transaction hash for escrow release
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum AdStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

enum TransactionStatus {
  PENDING
  PAYMENT_PENDING
  PAID
  COMPLETED
  CANCELLED
}
```

## thirdweb Configuration

### app/layout.tsx or _app.tsx
```typescript
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { PolygonAmoyTestnet } from "@thirdweb-dev/chains";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThirdwebProvider
          clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!}
          activeChain={PolygonAmoyTestnet}
        >
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
```

## USDC Integration Hooks

### hooks/useUSDC.ts
```typescript
import { useContract, useContractRead, useAddress } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";

export function useUSDCBalance() {
  const address = useAddress();
  const { contract: usdcContract } = useContract(
    process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS,
    "token"
  );
  
  const { data: balance, isLoading } = useContractRead(
    usdcContract,
    "balanceOf",
    [address]
  );
  
  // USDC has 6 decimals
  const formatBalance = (balance: BigNumber) => {
    return balance ? parseFloat(balance.toString()) / 1e6 : 0;
  };
  
  return {
    balance: formatBalance(balance),
    rawBalance: balance,
    isLoading,
    contract: usdcContract
  };
}
```

### hooks/useEscrow.ts
```typescript
import { useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";

export function useEscrow() {
  const { contract: escrowContract } = useContract(
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS
  );
  
  const { mutateAsync: createEscrow, isLoading: isCreating } = useContractWrite(
    escrowContract,
    "createEscrow"
  );
  
  const createEscrowOrder = async (orderId: string, amount: number) => {
    // Convert amount to USDC units (6 decimals)
    const amountInUSDCUnits = BigNumber.from(Math.floor(amount * 1e6));
    
    try {
      await createEscrow({ args: [orderId, amountInUSDCUnits] });
      return true;
    } catch (error) {
      console.error("Failed to create escrow:", error);
      return false;
    }
  };
  
  const getOrder = async (orderId: string) => {
    if (!escrowContract) return null;
    
    try {
      const order = await escrowContract.call("getOrder", [orderId]);
      return {
        seller: order.seller,
        buyer: order.buyer,
        amount: parseFloat(order.amount.toString()) / 1e6, // Convert from USDC units
        isActive: order.isActive,
        isCompleted: order.isCompleted,
        createdAt: order.createdAt
      };
    } catch (error) {
      console.error("Failed to get order:", error);
      return null;
    }
  };
  
  return {
    createEscrowOrder,
    getOrder,
    isCreating,
    contract: escrowContract
  };
}
```

## Updated Components

### components/USDCBalance.tsx
```typescript
import { useUSDCBalance } from '@/hooks/useUSDC';

export default function USDCBalance() {
  const { balance, isLoading } = useUSDCBalance();
  
  if (isLoading) return <div>Loading balance...</div>;
  
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-semibold">USDC Balance</h3>
      <p className="text-2xl font-bold">{balance.toFixed(2)} USDC</p>
    </div>
  );
}
```

### components/SellAdForm.tsx (Updated for USDC)
```typescript
import { useState } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { useUSDCBalance } from '@/hooks/useUSDC';
import { useEscrow } from '@/hooks/useEscrow';

export default function SellAdForm() {
  const address = useAddress();
  const { balance } = useUSDCBalance();
  const { createEscrowOrder, isCreating } = useEscrow();
  
  const [formData, setFormData] = useState({
    usdcAmount: '',
    pricePerUSDC: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    const amount = parseFloat(formData.usdcAmount);
    const price = parseFloat(formData.pricePerUSDC);
    
    if (amount > balance) {
      alert('Insufficient USDC balance');
      return;
    }
    
    try {
      // Create unique order ID
      const orderId = `order_${Date.now()}_${address.slice(0, 6)}`;
      
      // Create escrow first
      const escrowSuccess = await createEscrowOrder(orderId, amount);
      
      if (escrowSuccess) {
        // Then create sell ad in database
        const response = await fetch('/api/sell-ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            usdcAmount: amount,
            pricePerUSDC: price,
            orderId
          })
        });
        
        if (response.ok) {
          alert('Sell ad created successfully!');
          setFormData({ usdcAmount: '', pricePerUSDC: '' });
        }
      }
    } catch (error) {
      console.error('Error creating sell ad:', error);
      alert('Failed to create sell ad');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          USDC Amount (Available: {balance.toFixed(2)})
        </label>
        <input
          type="number"
          step="0.01"
          max={balance}
          value={formData.usdcAmount}
          onChange={(e) => setFormData({...formData, usdcAmount: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Price per USDC (INR)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.pricePerUSDC}
          onChange={(e) => setFormData({...formData, pricePerUSDC: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div className="text-sm text-gray-600">
        Total: ₹{(parseFloat(formData.usdcAmount || '0') * parseFloat(formData.pricePerUSDC || '0')).toFixed(2)}
      </div>
      
      <button
        type="submit"
        disabled={!address || isCreating}
        className="w-full py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isCreating ? 'Creating...' : 'Create Sell Ad'}
      </button>
    </form>
  );
}
```

## Getting Started Steps

1. **Add Polygon Amoy to MetaMask** (network details above)
2. **Get test tokens**:
   - POL: https://faucets.chain.link/polygon-amoy
   - USDC: https://faucet.circle.com/
3. **Deploy escrow contract**: `npx thirdweb deploy`
4. **Update environment variables** with contract addresses
5. **Run the app**: `npm run dev`

## Important Notes

- **USDC has 6 decimals** (not 18 like ETH)
- **Always convert amounts**: Multiply by 1e6 for contract calls, divide by 1e6 for display
- **Approve before escrow**: Users need to approve USDC spending before creating escrow
- **USDC Contract Address**: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582 (Polygon Amoy testnet)

## Quick Reference

### Key Differences from USDT:
- **USDC is more widely supported** on testnets
- **Circle provides official faucets** for test USDC
- **Better integration with DeFi protocols**
- **Same 6 decimal precision** as USDT
- **More standardized ERC20 implementation**

### Contract Addresses (Polygon Amoy):
- **USDC**: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
- **POL (gas)**: Native token for Amoy testnet

