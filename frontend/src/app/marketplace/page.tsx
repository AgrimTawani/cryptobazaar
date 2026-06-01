"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletNavWidget } from "@/components/WalletNavWidget";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { txUrl } from "@/lib/explorer";

const ASSET_FILTERS = ["All", "USDT", "USDC"];
const CHAIN_FILTERS = ["All Chains", "Polygon", "Solana", "Tron", "BNB"];

const CHAIN_MAP: Record<string, string> = {
  Polygon: "POLYGON",
  Solana: "SOLANA",
  Tron: "TRON",
  BNB: "BSC",
};

interface OrderRow {
  id: string;
  orderId: string;
  sellerName: string;
  sellerAvatar: string | null;
  asset: string;
  chain: string;
  amount: string;
  pricePerUnit: string;
  totalValueInr: string;
  acceptedPaymentMethods: string[];
  escrowTxHash: string | null;
  escrowContractAddress: string | null;
  status: string;
  statusLabel: string;
  isMine: boolean;
}

const MY_STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  LISTED:        { color: "#555",    bg: "#f5f5f5" },
  BUYER_MATCHED: { color: "#1e40af", bg: "#eff6ff" },
  BUYER_PAID:    { color: "#92400e", bg: "#fffbeb" },
  DISPUTED:      { color: "#991b1b", bg: "#fef2f2" },
};

