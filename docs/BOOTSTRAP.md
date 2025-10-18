# Thirdweb Next.js + Hardhat — Complete Guide

A complete, step-by-step README to **create a Thirdweb-powered Next.js web app**, **scaffold & test smart contracts** with Hardhat, and **deploy** to **localhost**, **Polygon Amoy (testnet)** and **Polygon mainnet**. This guide also includes optional integration steps for **Clerk** authentication and **Neon** (Postgres) with Prisma.

> ⚠️ Security note: never commit private keys, `.env`, or secrets to version control. Use environment variables, secret managers, or CI/CD secrets.

---

## Table of contents

1. Prerequisites
2. Recommended folder layout
3. Install Thirdweb CLI & create app
4. Scaffold contracts project (Hardhat)
5. Local testing (Hardhat node + deploy)
6. Deploy to Polygon Amoy (testnet)
7. Deploy to Polygon mainnet
8. Verify contracts on Polygonscan
9. Connect frontend (Next.js) to deployed contracts
10. Export ABI and automate syncing (optional)
11. Optional: Clerk auth integration
12. Optional: Neon (Postgres) + Prisma setup
13. Troubleshooting & best practices
14. Quick command reference

---

## 1) Prerequisites

Make sure you have the following installed:

* Node.js (v18+ recommended)
* npm (or pnpm/yarn)
* Git
* Hardhat (installed per-project in contracts folder)
* A wallet (MetaMask) with test MATIC and mainnet MATIC

Useful CLIs:

```bash
# optional global installs
npm install -g thirdweb
# or use npx for commands
```

---

## 2) Recommended folder layout

Keep contracts and frontend separate for clarity and CI/CD. Example:

```
web3-project/
├── my-contracts/        # Hardhat + Thirdweb for contracts
└── my-web3-app/         # Next.js (Thirdweb SDK) frontend
```

You can later convert this into a monorepo (pnpm workspace / Turborepo) if desired.

---

## 3) Install Thirdweb CLI & create the Next.js app

**Create the Next.js app scaffolded by Thirdweb:**

```bash
# using npx (recommended, no global install required)
npx thirdweb create app
```

Follow prompts:

* Framework: `Next.js`
* Language: `TypeScript` (recommended)
* Chain: `Polygon` (you can choose testnet later)
* Features: `Connect Wallet`, `Smart Contract Interaction`
* Project name: `my-web3-app`

Then:

```bash
cd my-web3-app
npm install
npm run dev
# visit http://localhost:3000
```

This scaffold will include Thirdweb SDK setup, Tailwind, and demo contract interactions.

---

## 4) Scaffold contracts project (Hardhat + Thirdweb)

Create a separate folder for contracts:

```bash
mkdir my-contracts
cd my-contracts
npx thirdweb create contract
```

Choose:

* Language: `Solidity`
* Framework: `Hardhat`
* Contract template: choose a template (e.g., `ERC20`, `Edition`, or `Custom`)
* Contract name: `MyContract` (or whatever)

This will create a structure similar to:

```
my-contracts/
├── contracts/
│   └── MyContract.sol
├── scripts/
│   └── deploy.ts
├── hardhat.config.ts
├── thirdweb.config.ts
├── package.json
└── README.md
```

Install dependencies inside `my-contracts`:

```bash
cd my-contracts
npm install
# optional extras
npm install --save-dev @nomicfoundation/hardhat-toolbox dotenv
```

---

## 5) Local testing (Hardhat node + deploy)

### 5.1 Start a local Hardhat node

```bash
cd my-contracts
npx hardhat node
```

This spins up a local JSON-RPC at `http://127.0.0.1:8545` with funded accounts.

### 5.2 Deploy to localhost

Open a new terminal and run:

```bash
cd my-contracts
npx hardhat run scripts/deploy.ts --network localhost
```

The `deploy.ts` script is usually scaffolded. Example `scripts/deploy.ts`:

```ts
import { ethers } from "hardhat";

async function main() {
  const MyContract = await ethers.getContractFactory("MyContract");
  const myContract = await MyContract.deploy(/* constructor args */);
  await myContract.deployed();
  console.log("Deployed to:", myContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

After deploying locally, you can run tests:

```bash
npx hardhat test
```

### 5.3 Interact via Thirdweb Dashboard (Optional)

If you have Thirdweb CLI authenticated and a local provider configured, you can also use the Thirdweb dashboard or SDK to interact with the local contract address.

---

## 6) Deploy to Polygon Amoy (testnet)

> Polygon Amoy is used here as the testnet reference. Replace `polygon_amoy` with the correct chain id/name if your config uses a different alias.

### 6.1 Create a `.env` file in `my-contracts`

```bash
cd my-contracts
cat > .env <<EOF
PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY
ALCHEMY_KEY=your_alchemy_or_rpc_key_if_needed
EOF
```

**Important:** Use a test wallet with only testnet MATIC.

### 6.2 Add network config to `hardhat.config.ts`

Example config snippet (TypeScript):

```ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    localhost: { url: "http://127.0.0.1:8545" },
    polygon_amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

