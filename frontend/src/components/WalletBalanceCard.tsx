"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const CHAIN_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  POLYGON: { label: "Polygon",      color: "#7b3fe4", bg: "#f5f0ff", border: "#c4b5fd", icon: "⬡" },
  SOLANA:  { label: "Solana",       color: "#9945ff", bg: "#f8f0ff", border: "#c084fc", icon: "◎" },
  TRON:    { label: "TRON (TRC20)", color: "#dc2626", bg: "#fff1f2", border: "#fca5a5", icon: "⬟" },
  BSC:     { label: "BNB Chain",    color: "#b45309", bg: "#fffbeb", border: "#fcd34d", icon: "⬡" },
};

const CHAIN_ID_TO_KEY: Record<number, "POLYGON" | "BSC"> = {
  137: "POLYGON",
  80002: "POLYGON",
  56: "BSC",
  97: "BSC",
};

function useMetaMaskChainKey(): "POLYGON" | "BSC" {
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string>; on: (e: string, h: (id: string) => void) => void; removeListener: (e: string, h: (id: string) => void) => void } }).ethereum;
    if (!eth) return;

    eth.request({ method: "eth_chainId" }).then((hex) => setChainId(parseInt(hex, 16)));

    const handler = (hex: string) => setChainId(parseInt(hex, 16));
    eth.on("chainChanged", handler);
    return () => eth.removeListener("chainChanged", handler);
  }, []);

  return CHAIN_ID_TO_KEY[chainId ?? 0] ?? "POLYGON";
}

const EVM_TOKENS = ["USDT", "USDC"] as const;
type TokenPref = typeof EVM_TOKENS[number];

const CHAIN_FIXED_TOKEN: Record<string, TokenPref | null> = {
  SOLANA: "USDC",
};

function detectAddressType(address: string): "EVM" | "TRON" | "SOLANA" {
  if (address.startsWith("0x")) return "EVM";
  if (address.startsWith("T") && address.length === 34) return "TRON";
  return "SOLANA";
}

interface Props {
  walletAddress: string;
  className?: string;
}

export function WalletBalanceCard({ walletAddress, className }: Props) {
  const router = useRouter();
  const evmChainKey = useMetaMaskChainKey();

  const addressType = detectAddressType(walletAddress);
  const chainKey =
    addressType === "EVM" ? evmChainKey :
    addressType === "TRON" ? "TRON" : "SOLANA";

  const [token, setToken]         = useState<TokenPref>("USDC");
  const [balance, setBalance]     = useState<string | null>(null);
  const [symbol, setSymbol]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);

  const meta      = CHAIN_META[chainKey] ?? CHAIN_META.POLYGON;
  const fixedToken = CHAIN_FIXED_TOKEN[chainKey] ?? null;

  const fetchBalance = useCallback(() => {
    setLoading(true);
    const t = fixedToken ?? token;
    const chainParam = addressType === "EVM" ? `&chain=${evmChainKey}` : "";
    fetch(`/api/wallet/balance?token=${t}${chainParam}`)
      .then((r) => r.json())
      .then((d) => { setBalance(d.balance ?? "-"); setSymbol(d.symbol ?? ""); })
      .catch(() => setBalance("-"))
      .finally(() => setLoading(false));
  }, [token, fixedToken, addressType, evmChainKey]);

  // Refetch when token changes or when MetaMask switches chain (evmChainKey changes)
  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const switchToken = (newToken: TokenPref) => {
    if (newToken === token) return;
    setToken(newToken);
  };

  const truncate = (addr: string) =>
    addr.length > 16 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  return (
    <div
      className={`bg-white border border-[#e8e8e8] rounded-xl p-5 transition-colors duration-300 ${className || ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none text-[#888]">{meta.icon}</span>
          <span className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold">
            {meta.label}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Token switcher — EVM and TRON; hidden for Solana (USDC-only) */}
          {!fixedToken && (
            <div className="flex items-center gap-0.5 bg-white border border-[#e0e0e0] rounded-full p-0.75">
              {EVM_TOKENS.map((t) => (
                <button
                  key={t}
                  onClick={() => switchToken(t)}
                  className="font-sans text-[0.65rem] font-semibold px-2 py-0.75 rounded-full cursor-pointer transition-all"
                  style={
                    token === t
                      ? { background: "#111", color: "#fff" }
                      : { background: "transparent", color: "#888" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <span className="font-sans text-[0.68rem] font-semibold px-2.5 py-0.75 rounded-full bg-[#f5f5f5] text-[#888] border border-[#e0e0e0]">
            Connected
          </span>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="font-mono text-[0.88rem] text-[#111] tracking-tight">
          {truncate(walletAddress)}
        </span>
        <button
          onClick={handleCopy}
          className="ml-auto font-sans text-[0.68rem] text-[#666] bg-white border border-[#e0e0e0] px-2 py-0.5 rounded-full cursor-pointer shrink-0 transition-colors hover:border-[#bbb]"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Balance */}
      <div>
        <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold mb-1.5">
          Token Balance
        </p>
        {loading ? (
          <div className="flex items-center gap-2.5">
            <span className="w-4.5 h-4.5 rounded-full border-[2.5px] border-[#e0e0e0] border-t-[#888] animate-spin" />
            <span className="font-sans text-[0.8rem] text-[#999]">Fetching balance…</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-condensed text-[2.2rem] tracking-[0.5px] leading-none text-[#111]">
              {balance && balance !== "-"
                ? parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                : balance}
            </span>
            <span className="font-sans text-[0.9rem] font-semibold text-[#888]">
              {symbol}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
