"use client";
import { ArrowLeftRight, ArrowRight } from "lucide-react";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { WalletNavWidget } from "@/components/WalletNavWidget";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { txUrl } from "@/lib/explorer";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { AnimatePresence, motion } from "framer-motion";

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
  sellerAvgRating: number | null;
  sellerRatingCount: number;
  sellerAvgReleaseSecs: number | null;
  asset: string;
  chain: string;
  amount: string;
  partialAllowed: boolean;
  minTradeSize: string | null;
  originalAmount: string;
  pricePerUnit: string;
  totalValueInr: string;
  acceptedPaymentMethods: string[];
  escrowTxHash: string | null;
  escrowContractAddress: string | null;
  status: string;
  statusLabel: string;
  isMine: boolean;
}

function fmtRelease(secs: number | null): string | null {
  if (!secs || secs <= 0) return null;
  if (secs < 60) return `~${secs}s release`;
  return `~${Math.round(secs / 60)}m release`;
}

const CHAIN_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  POLYGON: { label: "Polygon", color: "#7b3fe4", bg: "#f0ebff" },
  BSC: { label: "BSC", color: "#b45309", bg: "#fef9ee" },
  SOLANA: { label: "Solana", color: "#9945ff", bg: "#f5f0ff" },
  TRON: { label: "Tron", color: "#dc2626", bg: "#fff1f2" },
};

const MY_STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  LISTED: { color: "#555", bg: "#f5f5f5" },
  BUYER_MATCHED: { color: "#1e40af", bg: "#eff6ff" },
  BUYER_PAID: { color: "#92400e", bg: "#fffbeb" },
  DISPUTED: { color: "#991b1b", bg: "#fef2f2" },
};

