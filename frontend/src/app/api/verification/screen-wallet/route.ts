import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GoPlus chain IDs for supported networks
const GOPLUS_CHAIN_IDS: Record<string, string> = {
  POLYGON: "137",
  BSC: "56",
};

// Flags from GoPlus response that map to each risk level
const BLOCKED_FLAGS = ["darkweb_transactions", "honeypot_related_address"];
const HIGH_FLAGS = ["blacklist", "sanctioned", "phishing_activities", "stealing_attack", "fake_token", "cybercrime"];
const MEDIUM_FLAGS = ["money_laundering", "blacklist_doubt", "mixer", "bridge_risk"];

function parseGoPlus(result: Record<string, string>): {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";
  riskScore: number;
  flags: string[];
} {
  const activeFlags: string[] = [];

  // GoPlus returns "1" for true, "0" for false on all boolean fields
  const allFlagKeys = [...BLOCKED_FLAGS, ...HIGH_FLAGS, ...MEDIUM_FLAGS];
  for (const key of allFlagKeys) {
    if (result[key] === "1") activeFlags.push(key);
  }

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "BLOCKED" = "LOW";
  if (activeFlags.some((f) => BLOCKED_FLAGS.includes(f))) riskLevel = "BLOCKED";
  else if (activeFlags.some((f) => HIGH_FLAGS.includes(f))) riskLevel = "HIGH";
  else if (activeFlags.some((f) => MEDIUM_FLAGS.includes(f))) riskLevel = "MEDIUM";

  const scoreMap = { LOW: 10, MEDIUM: 45, HIGH: 75, BLOCKED: 95 };

  return { riskLevel, riskScore: scoreMap[riskLevel], flags: activeFlags };
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { walletAddress, walletChain } = await req.json() as {
      walletAddress: string;
      walletChain: string; // "POLYGON" | "BSC"
    };

    if (!walletAddress || !walletChain) {
      return NextResponse.json({ error: "walletAddress and walletChain are required" }, { status: 400 });
    }

    const goplusChainId = GOPLUS_CHAIN_IDS[walletChain.toUpperCase()];

    // Testnet or unsupported chain — auto-pass, skip screening
    if (!goplusChainId) {
      await db.walletScreen.create({
        data: {
          userId: user.id,
          walletAddress,
          provider: "goplus",
          riskScore: 0,
          riskLevel: "LOW",
          flags: [],
          isPassed: true,
          rawResponse: { skipped: true, reason: `Chain ${walletChain} not covered by GoPlus (testnet or unsupported)` },
        },
      });
      return NextResponse.json({ passed: true, riskLevel: "LOW", flags: [], skipped: true });
    }

    const goplusUrl = `https://api.gopluslabs.io/api/v1/address_security/${walletAddress}?chain_id=${goplusChainId}`;
    const goplusRes = await fetch(goplusUrl, { headers: { "accept": "application/json" } });
    const goplusData = await goplusRes.json();

    const rawResult: Record<string, string> = goplusData?.result ?? {};
    const { riskLevel, riskScore, flags } = parseGoPlus(rawResult);

    // All wallets pass — admin makes the final decision
    await db.walletScreen.create({
      data: {
        userId: user.id,
        walletAddress,
        provider: "goplus",
        riskScore,
        riskLevel,
        flags,
        isPassed: true,
        rawResponse: goplusData,
      },
    });

    return NextResponse.json({ passed: true, riskLevel, flags });
  } catch (err) {
    console.error("[screen-wallet]", err);
    // On GoPlus failure, don't block the user — return a safe pass
    return NextResponse.json({ passed: true, riskLevel: "LOW", flags: [], error: "Screening unavailable" });
  }
}