If you prefer RPC providers, set `AMOY_RPC_URL` (Alchemy, QuickNode, or Polygon public RPC).

### 6.3 Fund test wallet with Amoy MATIC

Use the Polygon faucet for Amoy (or ask in dev community if changed). Example: `https://faucet.polygon.technology/` (confirm which networks supported).

### 6.4 Deploy to Amoy

```bash
cd my-contracts
npx hardhat run scripts/deploy.ts --network polygon_amoy
```

Copy the deployed address printed to console.

---

## 7) Deploy to Polygon Mainnet

**Caution:** this will use real funds. Double-check contracts, tests, and verification steps before proceeding.

### 7.1 Use a production `.env` or CI secrets

```bash
# .env.prod (do not commit)
PRIVATE_KEY=0xYOUR_MAINNET_PRIVATE_KEY
POLYGON_RPC_URL=https://polygon-rpc.com/   # or Alchemy/Infura/QuickNode
```

### 7.2 Add `polygon` network to `hardhat.config.ts`

```ts
polygon: {
  url: process.env.POLYGON_RPC_URL,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
},
```

### 7.3 Deploy to mainnet

```bash
cd my-contracts
npx hardhat run scripts/deploy.ts --network polygon
```

You'll receive the deployed contract address in the console.

---

## 8) Verify contract on Polygonscan

Install Hardhat Etherscan plugin if not present:

```bash
npm install --save-dev @nomiclabs/hardhat-etherscan
```

Add plugin and API key to `hardhat.config.ts`:

```ts
import "@nomiclabs/hardhat-etherscan";

// inside config
etherscan: {
  apiKey: process.env.POLYGONSCAN_API_KEY,
},
```

Then verify:

```bash
npx hardhat verify --network polygon <DEPLOYED_ADDRESS> "constructor_arg1" "constructor_arg2"
```

For testnet (if supported by Etherscan type service), use the equivalent API.

---

## 9) Connect frontend (Next.js) to deployed contract

In your `my-web3-app` project:

### 9.1 Add environment variables

Create `.env.local` in `my-web3-app`:

```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
NEXT_PUBLIC_ACTIVE_CHAIN=polygon # or polygonAmoy for testnet
```

### 9.2 Wrap your app with ThirdwebProvider

Edit `app/layout.tsx` (or `_app.tsx` for pages router):

```tsx
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { polygon, polygonAmoy } from "@thirdweb-dev/chains";

const activeChain = process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "polygon" ? polygon : polygonAmoy;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThirdwebProvider activeChain={activeChain} clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
```

### 9.3 Use contract hooks in client components

Example `app/page.tsx` (client component):

```tsx
"use client";
import { ConnectWallet, useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react";

export default function Home() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
  const { contract } = useContract(contractAddress);
  const { data } = useContractRead(contract, "someReadFunction");
  const { mutateAsync: writeFn } = useContractWrite(contract, "someWriteFunction");

  return (
    <main className="p-8">
      <ConnectWallet />
      <div>Read data: {String(data)}</div>
      <button onClick={() => writeFn({ args: [42] })}>Write</button>
    </main>
  );
}
```

Restart the frontend (`npm run dev`) and connect your wallet to interact with the contract.

---

## 10) Export ABI & automate syncing (optional)

To avoid manual copy-paste, export ABI and the deployed address to your frontend after deploying.

### Option A — Simple copy

* After deploy, copy `artifacts/contracts/MyContract.sol/MyContract.json` or the `deployments` output ABI into `my-web3-app/src/abi/MyContract.json` and use it with `ethers` or thirdweb `useContract`.

### Option B — Scripted copy (example)

Add a small `scripts/emit-frontend.js` that runs after deployment and writes `{ address, abi }` into `../my-web3-app/src/contract-info.json`.

Example (Node):

