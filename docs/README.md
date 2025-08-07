# CryptoBazar - P2P USDC Exchange with Escrow (thirdweb Edition)

## Overview
CryptoBazar is a decentralized P2P platform for buying and selling USDC for INR using an escrow system. Users connect their wallets, post sell ads, and transact securely with fiat payments via Razorpay. The blockchain is used only for locking and releasing USDC during trades.

## Core Features
- P2P USDC trading with escrow
- Fiat payment integration (Razorpay)
- Real-time order book
- Secure wallet login (MetaMask/thirdweb Connect)

## Technical Architecture

### Frontend (Next.js + thirdweb React SDK)
- App Router architecture
- Server and Client Components
- Real-time updates (WebSocket)
- Responsive UI (Tailwind CSS)
- Wallet connection (MetaMask/thirdweb Connect)
- Sell ad creation and order book

### Backend (Node.js + Express)
- RESTful API endpoints
- WebSocket server for real-time updates
- Razorpay payment integration
- User and ad management

### Database (PostgreSQL)
- User profiles (wallet, bank account info)
- Sell ads
- Transaction history

### Blockchain Integration (thirdweb)
- USDC escrow smart contract (lock/release only)
- Contract events for order status

## User Flow

### Seller Flow
1. Connect wallet (MetaMask/thirdweb Connect)
2. Enter bank account details
3. View USDC balance
4. Create sell ad (amount, price in INR)
5. USDC is locked in escrow contract
6. Wait for buyer
7. Buyer pays INR via Razorpay (to seller's bank account)
8. After payment confirmation, USDC is released to buyer

### Buyer Flow
1. Connect wallet (MetaMask/thirdweb Connect)
2. Browse sell ads
3. Select ad and initiate purchase
4. Pay INR via Razorpay (to seller's bank account)
5. After payment confirmation, receive USDC in wallet

## Smart Contract (thirdweb)
- Lock USDC in escrow when ad is posted
- Release USDC to buyer after payment confirmation
- No on-chain order book or multi-token logic

## Security Features
- Smart contract security (thirdweb audits)
- Razorpay signature verification
- Payment confirmation

## System Components
- Order Management
- Payment Processing
- Blockchain Escrow (USDC only)
- User Management

## Project Structure
```
cryptobazar/
├── src/
│   ├── app/                 # Next.js app router (pages, API routes)
│   ├── components/          # React components (WalletConnect, SellAdForm, OrderBook)
│   ├── contracts/           # USDC Escrow contract (solidity, ABI, deployment scripts)
│   ├── lib/                 # Blockchain utils (USDC balance, escrow), Razorpay integration
│   ├── hooks/               # useUSDCBalance, useEscrow, useRazorpay
│   ├── store/               # State management (ads, user, escrow)
│   └── types/               # TypeScript types
├── prisma/                  # Database schema (users, ads, transactions)
├── scripts/                 # Contract deployment, seeding
└── test/                    # Unit and integration tests
```

## Key Technologies
- Next.js 13+
- TypeScript
- thirdweb React SDK
- PostgreSQL (Prisma ORM)
- Razorpay API
- WebSocket

## API Structure
- RESTful endpoints
- WebSocket events
- Payment webhooks

## Deployment Architecture

### Frontend
- Vercel deployment
- CDN integration

### Backend
- Load balanced servers
- SSL/TLS encryption

### Database
- Primary-replica setup
- Automated backups

### Blockchain
- thirdweb-managed USDC escrow contract
- Contract event monitoring

## Monitoring and Maintenance
- Server health
- API performance
- Database metrics
- Blockchain status (thirdweb dashboard)
- Payment gateway status

## Development Workflow

### Local Setup
1. Clone repository
2. Install dependencies
3. Set up environment variables
4. Deploy contracts via thirdweb CLI
5. Run development server

### Testing
- Unit tests
- Integration tests
- Smart contract tests (thirdweb)
- E2E tests

### Deployment
1. Deploy/update contracts (thirdweb)
2. Database migrations
3. Backend deployment
4. Frontend deployment

## Future Enhancements
- Mobile app (React Native + thirdweb)
- More payment methods
- Advanced trading features

## Maintenance Guidelines
- Regular security audits
- Performance optimization
- Database maintenance
- Contract upgrades (thirdweb dashboard)
- System backups