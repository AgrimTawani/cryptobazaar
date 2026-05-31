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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#f0f0f0] px-5 md:px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <Link
          href="/"
          className="nav-logo no-underline text-black"
        >
          CRYPTOBAZAAR
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden md:inline font-sans text-[0.82rem] text-[#888] no-underline"
          >
            Home
          </Link>
          <span className="text-[#ddd] hidden md:inline">·</span>
          <WalletNavWidget />
          <span className="text-[#ddd] hidden md:inline">·</span>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 no-underline pt-[5px] pr-[14px] pb-[5px] pl-[5px] border-[1.5px] border-solid border-[#e0e0e0] rounded-full bg-white"
          >
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt=""
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="font-sans text-[0.8rem] font-medium text-[#111] hidden sm:inline">
              {user?.firstName ?? "Dashboard"}
            </span>
          </Link>
        </div>
      </header>

      {/* Verification banner */}
      {!isVerified && (
        <div className="bg-black py-3 px-5 md:px-10 flex items-center justify-between flex-wrap gap-3">
          <p className="font-sans text-[0.82rem] text-white/70">
            👀 <strong className="text-white">View only.</strong> Complete your
            verification to buy or sell.
          </p>
          <Link
            href="/onboarding"
            className="font-sans text-[0.78rem] font-semibold text-black bg-lime py-[6px] px-4 rounded-full no-underline"
          >
            Complete Verification →
          </Link>
        </div>
      )}

      <div className="max-w-[1100px] mx-auto py-8 md:py-10 px-4 md:px-6">

        {/* Your active orders */}
        {myOrders.length > 0 && (
          <div className="mb-10">
            <h2 className="font-condensed text-[1.4rem] tracking-[1px] mb-3">YOUR ACTIVE ORDERS</h2>
            <div className="flex flex-col gap-2">
              {myOrders.map((o) => {
                const cfg = MY_STATUS_COLOR[o.status] ?? MY_STATUS_COLOR.LISTED;
                return (
                  <Link
                    key={o.id}
                    href={`/marketplace/${o.id}`}
                    className="flex items-center justify-between bg-white border border-[#e5e5e5] rounded-[12px] px-5 py-4 no-underline hover:border-[#bbb] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-sans text-[0.85rem] font-semibold text-[#111]">
                          {o.amount} {o.asset}
                        </p>
                        <p className="font-sans text-[0.75rem] text-[#888]">
                          ₹{parseFloat(o.pricePerUnit).toFixed(2)}/unit · ₹{parseFloat(o.totalValueInr).toLocaleString("en-IN")} total
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="font-sans text-[0.72rem] font-semibold px-3 py-[4px] rounded-full"
                        style={{ color: cfg.color, background: cfg.bg }}
                      >
                        {o.statusLabel}
                      </span>
                      <span className="font-sans text-[0.8rem] text-[#7b3fe4] font-semibold">
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
        <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-condensed text-[2.4rem] tracking-[1px] leading-none mb-[6px]">
              LIVE LISTINGS
            </h1>
            <p className="font-sans text-[0.85rem] text-[#888]">
              {filtered.length} active orders · INR ↔ USDT / USDC
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
          {ASSET_FILTERS.map((f) => (
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
          {CHAIN_FILTERS.map((c) => (
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

        {/* Table header - hidden on mobile */}
        <div className="hidden md:grid grid-cols-[1fr_100px_130px_130px_140px_120px] gap-3 py-[10px] px-5 bg-[#f5f5f5] rounded-[10px] mb-2">
          {["Seller", "Asset", "Price / unit", "Available", "Payment", ""].map(
            (h) => (
              <span
                key={h}
                className="font-sans text-[0.68rem] text-[#999] tracking-[1px] uppercase"
              >
                {h}
              </span>
            )
          )}
        </div>

        {/* Order rows - desktop table */}
        <div className="hidden md:block">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-[1fr_100px_130px_130px_140px_120px] gap-3 items-center py-[12px] px-5 border-b border-[#f0f0f0] hover:bg-white transition-colors rounded-[8px]"
          >
            {/* Seller */}
            <div className="flex items-center gap-2 min-w-0">
              {order.sellerAvatar ? (
                <img
                  src={order.sellerAvatar}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#e5e5e5] shrink-0" />
              )}
              <span className="font-sans text-[0.85rem] text-[#111] truncate">
                {order.sellerName}
              </span>
            </div>

            {/* Asset */}
            <span className="font-sans text-[0.85rem] font-semibold text-[#111]">
              {order.asset}
            </span>

            {/* Price */}
            <span className="font-mono text-[0.85rem] text-[#111]">
              ₹{parseFloat(order.pricePerUnit).toFixed(2)}
            </span>

            {/* Available */}
            <span className="font-mono text-[0.85rem] text-[#111]">
              {parseFloat(order.amount).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}{" "}
              {order.asset}
            </span>

            {/* Payment */}
            <div className="flex gap-1 flex-wrap">
              {order.acceptedPaymentMethods.map((m) => (
                <span
                  key={m}
                  className="font-sans text-[0.68rem] bg-[#f0f0f0] text-[#555] px-2 py-[2px] rounded-full"
                >
                  {m}
                </span>
              ))}
            </div>

            {/* Action */}
            <div className="flex flex-col items-start gap-[5px]">
              {order.isMine ? (
                <Link
                  href={`/marketplace/${order.id}`}
                  className="font-sans text-[0.78rem] font-semibold text-[#7b3fe4] border border-[#c4b5fd] bg-[#f5f0ff] py-[6px] px-4 rounded-full text-center no-underline hover:bg-[#ede9fe] transition-colors"
                >
                  Your listing →
                </Link>
              ) : (
                <Link
                  href={`/marketplace/${order.id}`}
                  className="font-sans text-[0.78rem] font-semibold text-white bg-black py-[6px] px-4 rounded-full text-center no-underline hover:bg-[#333] transition-colors"
                >
                  Buy
                </Link>
              )}
              {order.escrowTxHash && (
                <a
                  href={txUrl(order.escrowTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-[0.62rem] text-[#999] underline hover:text-[#7b3fe4] transition-colors"
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
              className="bg-white border border-[#e5e5e5] rounded-xl p-4 no-underline block"
            >
              <div className="flex items-center gap-2 mb-3">
                {order.sellerAvatar ? (
                  <img src={order.sellerAvatar} alt="" width={24} height={24} className="rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#e5e5e5]" />
                )}
                <span className="font-sans text-[0.85rem] text-[#111] font-medium">{order.sellerName}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-sans text-[0.95rem] font-semibold text-[#111] mb-[2px]">
                    {parseFloat(order.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {order.asset}
                  </p>
                  <p className="font-mono text-[0.8rem] text-[#888]">
                    ₹{parseFloat(order.pricePerUnit).toFixed(2)} / unit
                  </p>
                </div>
                <span className={`font-sans text-[0.78rem] font-semibold py-1.5 px-4 rounded-full ${
                  order.isMine
                    ? "text-[#7b3fe4] border border-[#c4b5fd] bg-[#f5f0ff]"
                    : "text-white bg-black"
                }`}>
                  {order.isMine ? "Your listing →" : "Buy"}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20 px-6">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-condensed text-[1.6rem] tracking-[0.5px] mb-2">
              No other listings yet
            </h3>
            <p className="font-sans text-sm text-[#888] max-w-[320px] mx-auto mb-6 leading-[1.6]">
              {myOrders.length > 0
                ? "Your listing is live and visible to buyers. No other sellers have posted yet."
                : "Be the first to post a sell order. The marketplace opens to verified members only."}
            </p>
            {isVerified ? (
              <Link
                href="/marketplace/sell"
                className="py-3 px-7 bg-black text-white rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline"
              >
                Post First Order →
              </Link>
            ) : (
              <Link
                href="/onboarding"
                className="py-3 px-7 bg-lime text-black rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline"
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