function ChainConfirmPopup({ order, onConfirm, onCancel }: {
  order: OrderRow;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const badge = CHAIN_BADGE[order.chain];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.35)" }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold mb-3">Network Required</p>
        <p className="font-sans text-sm text-[#333] leading-relaxed mb-4">
          This order settles on{" "}
          {badge && (
            <span className="font-semibold px-1.5 py-0.5 rounded-full text-xs mx-0.5"
              style={{ color: badge.color, background: badge.bg }}>
              {badge.label}
            </span>
          )}
          . Make sure your wallet is connected to <strong>{badge?.label ?? order.chain}</strong> before proceeding.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 font-sans text-sm font-semibold py-2.5 rounded-xl border border-[#e5e5e5] text-[#666] cursor-pointer bg-white hover:bg-[#f5f5f5] transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 font-sans text-sm font-semibold py-2.5 rounded-xl bg-black text-white cursor-pointer hover:bg-[#222] transition-colors">
            Continue <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const isGuest = !isSignedIn;
  const [assetFilter, setAssetFilter] = useState("All");
  const [chainFilter, setChainFilter] = useState("All Chains");
  const [pendingOrder, setPendingOrder] = useState<OrderRow | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [myOrders, setMyOrders] = useState<OrderRow[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Sorting and filtering state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [priceSort, setPriceSort] = useState<"default" | "asc" | "desc">("default");
  const [ratingSort, setRatingSort] = useState<"default" | "asc" | "desc">("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 150]);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([50, 150]);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = (initial = false) => {
      const requests = initial
        ? [
          isGuest ? Promise.resolve({}) : fetch("/api/onboarding/status").then((r) => r.json()).catch(() => ({})),
          fetch("/api/orders").then((r) => r.json()).catch(() => []),
          isGuest ? Promise.resolve([]) : fetch("/api/orders?mine=true").then((r) => r.json()).catch(() => []),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]
        : [
          Promise.resolve(null),
          fetch("/api/orders").then((r) => r.json()).catch(() => []),
          isGuest ? Promise.resolve([]) : fetch("/api/orders?mine=true").then((r) => r.json()).catch(() => []),
          Promise.resolve(null),
        ];

      Promise.all(requests).then(([statusData, ordersData, myOrdersData]) => {
        if (statusData) setIsVerified(statusData?.userStatus === "VERIFIED");
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
          if (ordersData.length > 0 && initial) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const prices = ordersData.map((o: any) => parseFloat(o.pricePerUnit));
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            if (min < max) {
              setPriceBounds([min, max]);
              setPriceRange([min, max]);
            } else {
              setPriceBounds([min - 10, max + 10]);
              setPriceRange([min - 10, max + 10]);
            }
          }
        }
        if (Array.isArray(myOrdersData)) setMyOrders(myOrdersData);
        if (initial) setIsLoadingDb(false);
      });
    };

    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000);
    return () => clearInterval(interval);
  }, [isGuest]);

  const filtered = orders.filter((o) => {
    const assetMatch = assetFilter === "All" || o.asset === assetFilter;
    const chainMatch = chainFilter === "All Chains" || o.chain === CHAIN_MAP[chainFilter];
    const p = parseFloat(o.pricePerUnit);
    const priceMatch = p >= priceRange[0] && p <= priceRange[1];
    return assetMatch && chainMatch && priceMatch;
  }).sort((a, b) => {
    let priceDiff = 0;
    if (priceSort === "asc") priceDiff = parseFloat(a.pricePerUnit) - parseFloat(b.pricePerUnit);
    else if (priceSort === "desc") priceDiff = parseFloat(b.pricePerUnit) - parseFloat(a.pricePerUnit);

    let ratingDiff = 0;
    if (ratingSort === "asc" || ratingSort === "desc") {
      const rA = a.sellerAvgRating ?? 0;
      const rB = b.sellerAvgRating ?? 0;
      ratingDiff = ratingSort === "asc" ? rA - rB : rB - rA;
    }

    if (priceDiff !== 0) return priceDiff;
    if (ratingDiff !== 0) return ratingDiff;
    return 0; // default
  });

  if (isLoadingDb) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {pendingOrder && (
        <ChainConfirmPopup
          order={pendingOrder}
          onConfirm={() => { router.push(`/marketplace/${pendingOrder.id}`); setPendingOrder(null); }}
          onCancel={() => setPendingOrder(null)}
        />
      )}
      {/* Header */}
      <header className="bg-white border-b border-[#ebebeb] px-4 md:px-10 h-[64px] flex items-center justify-between gap-2 sticky top-0 z-50">
        <Link href="/" className="nav-logo no-underline text-black shrink-0">CRYPTOBAZAAR</Link>
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link href="/" className="hidden md:inline font-sans text-sm text-[#555] border border-[#555] rounded-full px-4 py-1.5 no-underline hover:bg-[#f5f5f5] transition-colors">Home</Link>
          <span className="text-[#ddd] hidden md:inline">·</span>
          <WalletNavWidget />
          {!isGuest && (
            <>
              <span className="text-[#ddd] hidden md:inline">·</span>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 no-underline py-1 pr-3 border border-[#555] text-[#555] rounded-full hover:bg-[#f5f5f5] transition-colors bg-white ${user?.imageUrl ? "pl-1" : "pl-3"}`}
              >
                {user?.imageUrl && (
                  <Image src={user.imageUrl} alt={user.firstName ? `${user.firstName}'s avatar` : "User avatar"} width={24} height={24} className="rounded-full" />
                )}
                <span className="font-sans text-sm font-medium text-[#111] hidden sm:inline">
                  {user?.firstName ?? "Dashboard"}
                </span>
                {isVerified && (
                  <span className="hidden sm:inline font-sans text-[0.65rem] font-bold bg-lime text-black px-1.5 py-0.5 rounded-[3px] tracking-tight">
                    ✓ VERIFIED
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Guest banner */}
      {isGuest && (
        <div className="bg-black py-3 px-5 md:px-10 flex items-center justify-between flex-wrap gap-3">
          <p className="font-sans text-sm text-white/70">
            <strong className="text-white">Guest view.</strong> Seller names are hidden. Sign in to buy, sell, and see full details.
          </p>
          <Link href="/login" className="font-sans text-sm font-semibold text-black bg-lime py-1.5 px-4 rounded-full no-underline hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow duration-300">
            Sign In to Trade <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </Link>
        </div>
      )}

      {/* Verification banner — only signed-in unverified users */}
      {!isGuest && !isVerified && (
        <div className="bg-black py-3 px-5 md:px-10 flex items-center justify-between flex-wrap gap-3">
          <p className="font-sans text-sm text-white/70">
            <strong className="text-white">View only.</strong> Complete verification to buy or sell.
          </p>
          <Link href="/onboarding" className="font-sans text-sm font-semibold text-black bg-lime py-1.5 px-4 rounded-full no-underline hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow duration-300">
            Complete Verification <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </Link>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto py-6 px-4 md:px-6">

        {/* Scam Awareness Banner */}
        <Link href="/articles/common-p2p-scams" className="group relative overflow-hidden flex items-center justify-between bg-black rounded-xl py-4 px-5 md:px-6 mb-8 cursor-pointer transition-all no-underline shadow-sm">
          <div className="relative z-10">
            <p className="font-sans text-[0.65rem] text-lime tracking-[2px] uppercase mb-1 font-semibold">Platform Safety</p>
            <h3 className="font-condensed text-2xl md:text-3xl tracking-[1px] text-white uppercase m-0 flex items-center gap-3">
              Avoid P2P Scams
              <span className="text-lime group-hover:text-white group-hover:translate-x-1 transition-all"> <ArrowRight className="inline-block w-4 h-4 ml-1" /></span>
            </h3>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <Image src="/hacker-no-scam-painted.png" alt="Avoid Scams" width={104} height={104} className="object-contain opacity-90 rounded-md" />
          </div>
        </Link>

        {/* Active orders strip */}
        {myOrders.length > 0 && (
          <div className="mb-6">
            <p className="font-sans text-xs text-[#aaa] uppercase tracking-widest font-semibold mb-2">Your Active Orders</p>
            <div className="flex flex-col gap-1.5">
              {myOrders.map((o) => {
                const cfg = MY_STATUS_COLOR[o.status] ?? MY_STATUS_COLOR.LISTED;
                return (
                  <Link
                    key={o.id}
                    href={`/marketplace/${o.id}`}
                    className="flex items-center justify-between bg-white border border-[#e8e8e8] rounded-lg px-4 py-2.5 no-underline hover:border-[#bbb] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <p className="font-sans text-sm font-semibold text-[#111]">{o.amount} {o.asset}</p>
                      <p className="font-sans text-sm text-[#999]">₹{parseFloat(o.pricePerUnit).toFixed(2)}/u · ₹{parseFloat(o.totalValueInr).toLocaleString("en-IN")} total</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
                        {o.statusLabel}
                      </span>
                      <span className="font-sans text-sm text-[#7b3fe4] font-semibold">Manage <ArrowRight className="inline-block w-4 h-4 ml-1" /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
          <div>
            <h1 className="font-condensed text-[2.2rem] tracking-[1px] leading-none">LIVE LISTINGS</h1>
            <p className="font-sans text-sm text-[#888] mt-1">{filtered.length} active orders · INR <ArrowLeftRight className="inline-block w-4 h-4 mx-1" /> USDT / USDC</p>
          </div>
          {isVerified && (
            <Link href="/marketplace/sell" className="py-2.5 px-6 bg-black text-white rounded-[10px] font-condensed text-lg tracking-[1px] no-underline hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow duration-300">
              + Post Order
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {ASSET_FILTERS.map((f) => (
              <button key={f} onClick={() => setAssetFilter(f)}
                className={`py-1.5 px-4 rounded-full border-[1.5px] font-sans text-sm font-medium cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:border-[#ccc] ${assetFilter === f ? "border-black bg-black text-white" : "border-[#e5e5e5] bg-white text-[#555]"
                  }`}>
                {f}
              </button>
            ))}
            <div className="w-px bg-[#e5e5e5] mx-1" />
            {CHAIN_FILTERS.map((c) => (
              <button key={c} onClick={() => setChainFilter(c)}
                className={`py-1.5 px-4 rounded-full border-[1.5px] font-sans text-sm font-medium cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:border-[#ccc] ${chainFilter === c ? "border-black bg-black text-white" : "border-[#e5e5e5] bg-white text-[#555]"
                  }`}>
                {c}
              </button>
            ))}
          </div>

          {/* SORT / FILTER BUTTON */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="py-1.5 px-3 rounded-full border-[1.5px] border-[#e5e5e5] bg-white font-sans text-sm font-medium cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:border-[#ccc] flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <span>Sort & Filter</span>
            </button>
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-[280px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#e5e5e5] p-5 z-50 origin-top-right"
                >
                  <div className="mb-5">
                    <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold mb-3">Sort by Price</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Default", val: "default" },
                        { label: "Low to High", val: "asc" },
                        { label: "High to Low", val: "desc" },
                      ].map((opt) => (
                        <label key={opt.val} className="flex items-center gap-2 cursor-pointer font-sans text-sm text-[#333]">
                          <input 
                            type="radio" 
                            name="priceSort" 
                            value={opt.val} 
                            checked={priceSort === opt.val} 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(e) => setPriceSort(e.target.value as any)} 
                            className="accent-black"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold mb-3">Sort by Rating</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Default", val: "default" },
                        { label: "High to Low", val: "desc" },
                        { label: "Low to High", val: "asc" },
                      ].map((opt) => (
                        <label key={opt.val} className="flex items-center gap-2 cursor-pointer font-sans text-sm text-[#333]">
                          <input 
                            type="radio" 
                            name="ratingSort" 
                            value={opt.val} 
                            checked={ratingSort === opt.val} 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(e) => setRatingSort(e.target.value as any)} 
                            className="accent-black"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between items-end mb-3">
                      <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold">Price Range</p>
                      <p className="font-mono text-xs text-[#111] font-semibold">₹{priceRange[0]} - ₹{priceRange[1]}</p>
                    </div>
                    <div className="px-2">
                      <Slider
                        range
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        value={priceRange}
                        onChange={(val) => setPriceRange(val as [number, number])}
                        styles={{
                          track: { backgroundColor: 'black', height: 4 },
                          rail: { backgroundColor: '#e5e5e5', height: 4 },
                          handle: { borderColor: 'black', backgroundColor: 'white', opacity: 1, border: 'solid 2px black', height: 16, width: 16, marginTop: -6 }
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsSortOpen(false)}
                    className="w-full mt-4 font-sans text-sm font-semibold bg-[#f5f5f5] text-[#333] hover:bg-[#e0e0e0] py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Table — white card */}
        <div className="hidden md:block bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_90px_130px_140px_160px_120px] gap-3 py-2.5 px-5 bg-[#f8f8f8] border-b border-[#ebebeb]">
            {["Seller", "Asset", "Price / unit", "Available", "Payment", ""].map((h) => (
              <span key={h} className="font-sans text-xs text-[#999] tracking-widest uppercase font-semibold">{h}</span>
            ))}
          </div>

          {filtered.map((order) => (
            <div key={order.id} className="grid grid-cols-[1fr_90px_130px_140px_160px_120px] gap-3 items-center py-3 px-5 border-b border-[#f2f2f2] hover:bg-[#fafafa] transition-colors last:border-b-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {!isGuest && order.sellerAvatar
                  ? <Image src={order.sellerAvatar} alt={`${order.sellerName}'s avatar`} width={28} height={28} className="rounded-full shrink-0" />
                  : <div className="w-7 h-7 rounded-full bg-[#e5e5e5] shrink-0" />}
                <div className="min-w-0">
                  <p className={`font-sans text-sm text-[#111] truncate font-medium ${isGuest ? "blur-sm select-none" : ""}`}>
                    {order.sellerName}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.sellerAvgRating !== null && order.sellerRatingCount > 0 ? (
                      <span className="font-sans text-xs text-[#888]">
                        ★ {order.sellerAvgRating.toFixed(1)}
                        <span className="text-[#bbb] ml-0.5">({order.sellerRatingCount})</span>
                      </span>
                    ) : (
                      <span className="font-sans text-xs text-[#bbb]">New</span>
                    )}
                    {fmtRelease(order.sellerAvgReleaseSecs) && (
                      <span className="font-sans text-xs text-[#bbb]">· {fmtRelease(order.sellerAvgReleaseSecs)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-sm font-semibold text-[#111]">{order.asset}</span>
                {CHAIN_BADGE[order.chain] && (
                  <span className="font-sans text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full w-fit"
                    style={{ color: CHAIN_BADGE[order.chain].color, background: CHAIN_BADGE[order.chain].bg }}>
                    {CHAIN_BADGE[order.chain].label}
                  </span>
                )}
              </div>
              <span className="font-mono text-sm text-[#111]">₹{parseFloat(order.pricePerUnit).toFixed(2)}</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-sm text-[#111]">
                  {parseFloat(order.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {order.asset}
                </span>
                {order.partialAllowed && order.minTradeSize && (
                  <span className="font-sans text-[0.6rem] text-[#888]">
                    Min: {parseFloat(order.minTradeSize).toFixed(2)} {order.asset}
                  </span>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {order.acceptedPaymentMethods.map((m) => (
                  <span key={m} className="font-sans text-xs bg-[#f2f2f2] text-[#666] px-2 py-0.5 rounded-full">{m}</span>
                ))}
              </div>
              <div className="flex flex-col items-start gap-1">
                {isGuest ? (
                  <Link href="/login"
                    className="font-sans text-sm font-semibold text-white bg-black py-1.5 px-4 rounded-lg text-center no-underline hover:bg-[#333] transition-colors">
                    Sign In
                  </Link>
                ) : order.isMine ? (
                  <Link href={`/marketplace/${order.id}`}
                    className="font-sans text-sm font-semibold text-[#7b3fe4] border border-[#ddd4fe] bg-[#f5f0ff] py-1.5 px-3 rounded-lg text-center no-underline hover:bg-[#ede9fe] transition-colors">
                    Yours <ArrowRight className="inline-block w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setPendingOrder(order)}
                    className="font-sans text-sm font-semibold text-white bg-black py-1.5 px-4 rounded-lg cursor-pointer hover:bg-[#333] transition-colors border-0">
                    Buy
                  </button>
                )}
                {order.escrowTxHash && (
                  <a href={txUrl(order.escrowTxHash)} target="_blank" rel="noopener noreferrer"
                    className="font-sans text-xs text-[#999] underline hover:text-[#7b3fe4] transition-colors">
                    view on chain
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {filtered.map((order) => (
            <Link key={order.id} href={`/marketplace/${order.id}`}
              className="bg-white border border-[#e8e8e8] rounded-xl p-4 no-underline block">
              <div className="flex items-center gap-2 mb-3">
                {!isGuest && order.sellerAvatar
                  ? <Image src={order.sellerAvatar} alt={`${order.sellerName}'s avatar`} width={26} height={26} className="rounded-full shrink-0" />
                  : <div className="w-[26px] h-[26px] rounded-full bg-[#e5e5e5] shrink-0" />}
                <div>
                  <p className={`font-sans text-sm text-[#111] font-medium ${isGuest ? "blur-sm select-none" : ""}`}>
                    {order.sellerName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {order.sellerAvgRating !== null && order.sellerRatingCount > 0 ? (
                      <span className="font-sans text-xs text-[#888]">★ {order.sellerAvgRating.toFixed(1)} ({order.sellerRatingCount})</span>
                    ) : (
                      <span className="font-sans text-xs text-[#bbb]">New</span>
                    )}
                    {fmtRelease(order.sellerAvgReleaseSecs) && (
                      <span className="font-sans text-xs text-[#bbb]">· {fmtRelease(order.sellerAvgReleaseSecs)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-sans text-base font-semibold text-[#111]">
                      {parseFloat(order.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {order.asset}
                    </p>
                    {CHAIN_BADGE[order.chain] && (
                      <span className="font-sans text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ color: CHAIN_BADGE[order.chain].color, background: CHAIN_BADGE[order.chain].bg }}>
                        {CHAIN_BADGE[order.chain].label}
                      </span>
                    )}
                  </div>
                  {order.partialAllowed && order.minTradeSize && (
                    <p className="font-sans text-xs text-[#aaa]">
                      Min: {parseFloat(order.minTradeSize).toFixed(2)} {order.asset}
                    </p>
                  )}
                  <p className="font-mono text-sm text-[#888]">₹{parseFloat(order.pricePerUnit).toFixed(2)} / unit</p>
                </div>
                {isGuest ? (
                  <Link href="/login"
                    className="font-sans text-sm font-semibold text-white bg-black py-1.5 px-4 rounded-lg no-underline hover:bg-[#333] transition-colors">
                    Sign In
                  </Link>
                ) : order.isMine ? (
                  <span className="font-sans text-sm font-semibold py-1.5 px-4 rounded-lg text-[#7b3fe4] border border-[#ddd4fe] bg-[#f5f0ff]">
                    Yours <ArrowRight className="inline-block w-4 h-4 ml-1" />
                  </span>
                ) : (
                  <button
                    onClick={(e) => { e.preventDefault(); setPendingOrder(order); }}
                    className="font-sans text-sm font-semibold text-white bg-black py-1.5 px-4 rounded-lg cursor-pointer hover:bg-[#333] transition-colors border-0">
                    Buy
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="text-5xl mb-4">—</div>
            <h3 className="font-condensed text-[1.6rem] tracking-[0.5px] mb-2">No listings yet</h3>
            <p className="font-sans text-sm text-[#888] max-w-xs mx-auto mb-6 leading-relaxed">
              {myOrders.length > 0
                ? "Your listing is live. No other sellers have posted yet."
                : "Be the first to post a sell order."}
            </p>
            {isVerified ? (
              <Link href="/marketplace/sell" className="py-2.5 px-6 bg-black text-white rounded-[10px] font-condensed text-lg tracking-[1px] no-underline hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow duration-300">
                Post First Order <ArrowRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            ) : (
              <Link href="/onboarding" className="py-2.5 px-6 bg-lime text-black rounded-[10px] font-condensed text-lg tracking-[1px] no-underline hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-shadow duration-300">
                Get Verified <ArrowRight className="inline-block w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        )}
        {/* How It Works Cards */}
        <div className="mt-12 mb-8">
          <h3 className="font-condensed text-[1.6rem] tracking-[0.5px] mb-4 uppercase text-[#111]">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative overflow-hidden bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col gap-3 min-h-[220px] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:bg-[#111] hover:shadow-[0_12px_30px_-10px_rgba(212,255,0,0.25),0_0_20px_-5px_rgba(212,255,0,0.15)]">
              <span className="absolute bottom-1 right-3 font-condensed text-[5.5rem] leading-none text-white/[0.03] select-none pointer-events-none transition-colors duration-200 group-hover:text-lime/10">
                01
              </span>
              <span className="font-sans text-xs text-lime tracking-widest uppercase font-semibold">
                01
              </span>
              <h4 className="font-condensed text-[1.25rem] text-white uppercase tracking-[0.5px] leading-tight">
                Create Order
              </h4>
              <p className="font-sans text-sm text-white/60 leading-[1.65] flex-1 pr-12">
                Seller posts an order and locks their crypto securely in our on-chain smart contract escrow.
              </p>
              <div className="mt-1">
                <span className="font-sans text-[0.65rem] tracking-widest uppercase bg-lime/[0.08] text-lime/80 border border-lime/[0.18] px-3 py-1.5 rounded-full">
                  SMART CONTRACT
                </span>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col gap-3 min-h-[220px] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:bg-[#111] hover:shadow-[0_12px_30px_-10px_rgba(212,255,0,0.25),0_0_20px_-5px_rgba(212,255,0,0.15)]">
              <span className="absolute bottom-1 right-3 font-condensed text-[5.5rem] leading-none text-white/[0.03] select-none pointer-events-none transition-colors duration-200 group-hover:text-lime/10">
                02
              </span>
              <span className="font-sans text-xs text-lime tracking-widest uppercase font-semibold">
                02
              </span>
              <h4 className="font-condensed text-[1.25rem] text-white uppercase tracking-[0.5px] leading-tight">
                Lock Trade
              </h4>
              <p className="font-sans text-sm text-white/60 leading-[1.65] flex-1 pr-12">
                A verified buyer finds the order, agrees to the price, and locks the trade to secure the crypto.
              </p>
              <div className="mt-1">
                <span className="font-sans text-[0.65rem] tracking-widest uppercase bg-lime/[0.08] text-lime/80 border border-lime/[0.18] px-3 py-1.5 rounded-full">
                  TRADE LOCK
                </span>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col gap-3 min-h-[220px] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:bg-[#111] hover:shadow-[0_12px_30px_-10px_rgba(212,255,0,0.25),0_0_20px_-5px_rgba(212,255,0,0.15)]">
              <span className="absolute bottom-1 right-3 font-condensed text-[5.5rem] leading-none text-white/[0.03] select-none pointer-events-none transition-colors duration-200 group-hover:text-lime/10">
                03
              </span>
              <span className="font-sans text-xs text-lime tracking-widest uppercase font-semibold">
                03
              </span>
              <h4 className="font-condensed text-[1.25rem] text-white uppercase tracking-[0.5px] leading-tight">
                Make Payment
              </h4>
              <p className="font-sans text-sm text-white/60 leading-[1.65] flex-1 pr-12">
                Buyer transfers INR directly to the seller's verified bank account using UPI or IMPS.
              </p>
              <div className="mt-1">
                <span className="font-sans text-[0.65rem] tracking-widest uppercase bg-lime/[0.08] text-lime/80 border border-lime/[0.18] px-3 py-1.5 rounded-full">
                  P2P TRANSFER
                </span>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col gap-3 min-h-[220px] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:bg-[#111] hover:shadow-[0_12px_30px_-10px_rgba(212,255,0,0.25),0_0_20px_-5px_rgba(212,255,0,0.15)]">
              <span className="absolute bottom-1 right-3 font-condensed text-[5.5rem] leading-none text-white/[0.03] select-none pointer-events-none transition-colors duration-200 group-hover:text-lime/10">
                04
              </span>
              <span className="font-sans text-xs text-lime tracking-widest uppercase font-semibold">
                04
              </span>
              <h4 className="font-condensed text-[1.25rem] text-white uppercase tracking-[0.5px] leading-tight">
                Crypto Released
              </h4>
              <p className="font-sans text-sm text-white/60 leading-[1.65] flex-1 pr-12">
                Seller confirms the payment receipt. The smart contract automatically releases the crypto to the buyer.
              </p>
              <div className="mt-1">
                <span className="font-sans text-[0.65rem] tracking-widest uppercase bg-lime/[0.08] text-lime/80 border border-lime/[0.18] px-3 py-1.5 rounded-full">
                  AUTO RELEASE
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white pt-12 pb-8 px-5 md:px-10 border-t border-[#222] mt-auto">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-condensed text-2xl tracking-[1px] mb-4">CRYPTOBAZAAR</h2>
            <p className="font-sans text-sm text-[#aaa] max-w-sm leading-relaxed">
              The premier P2P crypto marketplace. Secure, fast, and reliable trading with built-in escrow protection and identity verification.
            </p>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold mb-4 text-[#ddd]">Platform</h4>
            <ul className="flex flex-col gap-2 list-none p-0">
              <li><Link href="/marketplace" className="font-sans text-sm text-[#888] hover:text-white transition-colors no-underline">Marketplace</Link></li>
              <li><Link href="/marketplace/sell" className="font-sans text-sm text-[#888] hover:text-white transition-colors no-underline">Post an Order</Link></li>
              <li><Link href="/dashboard" className="font-sans text-sm text-[#888] hover:text-white transition-colors no-underline">My Dashboard</Link></li>
              <li><Link href="/onboarding" className="font-sans text-sm text-[#888] hover:text-white transition-colors no-underline">Get Verified</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold mb-4 text-[#ddd]">Resources</h4>
            <ul className="flex flex-col gap-2 list-none p-0">
              <li><Link href="/articles" className="font-sans text-sm text-[#888] hover:text-white transition-colors no-underline">All Articles</Link></li>
              <li><Link href="/articles/common-p2p-scams" className="font-sans text-sm text-[#888] hover:text-white transition-colors no-underline">Avoid P2P Scams</Link></li>
              <li><Link href="/terms" className="font-sans text-sm text-[#888] hover:text-white transition-colors no-underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto border-t border-[#333] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-[#666]">
            © {new Date().getFullYear()} CryptoBazaar. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="font-sans text-xs text-[#666]">Secure Escrow</span>
            <span className="font-sans text-xs text-[#666]">100% Verified Users</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
