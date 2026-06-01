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
const CHAT_STATES = ["BUYER_MATCHED", "BUYER_PAID", "COMPLETED", "DISPUTED"];

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

// Vertical trade step indicator
function TradeSteps({ status }: { status: string }) {
  const steps = [
    { label: "Listed",        done: true },
    { label: "Escrowed",      done: ["BUYER_MATCHED", "BUYER_PAID", "COMPLETED", "DISPUTED"].includes(status) },
    { label: "Payment Sent",  done: ["BUYER_PAID", "COMPLETED"].includes(status) },
    { label: "Released",      done: status === "COMPLETED" },
  ];

  const activeIdx = steps.findLastIndex((s) => s.done);

  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const isDone = step.done;
        const isActive = i === activeIdx + 1 || (activeIdx === steps.length - 1 && i === steps.length - 1);
        const isLast = i === steps.length - 1;
        return (
          <div key={step.label} className="flex gap-3 items-start">
            <div className="flex flex-col items-center">
              <div
                className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.55rem] font-bold shrink-0 ${
                  isDone
                    ? "bg-lime text-black"
                    : isActive
                    ? "bg-black text-lime"
                    : "bg-[#f0f0f0] text-[#bbb] border border-[#e0e0e0]"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              {!isLast && (
                <div className={`w-px flex-1 min-h-[20px] my-[2px] ${isDone ? "bg-lime" : "bg-[#e5e5e5]"}`} />
              )}
            </div>
            <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
              <p className={`font-sans text-[0.76rem] font-semibold leading-[22px] ${isDone || isActive ? "text-[#111]" : "text-[#bbb]"}`}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchOrder = useCallback(async (isInitial = false) => {
    if (!id) return;
    try {
      let res;
      if (isInitial) {
        [res] = await Promise.all([fetch(`/api/orders/${id}`), new Promise((r) => setTimeout(r, 1500))]);
      } else {
        res = await fetch(`/api/orders/${id}`);
      }
      const data = await res.json();
      if (res.ok) setOrder(data);
    } catch { /* transient */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    fetchOrder(true);
    const interval = setInterval(() => fetchOrder(false), 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

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
    } finally { setSendingMsg(false); }
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
    } finally { setScreenshotUploading(false); }
  };

  const fetchProofUrl = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/orders/${id}/payment-proof`);
    if (res.ok) {
      const data = await res.json();
      setProofUrl(data.url ?? null);
    }
  }, [id]);

  useEffect(() => {
    if (order?.status === "BUYER_PAID") fetchProofUrl();
  }, [order?.status, fetchProofUrl]);

  const run = async (dbAction: string, contractFn?: () => Promise<void>) => {
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
    } finally { setBusy(null); }
  };

  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center gap-3">
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
  const walletOk = !isEvm || (connectionStatus === "connected" && !!account);

  const inChat = CHAT_STATES.includes(order.status);
  const counterpartyName = role === "buyer" ? order.sellerName : order.buyerName;
  const counterpartyAvatar = role === "buyer" ? order.sellerAvatar : order.buyerAvatar;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-white border-b border-[#ebebeb] px-5 md:px-10 h-[52px] flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-condensed text-[1.05rem] tracking-[3px] text-black no-underline">
          CRYPTOBAZAAR
        </Link>
        <Link href="/marketplace" className="font-sans text-[0.78rem] text-[#888] no-underline">
          ← Marketplace
        </Link>
      </header>

      {/* ── CHAT LAYOUT (3 cols) ─────────────────────────── */}
      {inChat && (
        <div className="max-w-[1120px] mx-auto py-3 px-4 md:px-5">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-3 items-start">

            {/* ── LEFT: Steps panel + order details ── */}
            <div className="flex flex-col gap-3">

              {/* Trade steps */}
              <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
                <p className="font-sans text-[0.6rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-3">
                  Trade Steps
                </p>
                <TradeSteps status={order.status} />
              </div>

              {/* Order details */}
              <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
                <p className="font-sans text-[0.6rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-3">
                  Order Details
                </p>
                <div className="flex flex-col gap-[5px]">
                  {[
                    ["Asset",   `${order.asset} · ${order.chain}`],
                    ["Amount",  `${order.amount} ${order.asset}`],
                    ["Price",   `₹${parseFloat(order.pricePerUnit).toFixed(2)}/u`],
                    ["Total",   `₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`],
                    ["Fee",     `${fee.toFixed(4)} (0.75%)`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-baseline">
                      <span className="font-sans text-[0.68rem] text-[#aaa]">{k}</span>
                      <span className="font-sans text-[0.75rem] font-semibold text-[#111] text-right">{v}</span>
                    </div>
                  ))}
                </div>
                {order.escrowTxHash && (
                  <a
                    href={txUrl(order.escrowTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[0.63rem] text-[#7b3fe4] no-underline hover:underline mt-3 block"
                  >
                    ✓ View escrow on-chain ↗
                  </a>
                )}
              </div>

              {/* Status chip */}
              <div
                className="rounded-[8px] px-3 py-2"
                style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}
              >
                <span className="font-sans text-[0.75rem] font-semibold" style={{ color: statusCfg.color }}>
                  {statusCfg.label}
                </span>
              </div>

            </div>

            {/* ── MIDDLE: Chat panel (dominant) ── */}
            <div className="bg-white border border-[#e8e8e8] rounded-xl flex flex-col lg:sticky lg:top-[64px]" style={{ height: "calc(100vh - 80px)", maxHeight: "720px" }}>

              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-[10px] border-b border-[#ebebeb] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  <span className="font-sans text-[0.78rem] font-semibold text-[#111]">Trade Chat</span>
                </div>
                <div className="flex items-center gap-3">
                  {timeLeft !== null && !TERMINAL.includes(order.status) && (
                    <span className={`font-mono text-[0.8rem] font-bold ${timedOut ? "text-[#dc2626]" : "text-[#1e40af]"}`}>
                      ⏱ {timedOut ? "00:00" : formatTime(timeLeft)}
                    </span>
                  )}
                  <span className="font-sans text-[0.62rem] text-[#bbb]">#{order.orderId}</span>
                </div>
              </div>

              {/* Wallet banners */}
              {isEvm && connectionStatus === "connecting" && !TERMINAL.includes(order.status) && (
                <div className="mx-3 mt-3 bg-[#f0f9ff] border border-[#bae6fd] rounded-lg px-3 py-2 flex items-center gap-2 shrink-0">
                  <span className="w-3 h-3 border-2 border-[#0369a1] border-t-transparent rounded-full animate-spin shrink-0" />
                  <p className="font-sans text-[0.78rem] text-[#0369a1]">Reconnecting wallet…</p>
                </div>
              )}
              {isEvm && !walletOk && connectionStatus !== "connecting" && (
                ["BUYER_MATCHED", "BUYER_PAID"].includes(order.status)
              ) && (
                <div className="mx-3 mt-3 bg-[#fffbeb] border border-[#fde68a] rounded-lg px-3 py-2 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm shrink-0">🦊</span>
                    <p className="font-sans text-[0.78rem] text-[#92400e]">Wallet disconnected.</p>
                  </div>
                  <button
                    onClick={reconnectWallet}
                    className="font-sans text-[0.74rem] font-semibold text-white bg-[#92400e] px-3 py-1 rounded-lg cursor-pointer shrink-0"
                  >
                    Reconnect →
                  </button>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#fafafa]">
                {messages.length === 0 && (
                  <p className="font-sans text-[0.76rem] text-[#bbb] text-center mt-8">No messages yet.</p>
                )}
                {messages.map((msg) => {
                  if (msg.type === "SYSTEM") {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="font-sans text-[0.68rem] text-[#888] bg-[#efefef] px-3 py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }
                  const isMe = msg.mine;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {msg.senderAvatar
                        ? <img src={msg.senderAvatar} className="w-6 h-6 rounded-full shrink-0 mt-1" alt="" />
                        : <div className="w-6 h-6 rounded-full bg-[#e5e5e5] shrink-0 mt-1" />}
                      <div className={`max-w-[75%] flex flex-col gap-[2px] ${isMe ? "items-end" : "items-start"}`}>
                        <span className="font-sans text-[0.62rem] text-[#999] font-semibold uppercase tracking-[0.3px]">
                          {msg.senderName ?? "Unknown"}
                        </span>
                        <div className={`font-sans text-[0.8rem] px-3 py-[7px] rounded-xl leading-snug ${
                          isMe
                            ? "bg-black text-white rounded-tr-sm"
                            : "bg-white border border-[#e8e8e8] text-[#111] rounded-tl-sm"
                        }`}>
                          {msg.content}
                        </div>
                        <div className={`flex items-center gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="font-sans text-[0.58rem] text-[#bbb]">{fmtTime(msg.createdAt)}</span>
                          {isMe && (
                            <span className={`text-[0.62rem] font-bold ${msg.isRead ? "text-[#7b3fe4]" : "text-[#ccc]"}`}>
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

              {/* Chat input */}
              {!TERMINAL.includes(order.status) && (
                <div className="border-t border-[#ebebeb] px-3 py-2 flex gap-2 shrink-0 bg-white">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message…"
                    className="flex-1 font-sans text-[0.82rem] border border-[#e5e5e5] bg-[#fafafa] rounded-lg px-3 py-[7px] outline-none focus:border-[#7b3fe4] transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMsg || !chatInput.trim()}
                    className="font-sans text-[0.78rem] font-semibold bg-black text-white px-4 py-[7px] rounded-lg cursor-pointer disabled:opacity-40"
                  >
                    {sendingMsg ? "…" : "Send"}
                  </button>
                </div>
              )}

              {/* ── Action footer (inside chat panel, AeroP2P style) ── */}
              {order.status === "BUYER_MATCHED" && role === "buyer" && (
                <div className="border-t border-[#ebebeb] px-4 py-4 shrink-0 bg-[#fafafa]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-sans text-[0.84rem] font-semibold text-[#111]">Awaiting Your Payment</p>
                      <p className="font-sans text-[0.72rem] text-[#999] mt-[2px]">
                        Complete transfer before timer expires to avoid cancellation.
                      </p>
                    </div>
                    {timeLeft !== null && (
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-sans text-[0.58rem] text-[#aaa] uppercase tracking-[1px] mb-[1px]">Expires in</p>
                        <p className="font-mono text-[1.15rem] font-bold leading-none" style={{ color: timedOut ? "#dc2626" : "#ef4444" }}>
                          {timedOut ? "00:00" : formatTime(timeLeft)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Screenshot */}
                  <div className="mb-2">
                    <div
                      onClick={() => !screenshotUploaded && !screenshotUploading && screenshotInputRef.current?.click()}
                      className={`border-[1.5px] border-dashed rounded-lg py-3 px-3 text-center transition-colors ${
                        screenshotUploaded
                          ? "border-lime cursor-default"
                          : "border-[#ddd] bg-white cursor-pointer hover:border-[#999]"
                      }`}
                    >
                      {screenshotUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-3 h-3 border-2 border-[#7b3fe4] border-t-transparent rounded-full animate-spin" />
                          <span className="font-sans text-[0.76rem] text-[#7b3fe4]">Uploading…</span>
                        </div>
                      ) : screenshotUploaded ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>🖼️</span>
                            <span className="font-sans text-[0.76rem] font-semibold text-[#111]">{screenshotFileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-[0.7rem] text-[#166534] font-semibold">✓ Uploaded</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setScreenshotUploaded(false);
                                setScreenshotFileName(null);
                                if (screenshotInputRef.current) screenshotInputRef.current.value = "";
                              }}
                              className="font-sans text-[0.66rem] text-[#999] underline bg-transparent border-0 cursor-pointer"
                            >
                              Replace
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-sans text-[0.76rem] font-semibold text-[#333]">Upload payment screenshot</p>
                          <p className="font-sans text-[0.66rem] text-[#aaa]">PNG, JPG or WebP · max 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={screenshotInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadScreenshot(f); }}
                    />
                  </div>

                  {/* UTR */}
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    placeholder="UTR / Reference number (e.g. NEFT2025…)"
                    className="w-full border border-[#e5e5e5] bg-white rounded-lg px-3 py-2 font-mono text-[0.82rem] focus:outline-none focus:border-[#7b3fe4] transition-colors mb-2"
                  />

                  {error && (
                    <p className="font-sans text-[0.76rem] text-[#dc2626] mb-2">{error}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => run("markPaid", async () => {
                        await sendTx(prepareContractCall({
                          contract: escrowContract,
                          method: "function markPaid(uint256 id)",
                          params: [onChainId],
                        }));
                      })}
                      disabled={!!busy || !walletOk || !utrInput.trim() || !screenshotUploaded}
                      className="py-[10px] bg-lime text-black font-sans font-bold text-[0.85rem] rounded-lg cursor-pointer disabled:opacity-40 transition-opacity"
                    >
                      {busy === "markPaid" ? "Submitting…" : "✓  I Have Paid"}
                    </button>
                    <button
                      onClick={() => run("cancel", async () => {
                        await sendTx(prepareContractCall({
                          contract: escrowContract,
                          method: "function cancelOrder(uint256 id)",
                          params: [onChainId],
                        }));
                      })}
                      disabled={!!busy || !walletOk}
                      className="py-[10px] bg-white text-[#666] border border-[#e0e0e0] font-sans text-[0.85rem] font-semibold rounded-lg cursor-pointer disabled:opacity-40"
                    >
                      {busy === "cancel" ? "…" : "✕  Cancel Order"}
                    </button>
                  </div>
                </div>
              )}

              {order.status === "BUYER_MATCHED" && role === "seller" && (
                <div className="border-t border-[#ebebeb] px-4 py-4 shrink-0 bg-[#fafafa]">
                  <p className="font-sans text-[0.82rem] text-[#555] mb-2">
                    Buyer <strong className="text-[#111]">{order.buyerName ?? "Anonymous"}</strong> has locked this order.
                    Waiting for them to send payment.
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
                      className="font-sans text-[0.8rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-lg cursor-pointer disabled:opacity-40"
                    >
                      {busy === "timeout" ? "Cancelling…" : "Reclaim (Timeout)"}
                    </button>
                  )}
                  {error && <p className="font-sans text-[0.76rem] text-[#dc2626] mt-2">{error}</p>}
                </div>
              )}

              {order.status === "BUYER_PAID" && (
                <div className="border-t border-[#ebebeb] px-4 py-4 shrink-0 bg-[#fffbeb]">
                  <p className="font-sans text-[0.8rem] font-semibold text-[#92400e] mb-3">
                    {role === "seller"
                      ? "Buyer has marked payment as sent. Verify in your account before confirming."
                      : "Payment submitted. Waiting for seller to confirm release."}
                  </p>

                  {order.utr && (
                    <div className="bg-white border border-[#fde68a] rounded-lg px-3 py-2 mb-3">
                      <p className="font-sans text-[0.66rem] text-[#aaa] mb-[2px]">UTR / Reference</p>
                      <p className="font-mono text-[0.85rem] font-semibold text-[#111]">{order.utr}</p>
                    </div>
                  )}

                  {proofUrl && (
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="block mb-3">
                      <img src={proofUrl} alt="Payment screenshot" className="max-h-40 rounded-lg border border-[#fde68a] object-contain cursor-pointer hover:opacity-90 transition-opacity" />
                    </a>
                  )}

                  {error && <p className="font-sans text-[0.76rem] text-[#dc2626] mb-2">{error}</p>}

                  {role === "seller" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => run("confirm", async () => {
                          await sendTx(prepareContractCall({
                            contract: escrowContract,
                            method: "function confirmPayment(uint256 id)",
                            params: [onChainId],
                          }));
                        })}
                        disabled={!!busy || !walletOk}
                        className="flex-1 py-[10px] bg-black text-white rounded-lg font-sans font-bold text-[0.85rem] cursor-pointer disabled:opacity-40"
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
                        className="px-4 py-[10px] border border-[#fca5a5] text-[#dc2626] bg-[#fff1f2] rounded-lg font-sans text-[0.82rem] font-semibold cursor-pointer disabled:opacity-40"
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
                      className="font-sans text-[0.8rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-lg cursor-pointer disabled:opacity-40"
                    >
                      {busy === "dispute" ? "Raising dispute…" : "⚡ Raise Dispute"}
                    </button>
                  )}
                </div>
              )}

              {order.status === "COMPLETED" && (
                <div className="border-t border-[#86efac] px-4 py-4 shrink-0 bg-[#f0fdf4]">
                  <p className="font-condensed text-[1.4rem] text-[#166534] mb-1">Trade Complete ✓</p>
                  <p className="font-sans text-[0.8rem] text-[#15803d]">
                    {role === "buyer"
                      ? `You received ${payout.toFixed(4)} ${order.asset}.`
                      : `Buyer received ${payout.toFixed(4)} ${order.asset}. Fee: ${fee.toFixed(4)} (0.75%)`}
                  </p>
                </div>
              )}

              {order.status === "DISPUTED" && (
                <div className="border-t border-[#fca5a5] px-4 py-4 shrink-0 bg-[#fef2f2]">
                  <p className="font-condensed text-[1.3rem] text-[#991b1b] mb-1">Dispute Raised</p>
                  <p className="font-sans text-[0.8rem] text-[#dc2626]">
                    Admin will review and resolve within 24 hours.
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT: Trade summary sidebar ── */}
            <div className="flex flex-col gap-3">

              {/* Trade summary */}
              <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
                <p className="font-sans text-[0.6rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-3">
                  Trade Summary
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-sans text-[0.73rem] text-[#888]">
                      {role === "buyer" ? "Buying" : "Selling"}
                    </span>
                    <div className="text-right">
                      <p className="font-condensed text-[1.1rem] tracking-[0.5px] leading-none">{order.amount} {order.asset}</p>
                      <p className="font-sans text-[0.64rem] text-[#aaa] mt-[2px]">{order.chain} Network</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-sans text-[0.73rem] text-[#888]">
                      {role === "buyer" ? "Paying" : "Receiving"}
                    </span>
                    <div className="text-right">
                      <p className="font-condensed text-[1.1rem] tracking-[0.5px] leading-none">
                        ₹{parseFloat(order.totalValueInr).toLocaleString("en-IN")}
                      </p>
                      <p className="font-sans text-[0.64rem] text-[#aaa] mt-[2px]">Indian Rupee</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#f2f2f2] pt-2">
                    <span className="font-sans text-[0.73rem] text-[#888]">Rate</span>
                    <span className="font-mono text-[0.76rem] font-medium text-[#111]">
                      1 {order.asset} = ₹{parseFloat(order.pricePerUnit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Counterparty */}
              <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
                <p className="font-sans text-[0.6rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-3">
                  Counterparty
                </p>
                <div className="flex items-center gap-3 mb-3">
                  {counterpartyAvatar
                    ? <img src={counterpartyAvatar} className="w-8 h-8 rounded-full shrink-0" alt="" />
                    : <div className="w-8 h-8 rounded-full bg-[#e5e5e5] shrink-0" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-sans text-[0.84rem] font-semibold text-[#111]">
                        {counterpartyName ?? "Anonymous"}
                      </p>
                      <span className="font-sans text-[0.56rem] font-bold bg-lime text-black px-[5px] py-[1px] rounded-[3px]">
                        ✓
                      </span>
                    </div>
                    <p className="font-sans text-[0.69rem] text-[#999]">Verified member</p>
                  </div>
                </div>

                <div className="border-t border-[#f2f2f2] pt-3">
                  <p className="font-sans text-[0.6rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-2">
                    Payment Methods
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {order.acceptedPaymentMethods.map((m) => (
                      <span key={m} className="font-sans text-[0.65rem] bg-[#f2f2f2] text-[#555] px-2 py-[2px] rounded-full">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buyer: seller payment details */}
                {role === "buyer" && order.status === "BUYER_MATCHED" && (order.sellerUpiId || order.sellerBankAccount) && (
                  <div className="border-t border-[#f2f2f2] pt-3 mt-3">
                    <p className="font-sans text-[0.6rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-2">
                      Send Payment To
                    </p>
                    <div className="flex flex-col gap-[6px]">
                      {order.sellerUpiId && (
                        <div>
                          <p className="font-sans text-[0.63rem] text-[#bbb]">UPI ID</p>
                          <p className="font-mono text-[0.8rem] font-semibold text-[#111]">{order.sellerUpiId}</p>
                        </div>
                      )}
                      {order.sellerBankAccount && (
                        <>
                          <div>
                            <p className="font-sans text-[0.63rem] text-[#bbb]">Account Number</p>
                            <p className="font-mono text-[0.8rem] font-semibold text-[#111]">{order.sellerBankAccount}</p>
                          </div>
                          <div>
                            <p className="font-sans text-[0.63rem] text-[#bbb]">IFSC</p>
                            <p className="font-mono text-[0.8rem] font-semibold text-[#111]">{order.sellerIfsc}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Escrow protection */}
              <div className="bg-[#fffef0] border border-[#fde68a] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🔒</span>
                  <p className="font-sans text-[0.73rem] font-bold text-[#92400e]">Escrow Protection</p>
                </div>
                <p className="font-sans text-[0.7rem] text-[#a16207] leading-[1.5]">
                  Funds are held in a verified smart-contract. Never mark paid until you have completed the transfer.
                </p>
                {order.escrowTxHash && (
                  <a
                    href={txUrl(order.escrowTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[0.63rem] text-[#7b3fe4] no-underline hover:underline mt-2 block"
                  >
                    View on Polygonscan ↗
                  </a>
                )}
              </div>

              {/* Dispute */}
              {!TERMINAL.includes(order.status) && (
                <div className="text-center">
                  <a
                    onClick={() => run("dispute", async () => {
                      await sendTx(prepareContractCall({
                        contract: escrowContract,
                        method: "function raiseDispute(uint256 id)",
                        params: [onChainId],
                      }));
                    })}
                    className="font-sans text-[0.7rem] text-[#ef4444] cursor-pointer hover:underline"
                  >
                    Something wrong? Raise a dispute
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SINGLE-COL LAYOUT (LISTED / CANCELLED / EXPIRED) ── */}
      {!inChat && (
        <div className="max-w-[600px] mx-auto py-6 px-5">

          {/* Title */}
          <div className="mb-4">
            <h1 className="font-condensed text-[2rem] tracking-[1px] leading-none mb-1">
              {role === "seller" ? "YOUR LISTING" : `BUY ${order.amount} ${order.asset}`}
            </h1>
            <p className="font-sans text-[0.82rem] text-[#888]">
              ₹{parseFloat(order.pricePerUnit).toFixed(2)} per {order.asset} · Total ₹{parseFloat(order.totalValueInr).toLocaleString("en-IN")}
            </p>
          </div>

          {/* Status banner */}
          <div
            className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
            style={{ background: statusCfg.bg, border: `1.5px solid ${statusCfg.border}` }}
          >
            <span className="font-sans text-[0.8rem] font-semibold" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </span>
            {order.escrowTxHash && (
              <a href={txUrl(order.escrowTxHash)} target="_blank" rel="noopener noreferrer"
                className="font-sans text-[0.7rem] underline" style={{ color: statusCfg.color }}>
                ✓ Escrow on-chain ↗
              </a>
            )}
          </div>

          {/* Wallet reconnect banners */}
          {isEvm && connectionStatus === "connecting" && !TERMINAL.includes(order.status) && (
            <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-[#0369a1] border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="font-sans text-[0.82rem] text-[#0369a1]">Reconnecting wallet…</p>
            </div>
          )}
          {isEvm && !walletOk && connectionStatus !== "connecting" && order.status === "LISTED" && (
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-base shrink-0">🦊</span>
                <p className="font-sans text-[0.82rem] text-[#92400e]">Wallet disconnected.</p>
              </div>
              <button onClick={reconnectWallet}
                className="font-sans text-[0.78rem] font-semibold text-white bg-[#92400e] px-3 py-1.5 rounded-lg cursor-pointer shrink-0">
                Reconnect →
              </button>
            </div>
          )}

          {/* LISTED */}
          {order.status === "LISTED" && (
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-5 mb-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
                {order.sellerAvatar
                  ? <img src={order.sellerAvatar} className="w-9 h-9 rounded-full" alt="" />
                  : <div className="w-9 h-9 rounded-full bg-[#e5e5e5]" />}
                <div>
                  <p className="font-sans text-[0.85rem] font-semibold text-[#111]">{order.sellerName}</p>
                  <p className="font-sans text-[0.72rem] text-[#999]">Verified Seller</p>
                </div>
              </div>

              <div>
                <p className="font-sans text-[0.72rem] text-[#999] uppercase tracking-[1px] mb-2">Accepts</p>
                <div className="flex gap-2 flex-wrap">
                  {order.acceptedPaymentMethods.map((m) => (
                    <span key={m} className="font-sans text-[0.78rem] font-semibold bg-[#f0f0f0] text-[#333] px-3 py-1 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {role === "seller" ? (
                <div className="space-y-3">
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
                    className="font-sans text-[0.82rem] text-[#dc2626] border border-[#fca5a5] bg-[#fff1f2] px-4 py-2 rounded-lg cursor-pointer disabled:opacity-40"
                  >
                    {busy === "cancel" ? "Cancelling…" : "Cancel Order"}
                  </button>
                </div>
              ) : showBuyConfirm ? (
                <div className="space-y-4">
                  <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl px-4 py-3">
                    <p className="font-sans text-[0.8rem] font-semibold text-[#92400e] mb-1">⚠ 30-minute payment window</p>
                    <p className="font-sans text-[0.78rem] text-[#92400e] leading-[1.5]">
                      The timer starts the moment you lock. You must send ₹{parseFloat(order.totalValueInr).toLocaleString("en-IN")} and submit proof within 30 minutes.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Amount", `${order.amount} ${order.asset}`],
                      ["Price", `₹${parseFloat(order.pricePerUnit).toFixed(2)} / ${order.asset}`],
                      ["You pay", `₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`],
                      ["Via", order.acceptedPaymentMethods.join(", ")],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-[#f8f8f8] rounded-lg px-3 py-2">
                        <p className="font-sans text-[0.65rem] text-[#999] uppercase tracking-[1px]">{k}</p>
                        <p className="font-sans text-[0.82rem] font-semibold text-[#111]">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBuyConfirm(false)}
                      className="flex-1 py-3 border-[1.5px] border-[#e5e5e5] rounded-xl font-sans text-[0.85rem] text-[#555] cursor-pointer bg-white"
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
                      className="flex-1 py-3 bg-black text-white rounded-xl font-condensed text-[1.1rem] tracking-[0.5px] cursor-pointer disabled:opacity-40"
                    >
                      {busy === "lock" ? "Locking…" : "Lock Order & Start Timer →"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowBuyConfirm(true)}
                  disabled={!!busy || !walletOk}
                  className="w-full py-4 bg-black text-white rounded-xl font-condensed text-[1.2rem] tracking-[1px] cursor-pointer disabled:opacity-40"
                >
                  {`Buy → Pay ₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`}
                </button>
              )}
            </div>
          )}

          {/* CANCELLED / EXPIRED */}
          {(order.status === "CANCELLED" || order.status === "EXPIRED") && (
            <div className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-2xl p-6 mb-4 text-center space-y-2">
              <p className="font-condensed text-[1.8rem] text-[#555]">
                {order.status === "CANCELLED" ? "Order Cancelled" : "Order Expired"}
              </p>
              <p className="font-sans text-[0.85rem] text-[#888]">Tokens have been returned to the seller.</p>
              <Link href="/marketplace" className="font-sans text-[0.85rem] text-[#7b3fe4] underline block">
                Back to marketplace →
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-xl px-4 py-3 mb-4">
              <p className="font-sans text-sm text-[#dc2626]">{error}</p>
            </div>
          )}

          {/* Order detail strip */}
          <div className="bg-white border border-[#e5e5e5] rounded-xl px-5 py-4 grid grid-cols-2 gap-3">
            {[
              ["Chain", order.chain],
              ["Asset", order.asset],
              ["Amount", `${order.amount} ${order.asset}`],
              ["Price", `₹${parseFloat(order.pricePerUnit).toFixed(2)}`],
              ["Total", `₹${parseFloat(order.totalValueInr).toLocaleString("en-IN")}`],
              ["Fee", `${fee.toFixed(4)} ${order.asset} (0.75%)`],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="font-sans text-[0.65rem] text-[#999] uppercase tracking-[1px]">{k}</p>
                <p className="font-sans text-[0.82rem] font-semibold text-[#111]">{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
