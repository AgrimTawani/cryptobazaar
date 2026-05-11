"use client";

import { useState, useEffect, useCallback } from "react";

const CHAIN_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  POLYGON: { label: "Polygon",      color: "#7b3fe4", bg: "#f5f0ff", border: "#c4b5fd", icon: "⬡" },
  SOLANA:  { label: "Solana",       color: "#9945ff", bg: "#f8f0ff", border: "#c084fc", icon: "◎" },
  TRON:    { label: "TRON (TRC20)", color: "#dc2626", bg: "#fff1f2", border: "#fca5a5", icon: "⬟" },
  BSC:     { label: "BNB Chain",    color: "#b45309", bg: "#fffbeb", border: "#fcd34d", icon: "⬡" },
};

const EVM_CHAINS = [
  { key: "POLYGON", label: "Polygon" },
  { key: "BSC",     label: "BNB Chain" },
];

interface Props {
  walletAddress: string;
  walletChain: string;
}

export function WalletBalanceCard({ walletAddress, walletChain: initialChain }: Props) {
  const [chain, setChain]       = useState(initialChain);
  const [balance, setBalance]   = useState<string | null>(null);
  const [symbol, setSymbol]     = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [switching, setSwitching] = useState(false);
  const [copied, setCopied]     = useState(false);

  const meta = CHAIN_META[chain] ?? CHAIN_META.POLYGON;
  const isEvm = chain === "POLYGON" || chain === "BSC";

  const fetchBalance = useCallback(() => {
    setLoading(true);
    fetch("/api/wallet/balance")
      .then((r) => r.json())
      .then((d) => { setBalance(d.balance ?? "—"); setSymbol(d.symbol ?? ""); })
      .catch(() => setBalance("—"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const switchChain = async (newChain: string) => {
    if (newChain === chain || switching) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/wallet/chain", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletChain: newChain }),
      });
      if (res.ok) {
        setChain(newChain);
        // Re-fetch balance for new chain — balance endpoint reads chain from DB
        setBalance(null);
        setLoading(true);
        setTimeout(fetchBalance, 400); // small delay so DB write propagates
      }
    } finally {
      setSwitching(false);
    }
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
      className="rounded-[20px] p-6 border-[1.5px] transition-colors duration-300"
      style={{ background: meta.bg, borderColor: meta.border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none" style={{ color: meta.color }}>{meta.icon}</span>
          <span
            className="font-sans text-[0.78rem] font-bold uppercase tracking-[1.2px]"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* EVM chain switcher */}
          {isEvm && (
            <div className="flex items-center gap-[2px] bg-white border border-[#e0e0e0] rounded-full p-[3px]">
              {EVM_CHAINS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => switchChain(c.key)}
                  disabled={switching}
                  className="font-sans text-[0.65rem] font-semibold px-[8px] py-[3px] rounded-full cursor-pointer transition-all disabled:opacity-50"
                  style={
                    chain === c.key
                      ? { background: meta.color, color: "#fff" }
                      : { background: "transparent", color: "#888" }
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          <span
            className="font-sans text-[0.68rem] font-semibold px-[10px] py-[3px] rounded-full"
            style={{ background: meta.color + "1a", color: meta.color, border: `1px solid ${meta.color}33` }}
          >
            Connected
          </span>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 mb-5">
        <span className="font-mono text-[0.88rem] text-[#111] tracking-tight">
          {truncate(walletAddress)}
        </span>
        <button
          onClick={handleCopy}
          className="font-sans text-[0.68rem] text-[#666] bg-white border border-[#e0e0e0] px-[8px] py-[2px] rounded-full cursor-pointer shrink-0 transition-colors hover:border-[#bbb]"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Balance */}
      <div>
        <p className="font-sans text-[0.68rem] text-[#999] uppercase tracking-[1.2px] mb-[6px]">
          Token Balance
        </p>
        {loading ? (
          <div className="flex items-center gap-[10px]">
            <span
              className="w-[18px] h-[18px] rounded-full border-[2.5px] animate-spin"
              style={{ borderColor: `${meta.color}40`, borderTopColor: meta.color }}
            />
            <span className="font-sans text-[0.8rem] text-[#999]">Fetching balance…</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-[8px]">
            <span
              className="font-condensed text-[2.8rem] tracking-[0.5px] leading-none"
              style={{ color: meta.color }}
            >
              {balance}
            </span>
            <span className="font-sans text-[0.9rem] font-semibold" style={{ color: meta.color + "99" }}>
              {symbol}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
