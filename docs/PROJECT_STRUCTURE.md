# Detailed Project Structure

```
cryptobazar/
├── .env.local                          # Local environment variables
├── .env.production                     # Production environment variables
├── .gitignore                         
├── package.json                        # Project dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── next.config.js                      # Next.js configuration
├── hardhat.config.ts                   # Hardhat configuration for smart contracts
├── tailwind.config.js                  # Tailwind CSS configuration
│
├── public/                             # Static assets
│   ├── assets/
│   │   ├── images/                     # Image assets
│   │   ├── icons/                      # Icon assets
│   │   └── fonts/                      # Custom fonts
│   └── locales/                        # i18n translation files
│       ├── en/
│       └── hi/
│
├── src/
│   ├── app/                            # Next.js 13+ App Router
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Home page
│   │   ├── providers.tsx               # Global providers wrapper
│   │   ├── loading.tsx                 # Loading UI
│   │   ├── error.tsx                   # Error UI
│   │   │
│   │   ├── (auth)/                    # Authentication routes
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts         # Server actions
│   │   │   ├── register/
│   │   │   │   ├── page.tsx
│   │   │   │   └── actions.ts
│   │   │   └── kyc/
│   │   │       ├── page.tsx
│   │   │       └── actions.ts
│   │   │
│   │   ├── dashboard/                  # Dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   │
│   │   │   ├── orders/                # Order management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/              # Single order view
│   │   │   │   └── create/            # Create order
│   │   │   │
│   │   │   ├── wallet/                # Wallet management
│   │   │   │   ├── page.tsx
│   │   │   │   └── transactions/
│   │   │   │
│   │   │   └── settings/              # User settings
│   │   │       ├── page.tsx
│   │   │       └── profile/
│   │   │
│   │   └── api/                       # API routes
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── kyc/route.ts
│   │       │
│   │       ├── orders/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       │
│   │       ├── payments/
│   │       │   ├── route.ts
│   │       │   └── webhook/route.ts
│   │       │
│   │       └── webhooks/
│   │           ├── razorpay.ts
│   │           └── blockchain.ts
│   │
│   ├── components/                     # React components
│   │   ├── common/                    # Shared components
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx
│   │   │   │   └── types.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   └── Loading/
│   │   │
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── Navigation/
│   │   │
│   │   ├── forms/                     # Form components
│   │   │   ├── OrderForm/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── validation.ts
│   │   │   │   └── types.ts
│   │   │   ├── KYCForm/
│   │   │   └── WalletForm/
│   │   │
│   │   └── blockchain/                # Blockchain components
│   │       ├── WalletConnect/
│   │       ├── NetworkSelector/
│   │       ├── TokenSelector/
│   │       └── TransactionStatus/
│   │
│   ├── contracts/                      # Smart contracts
│   │   ├── Escrow.sol
│   │   ├── TokenManager.sol
│   │   ├── BridgeAdapter.sol
│   │   ├── interfaces/
│   │   │   ├── IEscrow.sol
│   │   │   ├── ITokenManager.sol
│   │   │   └── IBridge.sol
│   │   │
│   │   └── libraries/
│   │       ├── SafeMath.sol
│   │       └── Security.sol
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useOrders.ts
│   │   ├── usePayments.ts
│   │   ├── useBlockchain.ts
│   │   └── useWebSocket.ts
│   │
│   ├── lib/                            # Library code
│   │   ├── blockchain/                # Blockchain utilities
│   │   │   ├── chains/
│   │   │   │   ├── ethereum.ts
│   │   │   │   ├── polygon.ts
│   │   │   │   └── index.ts
│   │   │   ├── bridges/
│   │   │   │   ├── layerzero.ts
│   │   │   │   └── wormhole.ts
│   │   │   └── contracts/
│   │   │       ├── escrow.ts
│   │   │       └── tokenManager.ts
│   │   │
│   │   ├── api/                      # API clients
│   │   │   ├── razorpay.ts
│   │   │   ├── kyc.ts
│   │   │   └── websocket.ts
│   │   │
│   │   └── utils/                    # Utility functions
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       ├── crypto.ts
│   │       └── constants.ts
│   │
│   ├── store/                          # State management
│   │   ├── slices/
│   │   │   ├── auth.ts
│   │   │   ├── orders.ts
│   │   │   └── wallet.ts
│   │   ├── middleware/
│   │   │   ├── logger.ts
│   │   │   └── websocket.ts
│   │   └── index.ts
│   │
│   ├── styles/                         # Global styles
│   │   ├── globals.css
│   │   └── theme.ts
│   │
│   └── types/                          # TypeScript types
│       ├── blockchain.ts
│       ├── order.ts
│       ├── user.ts
│       └── api.ts
│
├── prisma/                             # Database
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Database migrations
│       └── ...
│
├── scripts/                            # Utility scripts
│   ├── deploy-contracts.ts             # Contract deployment
│   ├── verify-contracts.ts             # Contract verification
│   ├── generate-types.ts               # Type generation
│   └── seed-database.ts                # Database seeding
│
└── test/                               # Tests
    ├── unit/                           # Unit tests
    │   ├── components/
    │   └── hooks/
    ├── integration/                    # Integration tests
    │   ├── api/
    │   └── blockchain/
    └── e2e/                           # End-to-end tests
        └── cypress/
```

## Key Files and Their Purposes

### Configuration Files
- `.env.local`: Local development environment variables
- `.env.production`: Production environment variables
- `tsconfig.json`: TypeScript compiler configuration
- `next.config.js`: Next.js framework configuration
- `hardhat.config.ts`: Ethereum development environment setup
- `tailwind.config.js`: Tailwind CSS styling configuration

### Core Application Files
- `src/app/layout.tsx`: Root layout with providers and global UI elements
- `src/app/providers.tsx`: Global context providers (Web3, Theme, etc.)
- `src/app/page.tsx`: Landing page component

### Smart Contracts
- `contracts/Escrow.sol`: Main escrow functionality
- `contracts/TokenManager.sol`: Token management and validation
- `contracts/BridgeAdapter.sol`: Cross-chain bridge integration

### API Routes
- `api/auth/*`: Authentication endpoints
- `api/orders/*`: Order management endpoints
- `api/payments/*`: Payment processing endpoints
- `api/webhooks/*`: Webhook handlers

### Database
- `prisma/schema.prisma`: Database schema definition
- `prisma/migrations/`: Database migration files

### Components
- `components/common/`: Reusable UI components
- `components/layout/`: Page layout components
- `components/forms/`: Form components
- `components/blockchain/`: Blockchain-specific components

### State Management
- `store/slices/`: Redux/RTK slices for state management
- `store/middleware/`: Custom middleware for side effects

### Utilities
- `lib/blockchain/`: Blockchain interaction utilities
- `lib/api/`: API client utilities
- `lib/utils/`: General utility functions

### Testing
- `test/unit/`: Unit tests for components and functions
- `test/integration/`: Integration tests for API and blockchain
- `test/e2e/`: End-to-end tests using Cypress 