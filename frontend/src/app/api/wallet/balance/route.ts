import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createThirdwebClient, getContract, readContract, defineChain } from "thirdweb";
import { polygon, bsc } from "thirdweb/chains";

const client = createThirdwebClient(
  process.env.THIRDWEB_SECRET_KEY
    ? { secretKey: process.env.THIRDWEB_SECRET_KEY }
    : { clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID! }
);

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID ?? "137");
const isAmoy = CHAIN_ID === 80002;
const amoyChain = defineChain(80002);
const polygonChain = isAmoy ? amoyChain : polygon;

// Token addresses per chain per asset
const EVM_TOKENS = {
  POLYGON: {
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", chain: polygonChain, decimals: 6 },
    USDC: {
      address: isAmoy
        ? (process.env.NEXT_PUBLIC_AMOY_USDC_ADDRESS ?? "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582")
        : "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
      chain: polygonChain,
      decimals: 6,
    },
  },
  BSC: {
    USDT: { address: "0x55d398326f99059fF775485246999027B3197955", chain: bsc, decimals: 18 },
    USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", chain: bsc, decimals: 18 },
  },
} as const;

async function evmBalance(
  walletAddress: string,
  chainKey: "POLYGON" | "BSC",
  tokenKey: "USDT" | "USDC"
) {
  const token = EVM_TOKENS[chainKey][tokenKey];
  const contract = getContract({ client, chain: token.chain, address: token.address });
  const raw: bigint = await readContract({
    contract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [walletAddress as `0x${string}`],
  });
  const divisorBig = BigInt(10 ** Math.min(token.decimals, 12));
  const remainder = BigInt(10 ** Math.max(token.decimals - 12, 0));
  const adjusted = Number(raw / divisorBig) / Number(remainder);
  return {
    balance: adjusted.toLocaleString("en-US", { maximumFractionDigits: 2 }),
    symbol: tokenKey,
  };
}

async function solanaBalance(walletAddress: string) {
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const res = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1,
      method: "getTokenAccountsByOwner",
      params: [walletAddress, { mint: USDC_MINT }, { encoding: "jsonParsed" }],
    }),
  });
  const data = await res.json();
  const accounts = data.result?.value ?? [];
  const uiAmount: number =
    accounts[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
  return {
    balance: uiAmount.toLocaleString("en-US", { maximumFractionDigits: 2 }),
    symbol: "USDC",
  };
}

async function tronBalance(walletAddress: string, tokenKey: "USDT" | "USDC") {
  const CONTRACTS: Record<string, string> = {
    USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    USDC: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
  };
  const contractAddr = CONTRACTS[tokenKey];
  const res = await fetch(`https://api.trongrid.io/v1/accounts/${walletAddress}`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  const account = data.data?.[0];
  if (!account) return { balance: "0.00", symbol: tokenKey };
  const trc20: Record<string, string>[] = account.trc20 ?? [];
  const entry = trc20.find((t) => t[contractAddr] !== undefined);
  const raw = entry ? Number(entry[contractAddr]) : 0;
  return {
    balance: (raw / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 }),
    symbol: tokenKey,
  };
}

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user?.walletAddress || !user?.walletChain) {
      return NextResponse.json({ balance: null, symbol: null });
    }

    const { searchParams } = new URL(request.url);
    const tokenPref = (searchParams.get("token") ?? "USDT") as "USDT" | "USDC";

    const { walletAddress, walletChain } = user;
    let result: { balance: string; symbol: string };

    if (walletChain === "POLYGON" || walletChain === "BSC") {
      result = await evmBalance(walletAddress, walletChain, tokenPref);
    } else if (walletChain === "SOLANA") {
      result = await solanaBalance(walletAddress);
    } else if (walletChain === "TRON") {
      result = await tronBalance(walletAddress, tokenPref);
    } else {
      result = { balance: "—", symbol: "" };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[wallet/balance]", err);
    return NextResponse.json({ error: String(err), balance: "—", symbol: "" }, { status: 500 });
  }
}