export default function MarketplacePage() {
  const { user } = useUser();
  const [assetFilter, setAssetFilter] = useState("All");
  const [chainFilter, setChainFilter] = useState("All Chains");
  const [isVerified, setIsVerified] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [myOrders, setMyOrders] = useState<OrderRow[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  useEffect(() => {
    const fetchData = (initial = false) => {
      const requests = initial
        ? [
            fetch("/api/onboarding/status").then((r) => r.json()).catch(() => ({})),
            fetch("/api/orders").then((r) => r.json()).catch(() => []),
            fetch("/api/orders?mine=true").then((r) => r.json()).catch(() => []),
            new Promise((resolve) => setTimeout(resolve, 1500)),
          ]
        : [
            Promise.resolve(null),
            fetch("/api/orders").then((r) => r.json()).catch(() => []),
            fetch("/api/orders?mine=true").then((r) => r.json()).catch(() => []),
            Promise.resolve(null),
          ];

      Promise.all(requests).then(([statusData, ordersData, myOrdersData]) => {
        if (statusData) setIsVerified(statusData?.userStatus === "VERIFIED");
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(myOrdersData)) setMyOrders(myOrdersData);
        if (initial) setIsLoadingDb(false);
      });
    };

    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = orders.filter((o) => {
    const assetMatch = assetFilter === "All" || o.asset === assetFilter;
    const chainMatch =
      chainFilter === "All Chains" ||
      o.chain === CHAIN_MAP[chainFilter];
    return assetMatch && chainMatch;
  });

  if (isLoadingDb) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#ebebeb] px-5 md:px-10 h-[52px] flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="nav-logo no-underline text-black">
          CRYPTOBAZAAR
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden md:inline font-sans text-[0.78rem] text-[#888] no-underline">
            Home
          </Link>
          <span className="text-[#ddd] hidden md:inline">·</span>
          <WalletNavWidget />
          <span className="text-[#ddd] hidden md:inline">·</span>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 no-underline pt-[3px] pr-[10px] pb-[3px] pl-[3px] border-[1.5px] border-solid border-[#e0e0e0] rounded-full bg-white"
          >
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="" width={20} height={20} className="rounded-full" />
            )}
            <span className="font-sans text-[0.76rem] font-medium text-[#111] hidden sm:inline">
              {user?.firstName ?? "Dashboard"}
            </span>
            {isVerified && (
              <span className="font-sans text-[0.56rem] font-bold bg-lime text-black px-[5px] py-[1px] rounded-[3px] tracking-[0.3px] leading-[1.6]">
                ✓ VERIFIED
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Verification banner — only for unverified users */}
      {!isVerified && (
        <div className="bg-black py-2.5 px-5 md:px-10 flex items-center justify-between flex-wrap gap-3">
          <p className="font-sans text-[0.8rem] text-white/70">
            👀 <strong className="text-white">View only.</strong> Complete verification to buy or sell.
          </p>
          <Link
            href="/onboarding"
            className="font-sans text-[0.75rem] font-semibold text-black bg-lime py-[5px] px-4 rounded-full no-underline"
          >
            Complete Verification →
          </Link>
        </div>
      )}

      <div className="max-w-[1120px] mx-auto py-3 md:py-5 px-4 md:px-5">

        {/* Your active orders — compact strip */}
        {myOrders.length > 0 && (
          <div className="mb-4">
            <p className="font-sans text-[0.62rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-[5px]">
              Your Active Orders
            </p>
            <div className="flex flex-col gap-[4px]">
              {myOrders.map((o) => {
                const cfg = MY_STATUS_COLOR[o.status] ?? MY_STATUS_COLOR.LISTED;
                return (
                  <Link
                    key={o.id}
                    href={`/marketplace/${o.id}`}
                    className="flex items-center justify-between bg-white border border-[#e8e8e8] rounded-[8px] px-4 py-[7px] no-underline hover:border-[#bbb] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-sans text-[0.82rem] font-semibold text-[#111]">
                        {o.amount} {o.asset}
                      </p>
                      <p className="font-sans text-[0.72rem] text-[#999]">
                        ₹{parseFloat(o.pricePerUnit).toFixed(2)}/u · ₹{parseFloat(o.totalValueInr).toLocaleString("en-IN")} total · {o.chain}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="font-sans text-[0.67rem] font-semibold px-[8px] py-[2px] rounded-full"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {o.statusLabel}
                      </span>
                      <span className="font-sans text-[0.74rem] text-[#7b3fe4] font-semibold">
                        Manage →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Header row */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <div>
            <h1 className="font-condensed text-[1.9rem] tracking-[1px] leading-none">
              LIVE LISTINGS
            </h1>
            <p className="font-sans text-[0.77rem] text-[#aaa] mt-[3px]">
              {filtered.length} active orders · INR ↔ USDT / USDC
            </p>
          </div>

          {isVerified && (
            <Link
              href="/marketplace/sell"
              className="py-[7px] px-[20px] bg-black text-white rounded-[8px] font-condensed text-[0.95rem] tracking-[1px] no-underline"
            >
              + Post Order
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-[5px] mb-3 flex-wrap">
          {ASSET_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setAssetFilter(f)}
              className={`py-[4px] px-[13px] rounded-full border-[1.5px] border-solid font-sans text-[0.73rem] font-medium cursor-pointer transition-colors ${
                assetFilter === f
                  ? "border-black bg-black text-white"
                  : "border-[#e8e8e8] bg-white text-[#666]"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="w-px bg-[#e8e8e8] mx-[2px]" />
          {CHAIN_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setChainFilter(c)}
              className={`py-[4px] px-[13px] rounded-full border-[1.5px] border-solid font-sans text-[0.73rem] font-medium cursor-pointer transition-colors ${
                chainFilter === c
                  ? "border-black bg-black text-white"
                  : "border-[#e8e8e8] bg-white text-[#666]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Table — wrapped in white card */}
        <div className="hidden md:block bg-white border border-[#e8e8e8] rounded-[10px] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_120px_130px_150px_110px] gap-3 py-[6px] px-4 bg-[#f8f8f8] border-b border-[#ebebeb]">
            {["Seller", "Asset", "Price / unit", "Available", "Payment", ""].map((h) => (
              <span key={h} className="font-sans text-[0.6rem] text-[#aaa] tracking-[1px] uppercase font-semibold">
                {h}
              </span>
            ))}
          </div>

          {/* Order rows */}
          {filtered.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-[1fr_80px_120px_130px_150px_110px] gap-3 items-center py-[8px] px-4 border-b border-[#f2f2f2] hover:bg-[#fafafa] transition-colors last:border-b-0"
            >
              {/* Seller */}
              <div className="flex items-center gap-2 min-w-0">
                {order.sellerAvatar ? (
                  <img src={order.sellerAvatar} alt="" width={24} height={24} className="rounded-full shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#e5e5e5] shrink-0" />
                )}
                <span className="font-sans text-[0.81rem] text-[#111] truncate font-medium">
                  {order.sellerName}
                </span>
              </div>

              {/* Asset */}
              <span className="font-sans text-[0.81rem] font-semibold text-[#111]">
                {order.asset}
              </span>

              {/* Price */}
              <span className="font-mono text-[0.81rem] text-[#111]">
                ₹{parseFloat(order.pricePerUnit).toFixed(2)}
              </span>

              {/* Available */}
              <span className="font-mono text-[0.81rem] text-[#111]">
                {parseFloat(order.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
                {order.asset}
              </span>

              {/* Payment */}
              <div className="flex gap-1 flex-wrap">
                {order.acceptedPaymentMethods.map((m) => (
                  <span key={m} className="font-sans text-[0.62rem] bg-[#f2f2f2] text-[#666] px-[6px] py-[1px] rounded-full">
                    {m}
                  </span>
                ))}
              </div>

              {/* Action */}
              <div className="flex flex-col items-start gap-[4px]">
                {order.isMine ? (
                  <Link
                    href={`/marketplace/${order.id}`}
                    className="font-sans text-[0.73rem] font-semibold text-[#7b3fe4] border border-[#ddd4fe] bg-[#f5f0ff] py-[5px] px-[12px] rounded-[7px] text-center no-underline hover:bg-[#ede9fe] transition-colors"
                  >
                    Yours →
                  </Link>
                ) : (
                  <Link
                    href={`/marketplace/${order.id}`}
                    className="font-sans text-[0.73rem] font-semibold text-white bg-black py-[5px] px-[14px] rounded-[7px] text-center no-underline hover:bg-[#333] transition-colors"
                  >
                    Buy
                  </Link>
                )}
                {order.escrowTxHash && (
                  <a
                    href={txUrl(order.escrowTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[0.6rem] text-[#999] underline hover:text-[#7b3fe4] transition-colors"
                    title={order.escrowTxHash}
                  >
                    ✓ on-chain ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order cards - mobile */}
        <div className="md:hidden flex flex-col gap-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/marketplace/${order.id}`}
              className="bg-white border border-[#e8e8e8] rounded-xl p-4 no-underline block"
            >
              <div className="flex items-center gap-2 mb-2">
                {order.sellerAvatar ? (
                  <img src={order.sellerAvatar} alt="" width={22} height={22} className="rounded-full" />
                ) : (
                  <div className="w-[22px] h-[22px] rounded-full bg-[#e5e5e5]" />
                )}
                <span className="font-sans text-[0.83rem] text-[#111] font-medium">{order.sellerName}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-sans text-[0.92rem] font-semibold text-[#111] mb-[2px]">
                    {parseFloat(order.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {order.asset}
                  </p>
                  <p className="font-mono text-[0.78rem] text-[#888]">
                    ₹{parseFloat(order.pricePerUnit).toFixed(2)} / unit
                  </p>
                </div>
                <span className={`font-sans text-[0.75rem] font-semibold py-1.5 px-4 rounded-[7px] ${
                  order.isMine
                    ? "text-[#7b3fe4] border border-[#ddd4fe] bg-[#f5f0ff]"
                    : "text-white bg-black"
                }`}>
                  {order.isMine ? "Yours →" : "Buy"}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-12 px-6">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="font-condensed text-[1.5rem] tracking-[0.5px] mb-2">
              No listings yet
            </h3>
            <p className="font-sans text-sm text-[#888] max-w-[300px] mx-auto mb-5 leading-[1.6]">
              {myOrders.length > 0
                ? "Your listing is live. No other sellers have posted yet."
                : "Be the first to post a sell order. The marketplace opens to verified members only."}
            </p>
            {isVerified ? (
              <Link
                href="/marketplace/sell"
                className="py-[7px] px-[20px] bg-black text-white rounded-[8px] font-condensed text-[1rem] tracking-[1px] no-underline"
              >
                Post First Order →
              </Link>
            ) : (
              <Link
                href="/onboarding"
                className="py-[7px] px-[20px] bg-lime text-black rounded-[8px] font-condensed text-[1rem] tracking-[1px] no-underline"
              >
                Get Verified →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