```js
const fs = require('fs');
const path = require('path');
const addr = process.env.DEPLOYED_ADDRESS; // or read from deploy output
const artifact = require('../artifacts/contracts/MyContract.sol/MyContract.json');
fs.writeFileSync(path.join(__dirname, '..', 'my-web3-app', 'src', 'contract-info.json'), JSON.stringify({ address: addr, abi: artifact.abi }, null, 2));
```

Run it in your deploy pipeline or manually after deployment.

---

## 11) Optional: Clerk auth integration

If you want to protect routes or link on-chain addresses with authenticated users.

### 11.1 Create Clerk app

* Sign up at [https://clerk.com](https://clerk.com) and create an application.
* Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

### 11.2 Install Clerk in frontend

```bash
cd my-web3-app
npm install @clerk/nextjs
```

### 11.3 Add environment variables (`.env.local`)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_xxx
```

### 11.4 Wrap with `ClerkProvider`

In `app/layout.tsx` wrap children inside `<ClerkProvider>` (inside ThirdwebProvider is ok). Use Clerk React UI components such as `SignIn`, `UserButton` and `SignedIn`.

### 11.5 Server-side sync with Prisma (optional)

Use Clerk server SDK to get `userId` and upsert into your database (Neon + Prisma example in next section).

---

## 12) Optional: Neon (serverless Postgres) + Prisma setup

### 12.1 Create Neon project ([https://neon.tech](https://neon.tech))

Create a DB and copy the connection string.

### 12.2 Initialize Prisma in frontend or a backend folder

It’s recommended to create a small backend folder or use the Next.js app's `app/api` routes.

```bash
cd my-web3-app
npm install prisma @prisma/client
npx prisma init
```

In `.env` (or `.env.local` for Next.js):

```
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
```

Define `prisma/schema.prisma` with a `User` model:

```prisma
model User {
  id        String  @id @default(cuid())
  email     String  @unique
  wallet    String?
  createdAt DateTime @default(now())
}
```

Push schema:

```bash
npx prisma db push
```

### 12.3 Use in API route (Next.js app router example)

Create `app/api/user/route.ts`:

```ts
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: "placeholder@example.com" },
  });

  return new Response(JSON.stringify(user), { status: 200 });
}
```

This lets you tie authenticated users to wallet addresses in your DB.

---

## 13) Troubleshooting & Best Practices

* **Never expose private keys:** use `.env` and add `.env` to `.gitignore`.
* **Use separate wallets** for local, testnet, and mainnet.
* **Test extensively** with `npx hardhat test` and local node before testnet deployment.
* **Gas & fees:** test on Amoy/Mumbai before mainnet to estimate gas costs.
* **Verification:** verify contracts on Polygonscan for transparency and easier UI interaction.
* **CI/CD:** store `PRIVATE_KEY`, `POLYGON_RPC_URL`, and API keys in your CI secrets and use a deploy script.
* **Keep ABI & address in a single source:** automate writing to frontend in deploy script.

---

## 14) Quick command reference

```bash
# Create frontend scaffold
npx thirdweb create app

# Create contracts scaffold
mkdir my-contracts && cd my-contracts
npx thirdweb create contract

# Install deps
cd my-contracts
npm install

# Start Hardhat node
npx hardhat node

# Deploy locally
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to Amoy (testnet)
npx hardhat run scripts/deploy.ts --network polygon_amoy

# Deploy to Polygon mainnet
npx hardhat run scripts/deploy.ts --network polygon

# Run tests
npx hardhat test

# Verify
npx hardhat verify --network polygon <ADDRESS> "arg1" "arg2"

# Frontend dev
cd my-web3-app
npm install
npm run dev
```

---

## Appendix: Example `scripts/deploy.ts` (complete)

```ts
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const MyContract = await ethers.getContractFactory("MyContract");
  const myContract = await MyContract.deploy(/* constructor args */);
  await myContract.deployed();
  console.log("Deployed to:", myContract.address);

  // Optional: emit ABI + address to frontend (adjust path)
  const artifact = await artifacts.readArtifact("MyContract");
  const out = {
    address: myContract.address,
    abi: artifact.abi,
  };
  const targetPath = path.join(__dirname, "..", "my-web3-app", "src", "contract-info.json");
  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(out, null, 2));
    console.log("Wrote contract-info.json to frontend");
  } catch (e) {
    console.warn("Failed to write contract-info.json (you can copy ABI manually)", e);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

If you want, I can:

* Provide a **ready-to-use example contract** (ERC20 or simple storage) and `deploy.ts` tuned for Polygon Amoy & mainnet.
* Create a **monorepo setup** that automatically wires ABI/address from contracts into the Next.js app after deployment.

Tell me which one you prefer and I will add it.
