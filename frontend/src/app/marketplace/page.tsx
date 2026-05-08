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
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Top bar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: "var(--condensed)", fontSize: "1rem", letterSpacing: "3px", color: "#000", textDecoration: "none" }}>
          CRYPTOBAZAAR
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/" style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "#888", textDecoration: "none" }}>Home</Link>
          <span style={{ color: "#ddd" }}>·</span>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", padding: "5px 14px 5px 5px", border: "1.5px solid #e0e0e0", borderRadius: "999px", background: "#fff" }}>
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="" width={24} height={24} style={{ borderRadius: "50%" }} />
            )}
            <span style={{ fontFamily: "var(--sans)", fontSize: "0.8rem", fontWeight: 500, color: "#111" }}>
              {user?.firstName ?? "Dashboard"}
            </span>
          </Link>
        </div>
      </header>

      {/* Verification banner */}
      {!isVerified && (
        <div style={{ background: "#000", padding: "12px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
            👀 <strong style={{ color: "#fff" }}>View only.</strong> Complete your verification to buy or sell.
          </p>
          <Link href="/onboarding" style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", fontWeight: 600, color: "#000", background: "#D4FF00", padding: "6px 16px", borderRadius: "999px", textDecoration: "none" }}>
            Complete Verification →
          </Link>
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--condensed)", fontSize: "2.4rem", letterSpacing: "1px", lineHeight: 1, marginBottom: "6px" }}>
              LIVE LISTINGS
            </h1>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", color: "#888" }}>
              {orders.length} active orders · INR ↔ USDT / USDC
            </p>
          </div>

          {isVerified && (
            <Link
              href="/marketplace/sell"
              style={{ padding: "12px 28px", background: "#000", color: "#fff", borderRadius: "10px", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "1px", textDecoration: "none" }}
            >
              + Post Order
            </Link>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setAssetFilter(f)}
              style={{ padding: "7px 18px", borderRadius: "999px", border: "1.5px solid", borderColor: assetFilter === f ? "#000" : "#e5e5e5", background: assetFilter === f ? "#000" : "#fff", color: assetFilter === f ? "#fff" : "#555", fontFamily: "var(--sans)", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer" }}
            >
              {f}
            </button>
          ))}
          <div style={{ width: "1px", background: "#e5e5e5", margin: "0 4px" }} />
          {CHAINS.map((c) => (
            <button
              key={c}
              onClick={() => setChainFilter(c)}
              style={{ padding: "7px 18px", borderRadius: "999px", border: "1.5px solid", borderColor: chainFilter === c ? "#000" : "#e5e5e5", background: chainFilter === c ? "#000" : "#fff", color: chainFilter === c ? "#fff" : "#555", fontFamily: "var(--sans)", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 140px 140px 100px 140px", gap: "12px", padding: "10px 20px", background: "#f5f5f5", borderRadius: "10px", marginBottom: "8px" }}>
          {["Seller", "Asset", "Price / unit", "Available", "Payment", ""].map((h) => (
            <span key={h} style={{ fontFamily: "var(--sans)", fontSize: "0.68rem", color: "#999", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
            <h3 style={{ fontFamily: "var(--condensed)", fontSize: "1.6rem", letterSpacing: "0.5px", marginBottom: "8px" }}>
              No listings yet
            </h3>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: "#888", maxWidth: "320px", margin: "0 auto 24px", lineHeight: 1.6 }}>
              Be the first to post a sell order. The marketplace opens to verified members only.
            </p>
            {isVerified ? (
              <Link href="/marketplace/sell" style={{ padding: "12px 28px", background: "#000", color: "#fff", borderRadius: "10px", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "1px", textDecoration: "none" }}>
                Post First Order →
              </Link>
            ) : (
              <Link href="/onboarding" style={{ padding: "12px 28px", background: "#D4FF00", color: "#000", borderRadius: "10px", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "1px", textDecoration: "none" }}>
                Get Verified →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
