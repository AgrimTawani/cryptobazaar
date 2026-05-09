"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

const FILTERS = ["All", "USDT", "USDC"];
const CHAINS = ["All Chains", "Polygon", "Solana", "Tron"];

export default function MarketplacePage() {
  const { user } = useUser();
  const [assetFilter, setAssetFilter] = useState("All");
  const [chainFilter, setChainFilter] = useState("All Chains");

  // Placeholder — will be replaced with real DB query
  const isVerified = false;
  const orders: never[] = [];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#f0f0f0] px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-condensed text-base tracking-[3px] text-black no-underline">
          CRYPTOBAZAAR
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className="font-sans text-[0.82rem] text-[#888] no-underline">Home</Link>
          <span className="text-[#ddd]">·</span>
          <Link href="/dashboard" className="flex items-center gap-2 no-underline pt-[5px] pr-[14px] pb-[5px] pl-[5px] border-[1.5px] border-solid border-[#e0e0e0] rounded-full bg-white">
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="" width={24} height={24} className="rounded-full" />
            )}
            <span className="font-sans text-[0.8rem] font-medium text-[#111]">
              {user?.firstName ?? "Dashboard"}
            </span>
          </Link>
        </div>
      </header>

      {/* Verification banner */}
      {!isVerified && (
        <div className="bg-black py-3 px-10 flex items-center justify-between flex-wrap gap-3">
          <p className="font-sans text-[0.82rem] text-white/70">
            👀 <strong className="text-white">View only.</strong> Complete your verification to buy or sell.
          </p>
          <Link href="/onboarding" className="font-sans text-[0.78rem] font-semibold text-black bg-lime py-[6px] px-4 rounded-full no-underline">
            Complete Verification →
          </Link>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto py-10 px-6">
        {/* Header row */}
        <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-condensed text-[2.4rem] tracking-[1px] leading-none mb-[6px]">
              LIVE LISTINGS
            </h1>
            <p className="font-sans text-[0.85rem] text-[#888]">
              {orders.length} active orders · INR ↔ USDT / USDC
            </p>
          </div>

          {isVerified && (
            <Link
              href="/marketplace/sell"
              className="py-3 px-7 bg-black text-white rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline"
            >
              + Post Order
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setAssetFilter(f)}
              className={`py-[7px] px-[18px] rounded-full border-[1.5px] border-solid font-sans text-[0.8rem] font-medium cursor-pointer ${
                assetFilter === f
                  ? "border-black bg-black text-white"
                  : "border-[#e5e5e5] bg-white text-[#555]"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="w-px bg-[#e5e5e5] mx-1" />
          {CHAINS.map((c) => (
            <button
              key={c}
              onClick={() => setChainFilter(c)}
              className={`py-[7px] px-[18px] rounded-full border-[1.5px] border-solid font-sans text-[0.8rem] font-medium cursor-pointer ${
                chainFilter === c
                  ? "border-black bg-black text-white"
                  : "border-[#e5e5e5] bg-white text-[#555]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_120px_140px_140px_100px_140px] gap-3 py-[10px] px-5 bg-[#f5f5f5] rounded-[10px] mb-2">
          {["Seller", "Asset", "Price / unit", "Available", "Payment", ""].map((h) => (
            <span key={h} className="font-sans text-[0.68rem] text-[#999] tracking-[1px] uppercase">{h}</span>
          ))}
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="text-center py-20 px-6">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-condensed text-[1.6rem] tracking-[0.5px] mb-2">
              No listings yet
            </h3>
            <p className="font-sans text-sm text-[#888] max-w-[320px] mx-auto mb-6 leading-[1.6]">
              Be the first to post a sell order. The marketplace opens to verified members only.
            </p>
            {isVerified ? (
              <Link href="/marketplace/sell" className="py-3 px-7 bg-black text-white rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline">
                Post First Order →
              </Link>
            ) : (
              <Link href="/onboarding" className="py-3 px-7 bg-lime text-black rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline">
                Get Verified →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
