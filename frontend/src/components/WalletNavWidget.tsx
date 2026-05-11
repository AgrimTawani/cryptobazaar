"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const META: Record<string, { label: string; color: string }> = {
  POLYGON: { label: "Polygon", color: "#7b3fe4" },
  SOLANA:  { label: "Solana",  color: "#9945ff" },
  TRON:    { label: "TRON",    color: "#dc2626" },
  BSC:     { label: "BNB",     color: "#b45309" },
};

export function WalletNavWidget() {
  const [info, setInfo] = useState<{
    address: string;
    chain: string;
    balance: string | null;
    symbol: string | null;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/onboarding/status").then((r) => r.json()),
      fetch("/api/wallet/balance").then((r) => r.json()),
    ])
      .then(([status, bal]) => {
        if (!mounted) return;
        if (status.walletAddress && status.walletChain) {
          setInfo({
            address: status.walletAddress,
            chain: status.walletChain,
            balance: bal.balance ?? null,
            symbol: bal.symbol ?? null,
          });
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!info) return null;

  const meta = META[info.chain] ?? META.POLYGON;
  const short = (a: string) =>
    a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-[6px] border border-[#e5e5e5] bg-[#fafafa] rounded-full px-[10px] py-[5px] no-underline hover:border-[#ccc] transition-colors"
    >
      <span className="text-[8px] leading-none" style={{ color: meta.color }}>
        ●
      </span>
      <span
        className="font-sans text-[0.7rem] font-semibold"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
      <span className="text-[#e0e0e0] select-none">|</span>
      <span className="font-mono text-[0.7rem] text-[#444]">
        {short(info.address)}
      </span>
      {info.balance !== null && (
        <>
          <span className="text-[#e0e0e0] select-none">|</span>
          <span
            className="font-sans text-[0.7rem] font-bold"
            style={{ color: meta.color }}
          >
            {info.balance} {info.symbol}
          </span>
        </>
      )}
    </Link>
  );
}
