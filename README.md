# Yellow P2P Escrow System

A comprehensive P2P escrow platform built on the Yellow network using Nitrolite SDK for secure asset locking and Razorpay for Indian payment integration.

## Features

- **Secure Escrow System**: Assets are locked in blockchain state channels until both parties confirm completion
- **Wallet Connection**: MetaMask and Web3 wallet integration
- **User Discovery**: Mock user discovery system (expandable to real implementation)
- **State Channel Transactions**: P2P transactions using Yellow network state channels
- **Razorpay Integration**: Indian payment gateway for fiat transactions
- **Comprehensive Testing**: Full test suite covering all cases and edge cases
- **Anti-Scam Protection**: Blockchain-based asset locking prevents P2P scams

## Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern UI styling
- **Nitrolite SDK** (@erc7824/nitrolite) - Yellow network state channels
- **Viem** - Ethereum client library
- **Razorpay** - Indian payment gateway
- **Jest** - Comprehensive testing framework

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or Web3 wallet
- Razorpay account (for payment processing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yellow-p2p-escrow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# Yellow Network Configuration
YELLOW_CUSTODY_ADDRESS=0x0000000000000000000000000000000000000000
YELLOW_ADJUDICATOR_ADDRESS=0x0000000000000000000000000000000000000000
YELLOW_GUEST_ADDRESS=0x0000000000000000000000000000000000000000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### For Buyers
1. Connect your Web3 wallet
2. Browse active listings
3. Click "Buy" on desired listing
4. Complete Razorpay payment
5. Confirm receipt after receiving tokens

### For Sellers
1. Connect your Web3 wallet
2. Create a listing with token details and price
3. Wait for buyer to purchase and pay
4. Release tokens once payment is confirmed
5. Receive fiat payment automatically

### Escrow Flow
1. **Creation**: Buyer pays fiat via Razorpay, escrow created
2. **Locking**: Assets locked in state channel when both parties confirm
3. **Completion**: Seller releases tokens, buyer confirms receipt
4. **Settlement**: Fiat payment released to seller

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- ✅ Wallet connection and failure handling
- ✅ Escrow creation and validation
- ✅ Razorpay order creation
- ✅ State channel operations
- ✅ Escrow state transitions
- ✅ Error handling and edge cases
- ✅ Concurrent operations

## API Endpoints

### Razorpay Order Creation
```
POST /api/razorpay-order
```
Creates a Razorpay order for fiat payments.

### Escrow Management
```
POST /api/escrow
```
Handles escrow operations: create, confirm, release, dispute.

## Configuration

### Yellow Network Contracts
Update the contract addresses in `app/api/chains.ts` and `app/page.tsx` with actual Yellow network addresses:

```typescript
addresses: {
  custody: '0x...', // Yellow custody contract
  adjudicator: '0x...', // Yellow adjudicator contract
  guestAddress: '0x...', // Yellow guest address
}
```

### Razorpay Setup
1. Create a Razorpay account
2. Get your API keys from the dashboard
3. Add keys to `.env.local`
4. For production, enable required webhooks

## Security Features

- **Asset Locking**: Funds locked in blockchain until conditions met
- **State Channels**: Off-chain transactions with on-chain settlement
- **Dual Confirmation**: Both parties must confirm before release
- **Dispute Resolution**: Built-in dispute handling mechanism
- **Payment Verification**: Razorpay payment verification

## Architecture

```
├── app/
│   ├── page.tsx          # Main escrow interface
│   ├── layout.tsx        # App layout
│   └── api/
│       ├── razorpay-order/route.ts  # Payment processing
│       ├── escrow/route.ts          # Escrow operations
│       └── chains.ts                # Network configuration
├── __tests__/
│   └── escrow.test.ts    # Comprehensive test suite
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Resources

- [Yellow Network Docs](https://docs.yellow.org/)
- [ERC-7824 Specification](https://erc7824.org/)
- [Nitrolite SDK](https://github.com/erc7824/nitrolite)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Viem Documentation](https://viem.sh/)

## License

This project is licensed under the MIT License.
- [ERC 7824](https://erc7824.org/)
- [Nitrolite SDK](https://github.com/erc7824/nitrolite)
- [Nitrolite Package](https://www.npmjs.com/package/@erc7824/nitrolite)
