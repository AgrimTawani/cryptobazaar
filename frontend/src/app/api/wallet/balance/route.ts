import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { polygon, bsc } from "thirdweb/chains";

const client = createThirdwebClient(
  process.env.THIRDWEB_SECRET_KEY
    ? { secretKey: process.env.THIRDWEB_SECRET_KEY }
    : { clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID! }
);

const EVM_TOKENS = {
  POLYGON: { contractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", chain: polygon, decimals: 6,  symbol: "USDT" },
  BSC:     { contractAddress: "0x55d398326f99059fF775485246999027B3197955", chain: bsc,     decimals: 18, symbol: "USDT" },
} as const;

async function evmBalance(walletAddress: string, chainKey: "POLYGON" | "BSC") {
  const token = EVM_TOKENS[chainKey];
  const contract = getContract({ client, chain: token.chain, address: token.contractAddress });
  const raw: bigint = await readContract({
    contract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [walletAddress as `0x${string}`],
  });
  // Handle 18-decimal tokens safely with BigInt before converting to Number
  const divisorBig = BigInt(10 ** Math.min(token.decimals, 12));
  const remainder = BigInt(10 ** Math.max(token.decimals - 12, 0));
  const adjusted = Number(raw / divisorBig) / Number(remainder);
  return { balance: adjusted.toLocaleString("en-US", { maximumFractionDigits: 2 }), symbol: token.symbol };
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
  const uiAmount: number = accounts[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
  return { balance: uiAmount.toLocaleString("en-US", { maximumFractionDigits: 2 }), symbol: "USDC" };
}

async function tronBalance(walletAddress: string) {
  const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const res = await fetch(`https://api.trongrid.io/v1/accounts/${walletAddress}`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  const account = data.data?.[0];
  if (!account) return { balance: "0.00", symbol: "USDT" };
  const trc20: Record<string, string>[] = account.trc20 ?? [];
  const entry = trc20.find((t) => t[USDT_CONTRACT] !== undefined);
  const raw = entry ? Number(entry[USDT_CONTRACT]) : 0;
  return { balance: (raw / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 }), symbol: "USDT" };
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user?.walletAddress || !user?.walletChain) {
      return NextResponse.json({ balance: null, symbol: null });
    }

    const { walletAddress, walletChain } = user;

    let result: { balance: string; symbol: string };
    if (walletChain === "POLYGON" || walletChain === "BSC") {
      result = await evmBalance(walletAddress, walletChain);
    } else if (walletChain === "SOLANA") {
      result = await solanaBalance(walletAddress);
    } else if (walletChain === "TRON") {
      result = await tronBalance(walletAddress);
    } else {
      result = { balance: "—", symbol: "" };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[wallet/balance]", err);
    return NextResponse.json({ error: String(err), balance: "—", symbol: "" }, { status: 500 });
  }
}
