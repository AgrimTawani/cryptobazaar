"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const META: Record<string, { label: string; color: string }> = {
  POLYGON: { label: "Polygon", color: "#7b3fe4" },
  SOLANA:  { label: "Solana",  color: "#9945ff" },
  TRON:    { label: "TRON",    color: "#dc2626" },
  BSC:     { label: "BNB",     color: "#b45309" },
};

const CHAIN_ID_TO_KEY: Record<number, "POLYGON" | "BSC"> = {
  137: "POLYGON",
  80002: "POLYGON",
  56: "BSC",
  97: "BSC",
};

function resolveChainKey(address: string, evmChainId: number | null): string {
  if (address.startsWith("T") && address.length === 34) return "TRON";
  if (!address.startsWith("0x")) return "SOLANA";
  return CHAIN_ID_TO_KEY[evmChainId ?? 0] ?? "POLYGON";
}

export function WalletNavWidget() {
  const [evmChainId, setEvmChainId] = useState<number | null>(null);
  const [info, setInfo] = useState<{
    address: string;
    balance: string | null;
    symbol: string | null;
  } | null>(null);

  // Track MetaMask chain directly
  useEffect(() => {
    const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string>; on: (e: string, h: (id: string) => void) => void; removeListener: (e: string, h: (id: string) => void) => void } }).ethereum;
    if (!eth) return;

    eth.request({ method: "eth_chainId" }).then((hex) => setEvmChainId(parseInt(hex, 16)));

    const handler = (hex: string) => setEvmChainId(parseInt(hex, 16));
    eth.on("chainChanged", handler);
    return () => eth.removeListener("chainChanged", handler);
  }, []);

  // Refetch balance whenever chain changes
  useEffect(() => {
    let mounted = true;
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((status) => {
        if (!mounted || !status.walletAddress) return;

        const chainKey = resolveChainKey(status.walletAddress, evmChainId);
        const chainParam = status.walletAddress.startsWith("0x") ? `&chain=${chainKey}` : "";
        const token = process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID === "80002" ? "USDC" : "USDT";

        fetch(`/api/wallet/balance?token=${token}${chainParam}`)
          .then((r) => r.json())
          .then((bal) => {
            if (!mounted) return;
            setInfo({ address: status.walletAddress, balance: bal.balance ?? null, symbol: bal.symbol ?? null });
          })
          .catch(() => {});
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [evmChainId]);

  if (!info) return null;

  const chainKey = resolveChainKey(info.address, evmChainId);
  const meta = META[chainKey] ?? META.POLYGON;
  const short = (a: string) =>
    a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-1.5 border border-[#555] text-[#555] bg-white rounded-full px-3 py-1.5 no-underline hover:bg-[#f5f5f5] transition-colors"
    >
      <span className="text-[8px] leading-none" style={{ color: meta.color }}>●</span>
      <span className="font-sans text-[0.7rem] font-semibold" style={{ color: meta.color }}>
        {meta.label}
      </span>
      {/* Address is hidden on mobile to keep the nav uncramped — it lives on the dashboard. */}
      <span className="hidden sm:inline text-[#e0e0e0] select-none">|</span>
      <span className="hidden sm:inline font-mono text-[0.7rem] text-[#444]">{short(info.address)}</span>
      {info.balance !== null && (
        <>
          <span className="text-[#e0e0e0] select-none">|</span>
          <span className="font-sans text-[0.7rem] font-bold" style={{ color: meta.color }}>
            {info.balance} {info.symbol}
          </span>
        </>
      )}
    </Link>
  );
}
