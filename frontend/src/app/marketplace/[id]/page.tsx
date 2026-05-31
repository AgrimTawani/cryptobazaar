"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useActiveAccount, useSendTransaction, useActiveWalletConnectionStatus, useConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { getContract, prepareContractCall, defineChain } from "thirdweb";
import Link from "next/link";
import { thirdwebClient } from "@/lib/thirdweb";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
  DISPUTE_RESOLVED_BUYER:  { label: "Resolved - Buyer Won",  color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  DISPUTE_RESOLVED_SELLER: { label: "Resolved - Seller Won", color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  CANCELLED:               { label: "Cancelled",             color: "#555",    bg: "#f5f5f5", border: "#e5e5e5" },
  EXPIRED:                 { label: "Expired",               color: "#555",    bg: "#f5f5f5", border: "#e5e5e5" },
};

const TERMINAL = ["COMPLETED", "CANCELLED", "EXPIRED", "DISPUTE_RESOLVED_BUYER", "DISPUTE_RESOLVED_SELLER"];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface ChatMsg {
  id: string;
  type: "TEXT" | "SYSTEM";
  content: string;
  mine: boolean;
  isRead: boolean;
  senderName: string | null;
  senderAvatar: string | null;
  createdAt: string;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

const CHAT_STATES = ["BUYER_MATCHED", "BUYER_PAID", "COMPLETED", "DISPUTED"];

export default function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const { connect } = useConnect();
  const { mutateAsync: sendTx } = useSendTransaction();

  const reconnectWallet = () => connect(async () => {
    const wallet = createWallet("io.metamask");
    await wallet.connect({ client: thirdwebClient });
    return wallet;
  });

  const [id, setId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Payment proof state
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Resolve params
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // 1-second ticker for countdown
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchOrder = useCallback(async (isInitial = false) => {
    if (!id) return;
    try {
      let res;
      if (isInitial) {
        [res] = await Promise.all([
          fetch(`/api/orders/${id}`),
          new Promise((resolve) => setTimeout(resolve, 1500))
        ]);
      } else {
        res = await fetch(`/api/orders/${id}`);
      }
      const data = await res.json();
      if (res.ok) setOrder(data);
    } catch {
      // transient - keep trying
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder(true);
    const interval = setInterval(() => fetchOrder(false), 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // Chat polling — 3s when chat is open
  const fetchChat = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}/chat`);
      if (res.ok) {
        const data: ChatMsg[] = await res.json();
        setMessages(data);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch { /* transient */ }
  }, [id]);

  useEffect(() => {
    if (!order || !CHAT_STATES.includes(order.status)) return;
    fetchChat();
    const t = setInterval(fetchChat, 3000);
    return () => clearInterval(t);
  }, [fetchChat, order?.status]);

  const sendMessage = async () => {
    if (!chatInput.trim() || sendingMsg || !id) return;
    setSendingMsg(true);
    try {
      await fetch(`/api/orders/${id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatInput.trim() }),
      });
      setChatInput("");
      await fetchChat();
    } finally {
      setSendingMsg(false);
    }
  };

  const uploadScreenshot = async (file: File) => {
    if (!id) return;
    setScreenshotUploading(true);
    setScreenshotFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/orders/${id}/payment-proof`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      setScreenshotUploaded(true);
    } catch {
      setError("Screenshot upload failed. Please try again.");
    } finally {
      setScreenshotUploading(false);
    }
  };

  const fetchProofUrl = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/orders/${id}/payment-proof`);
    if (res.ok) {
      const data = await res.json();
      setProofUrl(data.url ?? null);
    }
  }, [id]);

  // Fetch proof URL when order enters BUYER_PAID
  useEffect(() => {
    if (order?.status === "BUYER_PAID") fetchProofUrl();
  }, [order?.status, fetchProofUrl]);

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
    return <LoadingSpinner />;
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
  // Wallet is ready to sign: non-EVM chain never needs it; EVM needs fully connected + account
  const walletOk = !isEvm || (connectionStatus === "connected" && !!account);

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

      <div className={`mx-auto py-10 px-6 ${CHAT_STATES.includes(order.status) ? "max-w-[1100px]" : "max-w-[600px]"}`}>
        <div className={CHAT_STATES.includes(order.status) ? "grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start" : ""}><div>

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

        {/* Reconnecting banner — ThirdWeb auto-connect in progress */}
        {isEvm && connectionStatus === "connecting" && !TERMINAL.includes(order.status) && (
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-[#0369a1] border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="font-sans text-[0.82rem] text-[#0369a1]">Reconnecting wallet…</p>
          </div>
        )}
        {/* MetaMask nudge — fully disconnected and action required */}
        {isEvm && !walletOk && connectionStatus !== "connecting" && (
          order.status === "LISTED" ||
          order.status === "BUYER_MATCHED" ||
          order.status === "BUYER_PAID"
        ) && (
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base shrink-0">🦊</span>
              <p className="font-sans text-[0.82rem] text-[#92400e]">Wallet disconnected.</p>
            </div>
            <button
              onClick={reconnectWallet}
              className="font-sans text-[0.78rem] font-semibold text-white bg-[#92400e] px-3 py-1.5 rounded-lg cursor-pointer shrink-0 hover:bg-[#78350f] transition-colors"
            >
              Reconnect →
            </button>
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
                  disabled={!!busy || !walletOk}
                  className="font-sans text-[0.82rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-[8px] cursor-pointer disabled:opacity-40"
                >
                  {busy === "cancel" ? "Cancelling…" : "Cancel Order"}
                </button>
              </div>
            ) : showBuyConfirm ? (
              /* Buyer confirmation card */
              <div className="space-y-4 pt-2">
                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[10px] px-4 py-3">
                  <p className="font-sans text-[0.8rem] font-semibold text-[#92400e] mb-1">⚠ 30-minute payment window</p>
                  <p className="font-sans text-[0.78rem] text-[#92400e] leading-[1.5]">
                    The timer starts the moment you lock this order. You must send ₹{parseFloat(order.totalValueInr).toLocaleString("en-IN")} and submit proof within 30 minutes or the order is cancelled.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Amount", `${order.amount} ${order.asset}`],
                    ["Price", `₹${parseFloat(order.pricePerUnit).toFixed(2)} / ${order.asset}`],
                    ["You pay", `₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`],
                    ["Via", order.acceptedPaymentMethods.join(", ")],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#f8f8f8] rounded-[8px] px-3 py-2">
                      <p className="font-sans text-[0.65rem] text-[#999] uppercase tracking-[1px]">{k}</p>
                      <p className="font-sans text-[0.82rem] font-semibold text-[#111]">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBuyConfirm(false)}
                    className="flex-1 py-3 border-[1.5px] border-[#e5e5e5] rounded-[10px] font-sans text-[0.85rem] text-[#555] cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => run("lock", async () => {
                      await sendTx(prepareContractCall({
                        contract: escrowContract,
                        method: "function lockOrder(uint256 id)",
                        params: [onChainId],
                      }));
                    })}
                    disabled={!!busy || !walletOk}
                    className="flex-1 py-3 bg-black text-white rounded-[10px] font-condensed text-[1.1rem] tracking-[0.5px] cursor-pointer disabled:opacity-40"
                  >
                    {busy === "lock" ? "Locking…" : "Lock Order & Start Timer →"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowBuyConfirm(true)}
                disabled={!!busy || !walletOk}
                className="w-full py-4 bg-black text-white rounded-[12px] font-condensed text-[1.2rem] tracking-[1px] cursor-pointer disabled:opacity-40"
              >
                {`Buy → Pay ₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`}
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

                {/* Screenshot upload */}
                <div>
                  <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-1.5">
                    Payment Screenshot
                  </label>
                  <div
                    onClick={() => !screenshotUploaded && !screenshotUploading && screenshotInputRef.current?.click()}
                    className={`border-[1.5px] border-dashed rounded-xl py-4 px-4 text-center transition-colors ${
                      screenshotUploaded ? "border-lime bg-lime/4 cursor-default" : "border-[#ddd] bg-[#fafafa] cursor-pointer hover:border-[#999]"
                    }`}
                  >
                    {screenshotUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#7b3fe4] border-t-transparent rounded-full animate-spin" />
                        <span className="font-sans text-[0.78rem] text-[#7b3fe4]">Uploading…</span>
                      </div>
                    ) : screenshotUploaded ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🖼️</span>
                          <span className="font-sans text-[0.78rem] font-semibold text-[#111]">{screenshotFileName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[0.72rem] text-[#166534] font-semibold">✓ Uploaded</span>
                          <button onClick={(e) => { e.stopPropagation(); setScreenshotUploaded(false); setScreenshotFileName(null); if (screenshotInputRef.current) screenshotInputRef.current.value = ""; }}
                            className="font-sans text-[0.68rem] text-[#999] underline bg-transparent border-0 cursor-pointer">Replace</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-sans text-[0.78rem] font-semibold text-[#333]">Upload payment screenshot</p>
                        <p className="font-sans text-[0.68rem] text-[#aaa]">PNG, JPG or WebP · max 5MB</p>
                      </>
                    )}
                  </div>
                  <input ref={screenshotInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadScreenshot(f); }} />
                </div>

                <div>
                  <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-1.5">
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
                  disabled={!!busy || !walletOk || !utrInput.trim() || !screenshotUploaded}
                  className="w-full py-4 bg-black text-white rounded-xl font-condensed text-[1.2rem] tracking-[1px] cursor-pointer disabled:opacity-40"
                >
                  {busy === "markPaid" ? "Submitting…" : "I've Paid — Submit Proof →"}
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
                    disabled={!!busy || !walletOk}
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

            {proofUrl && (
              <div>
                <p className="font-sans text-[0.7rem] text-[#999] uppercase tracking-[1px] mb-2">Payment Screenshot</p>
                <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                  <img src={proofUrl} alt="Payment screenshot" className="max-h-48 rounded-lg border border-[#e5e5e5] object-contain cursor-pointer hover:opacity-90 transition-opacity" />
                </a>
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
                  disabled={!!busy || !walletOk}
                  className="flex-1 py-4 bg-black text-white rounded-[12px] font-condensed text-[1.1rem] tracking-[1px] cursor-pointer disabled:opacity-40"
                >
                  {busy === "confirm" ? "Confirming…" : "Payment Received ✓"}
                </button>
                <button
                  onClick={() => run("dispute", async () => {
                    await sendTx(prepareContractCall({
                      contract: escrowContract,
                      method: "function raiseDispute(uint256 id)",
                      params: [onChainId],
                    }));
                  })}
                  disabled={!!busy || !walletOk}
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
                disabled={!!busy || !walletOk}
                className="font-sans text-[0.82rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-[8px] cursor-pointer disabled:opacity-40"
              >
                {busy === "dispute" ? "Raising dispute…" : "⚡ Raise Dispute"}
              </button>
            )}
          </div>
        )}

        {/* ── COMPLETED ─────────────────────────────────────── */}
        {order.status === "COMPLETED" && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded-2xl p-6 mb-6 space-y-3">
            <div className="text-center">
              <p className="font-condensed text-[2rem] text-[#166534]">Trade Complete ✓</p>
              <p className="font-sans text-[0.82rem] text-[#15803d] mt-1">
                {role === "buyer"
                  ? `You received ${payout.toFixed(4)} ${order.asset} in your wallet.`
                  : `Buyer received ${payout.toFixed(4)} ${order.asset}. Fee: ${fee.toFixed(4)} ${order.asset} (0.75%)`}
              </p>
            </div>
            {order.escrowTxHash && (
              <div className="border-t border-[#86efac] pt-3">
                <p className="font-sans text-[0.65rem] text-[#15803d] uppercase tracking-[1px] mb-1">On-chain transaction</p>
                <a href={txUrl(order.escrowTxHash)} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-[0.72rem] text-[#15803d] underline break-all">
                  {order.escrowTxHash.slice(0, 18)}…{order.escrowTxHash.slice(-10)} ↗
                </a>
              </div>
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
        </div>{/* end left column */}

        {/* ── CHAT PANEL ─────────────────────────────────────── */}
        {CHAT_STATES.includes(order.status) && (role === "seller" || role === "buyer") && (
          <div className="bg-white border border-[#e5e5e5] rounded-2xl flex flex-col h-[600px] lg:sticky lg:top-20">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] shrink-0">
              <span className="font-condensed text-[1rem] tracking-[0.5px]">Trade Chat</span>
              {timeLeft !== null && !TERMINAL.includes(order.status) && (
                <span className={`font-mono text-[0.82rem] font-bold ${timedOut ? "text-[#dc2626]" : "text-[#1e40af]"}`}>
                  ⏱ {timedOut ? "00:00" : formatTime(timeLeft)}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <p className="font-sans text-[0.78rem] text-[#bbb] text-center mt-8">No messages yet.</p>
              )}
              {messages.map((msg) => {
                if (msg.type === "SYSTEM") {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="font-sans text-[0.7rem] text-[#999] italic bg-[#f5f5f5] px-3 py-1 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  );
                }
                const isMe = msg.mine;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.senderAvatar
                      ? <img src={msg.senderAvatar} className="w-7 h-7 rounded-full shrink-0 mt-1" alt="" />
                      : <div className="w-7 h-7 rounded-full bg-[#e5e5e5] shrink-0 mt-1" />}
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-[2px]`}>
                      <span className="font-sans text-[0.65rem] text-[#999]">{msg.senderName ?? "Unknown"}</span>
                      <div className={`font-sans text-[0.82rem] px-3 py-2 rounded-2xl leading-snug ${
                        isMe ? "bg-black text-white rounded-tr-none" : "bg-[#f0f0f0] text-[#111] rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="font-sans text-[0.6rem] text-[#bbb]">{fmtTime(msg.createdAt)}</span>
                        {isMe && (
                          <span className={`text-[0.65rem] font-bold ${msg.isRead ? "text-[#7b3fe4]" : "text-[#ccc]"}`}>
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            {!TERMINAL.includes(order.status) && (
              <div className="border-t border-[#f0f0f0] px-3 py-3 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 font-sans text-[0.85rem] border border-[#e5e5e5] rounded-lg px-3 py-2 outline-none focus:border-[#7b3fe4] transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMsg || !chatInput.trim()}
                  className="font-sans text-[0.82rem] font-semibold bg-black text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-40"
                >
                  {sendingMsg ? "…" : "Send"}
                </button>
              </div>
            )}
          </div>
        )}
        </div>{/* end grid */}
      </div>
    </div>
  );
}
