"use client";

import { useCallback, useEffect, useState } from "react";
import { useActiveAccount, useSendTransaction, ConnectButton } from "thirdweb/react";
import { getContract, prepareContractCall, defineChain } from "thirdweb";
import Link from "next/link";
import { thirdwebClient } from "@/lib/thirdweb";
import { txUrl } from "@/lib/explorer";

const amoyChain = defineChain(80002);
const ESCROW_ADDR = (process.env.NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS ?? "") as `0x${string}`;
const escrowContract = getContract({ client: thirdwebClient, chain: amoyChain, address: ESCROW_ADDR });

interface OrderDetail {
  id: string;
  orderId: string;
  onChainId: string;
  sellerName: string;
  sellerAvatar: string | null;
  buyerName: string | null;
  buyerAvatar: string | null;
  asset: string;
  chain: string;
  amount: string;
  pricePerUnit: string;
  totalValueInr: string;
  acceptedPaymentMethods: string[];
  status: string;
  escrowTxHash: string | null;
  utr: string | null;
  buyerMatchedAt: string | null;
  paymentWindowExpiresAt: string | null;
  completedAt: string | null;
  viewerRole: "seller" | "buyer" | "observer";
  sellerUpiId: string | null;
  sellerBankAccount: string | null;
  sellerIfsc: string | null;
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  LISTED:                  { label: "Open",                  color: "#555",    bg: "#f5f5f5", border: "#e5e5e5" },
  BUYER_MATCHED:           { label: "Payment Pending",       color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
  BUYER_PAID:              { label: "Awaiting Confirmation", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  COMPLETED:               { label: "Completed ✓",           color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  DISPUTED:                { label: "Disputed",              color: "#991b1b", bg: "#fef2f2", border: "#fca5a5" },
  DISPUTE_RESOLVED_BUYER:  { label: "Resolved — Buyer Won",  color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  DISPUTE_RESOLVED_SELLER: { label: "Resolved — Seller Won", color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  CANCELLED:               { label: "Cancelled",             color: "#555",    bg: "#f5f5f5", border: "#e5e5e5" },
  EXPIRED:                 { label: "Expired",               color: "#555",    bg: "#f5f5f5", border: "#e5e5e5" },
};

const TERMINAL = ["COMPLETED", "CANCELLED", "EXPIRED", "DISPUTE_RESOLVED_BUYER", "DISPUTE_RESOLVED_SELLER"];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  const [id, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Resolve params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // 1-second ticker for countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (res.ok) setOrder(data);
    } catch {
      // transient — keep trying
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const run = async (
    dbAction: string,
    contractFn?: () => Promise<void>
  ) => {
    setBusy(dbAction);
    setError(null);
    try {
      if (contractFn) await contractFn();
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: dbAction, utr: utrInput || undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Action failed");
      }
      await fetchOrder();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-3">
        <p className="font-sans text-[#666]">Order not found.</p>
        <Link href="/marketplace" className="font-sans text-sm text-[#7b3fe4] underline">← Back to marketplace</Link>
      </div>
    );
  }

  const statusCfg = STATUS[order.status] ?? STATUS.LISTED;
  const onChainId = BigInt(order.onChainId);
  const amount = parseFloat(order.amount);
  const fee = (amount * 75) / 10000;
  const payout = amount - fee;

  const timeLeft = order.paymentWindowExpiresAt
    ? Math.max(0, Math.floor((new Date(order.paymentWindowExpiresAt).getTime() - now) / 1000))
    : null;
  const timedOut = timeLeft !== null && timeLeft === 0;

  const { viewerRole: role } = order;
  const isEvm = order.chain === "POLYGON" || order.chain === "BSC";

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-[#f0f0f0] px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-condensed text-base tracking-[3px] text-black no-underline">
          CRYPTOBAZAAR
        </Link>
        <Link href="/marketplace" className="font-sans text-[0.82rem] text-[#888] no-underline">
          ← Marketplace
        </Link>
      </header>

      <div className="max-w-[600px] mx-auto py-10 px-6">

        {/* Title */}
        <div className="mb-6">
          <h1 className="font-condensed text-[2.2rem] tracking-[1px] leading-none mb-1">
            {role === "seller" ? "YOUR LISTING" : `BUY ${order.amount} ${order.asset}`}
          </h1>
          <p className="font-sans text-[0.85rem] text-[#888]">
            ₹{parseFloat(order.pricePerUnit).toFixed(2)} per {order.asset} · Total ₹{parseFloat(order.totalValueInr).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Status banner */}
        <div
          className="rounded-[12px] px-4 py-3 mb-6 flex items-center justify-between"
          style={{ background: statusCfg.bg, border: `1.5px solid ${statusCfg.border}` }}
        >
          <span className="font-sans text-[0.8rem] font-semibold" style={{ color: statusCfg.color }}>
            {statusCfg.label}
          </span>
          {order.escrowTxHash && (
            <a
              href={txUrl(order.escrowTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[0.7rem] underline"
              style={{ color: statusCfg.color }}
            >
              ✓ Escrow on-chain ↗
            </a>
          )}
        </div>

        {/* Wallet connect prompt for EVM chains */}
        {isEvm && !account && !TERMINAL.includes(order.status) && (
          <div className="bg-[#f5f0ff] border border-[#c4b5fd] rounded-[14px] p-5 mb-6">
            <p className="font-sans text-sm text-[#5b21b6] mb-3">Connect your wallet to interact with this order.</p>
            <ConnectButton client={thirdwebClient} />
          </div>
        )}

        {/* ── LISTED ───────────────────────────────────────── */}
        {order.status === "LISTED" && (
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6 mb-6 space-y-4">
            {/* Seller info */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
              {order.sellerAvatar
                ? <img src={order.sellerAvatar} className="w-9 h-9 rounded-full" alt="" />
                : <div className="w-9 h-9 rounded-full bg-[#e5e5e5]" />}
              <div>
                <p className="font-sans text-[0.85rem] font-semibold text-[#111]">{order.sellerName}</p>
                <p className="font-sans text-[0.72rem] text-[#999]">Verified Seller</p>
              </div>
            </div>

            {/* Payment methods */}
            <div>
              <p className="font-sans text-[0.72rem] text-[#999] uppercase tracking-[1px] mb-2">Accepts</p>
              <div className="flex gap-2">
                {order.acceptedPaymentMethods.map((m) => (
                  <span key={m} className="font-sans text-[0.78rem] font-semibold bg-[#f0f0f0] text-[#333] px-3 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            {role === "seller" ? (
              <div className="pt-2 space-y-3">
                <p className="font-sans text-[0.85rem] text-[#666]">Waiting for a buyer to lock this order.</p>
                <button
                  onClick={() => run("cancel", async () => {
                    await sendTx(prepareContractCall({
                      contract: escrowContract,
                      method: "function cancelOrder(uint256 id)",
                      params: [onChainId],
                    }));
                  })}
                  disabled={!!busy}
                  className="font-sans text-[0.82rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-[8px] cursor-pointer disabled:opacity-40"
                >
                  {busy === "cancel" ? "Cancelling…" : "Cancel Order"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => run("lock", async () => {
                  await sendTx(prepareContractCall({
                    contract: escrowContract,
                    method: "function lockOrder(uint256 id)",
                    params: [onChainId],
                  }));
                })}
                disabled={!!busy || (!account && isEvm)}
                className="w-full py-4 bg-black text-white rounded-[12px] font-condensed text-[1.2rem] tracking-[1px] cursor-pointer disabled:opacity-40"
              >
                {busy === "lock" ? "Locking…" : `Lock Order → Pay ₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`}
              </button>
            )}
          </div>
        )}

        {/* ── BUYER_MATCHED ─────────────────────────────────── */}
        {order.status === "BUYER_MATCHED" && (
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6 mb-6 space-y-5">
            {/* Timer */}
            {timeLeft !== null && (
              <div className={`flex items-center justify-between rounded-[10px] px-4 py-3 ${timedOut ? "bg-[#fef2f2] border border-[#fca5a5]" : "bg-[#eff6ff] border border-[#bfdbfe]"}`}>
                <span className="font-sans text-[0.8rem] font-semibold" style={{ color: timedOut ? "#dc2626" : "#1e40af" }}>
                  {timedOut ? "Payment window expired" : "Payment window"}
                </span>
                <span className="font-mono text-[1rem] font-bold" style={{ color: timedOut ? "#dc2626" : "#1e40af" }}>
                  {timedOut ? "00:00" : formatTime(timeLeft)}
                </span>
              </div>
            )}

            {role === "buyer" && (
              <>
                <div>
                  <p className="font-sans text-[0.72rem] text-[#999] uppercase tracking-[1px] mb-3">
                    Send ₹{parseFloat(order.totalValueInr).toLocaleString("en-IN")} via
                  </p>

                  {order.sellerUpiId && (
                    <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[10px] px-4 py-3 mb-3">
                      <p className="font-sans text-[0.7rem] text-[#999] mb-1">UPI ID</p>
                      <p className="font-mono text-[0.9rem] font-semibold text-[#111]">{order.sellerUpiId}</p>
                    </div>
                  )}

                  {order.sellerBankAccount && (
                    <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[10px] px-4 py-3 space-y-2">
                      <div>
                        <p className="font-sans text-[0.7rem] text-[#999]">Account Number</p>
                        <p className="font-mono text-[0.9rem] font-semibold text-[#111]">{order.sellerBankAccount}</p>
                      </div>
                      <div>
                        <p className="font-sans text-[0.7rem] text-[#999]">IFSC Code</p>
                        <p className="font-mono text-[0.9rem] font-semibold text-[#111]">{order.sellerIfsc}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-[6px]">
                    UTR / Reference Number
                  </label>
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="e.g. NEFT2025051200123"
                    className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-[10px] px-4 py-3 font-mono text-[0.9rem] focus:outline-none focus:border-[#7b3fe4] transition-colors"
                  />
                </div>

                <button
                  onClick={() => run("markPaid", async () => {
                    await sendTx(prepareContractCall({
                      contract: escrowContract,
                      method: "function markPaid(uint256 id)",
                      params: [onChainId],
                    }));
                  })}
                  disabled={!!busy || !utrInput.trim()}
                  className="w-full py-4 bg-black text-white rounded-[12px] font-condensed text-[1.2rem] tracking-[1px] cursor-pointer disabled:opacity-40"
                >
                  {busy === "markPaid" ? "Submitting…" : "I've Paid →"}
                </button>
              </>
            )}

            {role === "seller" && (
              <div className="space-y-3">
                <p className="font-sans text-[0.85rem] text-[#555]">
                  Buyer <strong>{order.buyerName ?? "Anonymous"}</strong> has locked this order. Waiting for them to send payment.
                </p>
                {timedOut && (
                  <button
                    onClick={() => run("timeout", async () => {
                      await sendTx(prepareContractCall({
                        contract: escrowContract,
                        method: "function timeoutCancel(uint256 id)",
                        params: [onChainId],
                      }));
                    })}
                    disabled={!!busy}
                    className="font-sans text-[0.82rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-[8px] cursor-pointer disabled:opacity-40"
                  >
                    {busy === "timeout" ? "Cancelling…" : "Reclaim (Timeout)"}
                  </button>
                )}
              </div>
            )}

            {role === "observer" && (
              <p className="font-sans text-[0.85rem] text-[#888] text-center">This order is currently locked by a buyer.</p>
            )}
          </div>
        )}

        {/* ── BUYER_PAID ────────────────────────────────────── */}
        {order.status === "BUYER_PAID" && (
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6 mb-6 space-y-5">
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[10px] px-4 py-3">
              <p className="font-sans text-[0.82rem] font-semibold text-[#92400e]">
                {role === "seller" ? "Buyer has marked payment as sent. Check your account before confirming." : "Payment submitted. Waiting for seller to confirm."}
              </p>
            </div>

            {order.utr && (
              <div className="bg-[#f8f8f8] border border-[#e5e5e5] rounded-[10px] px-4 py-3">
                <p className="font-sans text-[0.7rem] text-[#999] mb-1">UTR / Reference</p>
                <p className="font-mono text-[0.9rem] font-semibold text-[#111]">{order.utr}</p>
              </div>
            )}

            {role === "seller" && (
              <div className="flex gap-3">
                <button
                  onClick={() => run("confirm", async () => {
                    await sendTx(prepareContractCall({
                      contract: escrowContract,
                      method: "function confirmPayment(uint256 id)",
                      params: [onChainId],
                    }));
                  })}
                  disabled={!!busy}
                  className="flex-1 py-4 bg-black text-white rounded-[12px] font-condensed text-[1.1rem] tracking-[1px] cursor-pointer disabled:opacity-40"
                >
                  {busy === "confirm" ? "Confirming…" : "✓ Confirm Receipt"}
                </button>
                <button
                  onClick={() => run("dispute", async () => {
                    await sendTx(prepareContractCall({
                      contract: escrowContract,
                      method: "function raiseDispute(uint256 id)",
                      params: [onChainId],
                    }));
                  })}
                  disabled={!!busy}
                  className="px-5 py-4 border-[1.5px] border-[#fca5a5] text-[#dc2626] bg-[#fff1f2] rounded-[12px] font-sans text-[0.85rem] font-semibold cursor-pointer disabled:opacity-40"
                >
                  {busy === "dispute" ? "…" : "⚡ Dispute"}
                </button>
              </div>
            )}

            {role === "buyer" && (
              <button
                onClick={() => run("dispute", async () => {
                  await sendTx(prepareContractCall({
                    contract: escrowContract,
                    method: "function raiseDispute(uint256 id)",
                    params: [onChainId],
                  }));
                })}
                disabled={!!busy}
                className="font-sans text-[0.82rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-[8px] cursor-pointer disabled:opacity-40"
              >
                {busy === "dispute" ? "Raising dispute…" : "⚡ Raise Dispute"}
              </button>
            )}
          </div>
        )}

        {/* ── COMPLETED ─────────────────────────────────────── */}
        {order.status === "COMPLETED" && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded-[16px] p-6 mb-6 text-center space-y-2">
            <p className="font-condensed text-[2rem] text-[#166534]">Trade Complete ✓</p>
            <p className="font-sans text-[0.85rem] text-[#15803d]">
              Buyer received <strong>{payout.toFixed(6)} {order.asset}</strong> · Fee {fee.toFixed(6)} {order.asset} (0.75%)
            </p>
            {order.escrowTxHash && (
              <a href={txUrl(order.escrowTxHash)} target="_blank" rel="noopener noreferrer"
                className="font-sans text-[0.78rem] text-[#15803d] underline block mt-1">
                View escrow transaction ↗
              </a>
            )}
          </div>
        )}

        {/* ── DISPUTED ──────────────────────────────────────── */}
        {order.status === "DISPUTED" && (
          <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-[16px] p-6 mb-6 text-center space-y-2">
            <p className="font-condensed text-[1.8rem] text-[#991b1b]">Dispute Raised</p>
            <p className="font-sans text-[0.85rem] text-[#dc2626]">
              Admin will review and resolve within 24 hours. Do not make any further payments.
            </p>
          </div>
        )}

        {/* ── CANCELLED / EXPIRED ───────────────────────────── */}
        {(order.status === "CANCELLED" || order.status === "EXPIRED") && (
          <div className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-[16px] p-6 mb-6 text-center space-y-2">
            <p className="font-condensed text-[1.8rem] text-[#555]">{order.status === "CANCELLED" ? "Order Cancelled" : "Order Expired"}</p>
            <p className="font-sans text-[0.85rem] text-[#888]">Tokens have been returned to the seller.</p>
            <Link href="/marketplace" className="font-sans text-[0.85rem] text-[#7b3fe4] underline block">
              Back to marketplace →
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-[10px] px-4 py-3 mb-4">
            <p className="font-sans text-sm text-[#dc2626]">{error}</p>
          </div>
        )}

        {/* Order detail strip */}
        <div className="bg-white border border-[#e5e5e5] rounded-[14px] px-5 py-4 grid grid-cols-2 gap-3">
          {[
            ["Chain",    order.chain],
            ["Asset",    order.asset],
            ["Amount",   `${order.amount} ${order.asset}`],
            ["Price",    `₹${parseFloat(order.pricePerUnit).toFixed(2)}`],
            ["Total",    `₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`],
            ["Fee",      `${fee.toFixed(4)} ${order.asset} (0.75%)`],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="font-sans text-[0.65rem] text-[#999] uppercase tracking-[1px]">{k}</p>
              <p className="font-sans text-[0.82rem] font-semibold text-[#111]">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
