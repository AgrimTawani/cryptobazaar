"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

interface DisputeMsg {
  id: string;
  fromAdmin: boolean;
  toRole: string | null;
  content: string;
  fileUrl: string | null;
  createdAt: string;
  sender: { name: string | null; avatarUrl: string | null } | null;
}

interface ChatMsg {
  id: string;
  type: string;
  content: string;
  sender: { name: string | null } | null;
  createdAt: string;
}

interface DisputeDetail {
  id: string;
  status: string;
  raisedByRole: string;
  evidenceDeadline: string | null;
  adminNotes: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  buyerStatement: string | null;
  sellerStatement: string | null;
  buyerEvidenceSubmittedAt: string | null;
  sellerEvidenceSubmittedAt: string | null;
  paymentScreenshotUrl: string | null;
  buyerEvidenceUrl: string | null;
  sellerEvidenceUrl: string | null;
  messages: DisputeMsg[];
  order: {
    orderId: string;
    id: string;
    amount: string;
    asset: string;
    totalValueInr: string;
    utr: string | null;
    chatRoom: {
      messages: ChatMsg[];
    } | null;
    seller: { name: string | null; email: string | null };
    buyer:  { name: string | null; email: string | null } | null;
  };
  raiser: { name: string | null };
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  OPEN:               { label: "Open",             cls: "bg-[#fef2f2] text-[#991b1b]" },
  EVIDENCE_SUBMITTED: { label: "Evidence In",      cls: "bg-[#fffbeb] text-[#92400e]" },
  UNDER_REVIEW:       { label: "Under Review",     cls: "bg-[#eff6ff] text-[#1e40af]" },
  RESOLVED_BUYER:     { label: "Resolved — Buyer", cls: "bg-[#f0fdf4] text-[#166534]" },
  RESOLVED_SELLER:    { label: "Resolved — Seller",cls: "bg-[#f0fdf4] text-[#166534]" },
};

function ImageOrPdf({ url, label }: { url: string; label: string }) {
  const isPdf = url.includes(".pdf") || url.includes("application/pdf");
  if (isPdf) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-sans text-sm text-[#7b3fe4] underline">
        📄 View {label} PDF ↗
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt={label} className="max-h-48 rounded-lg border border-[#e5e5e5] object-contain hover:opacity-90 transition-opacity cursor-pointer" />
    </a>
  );
}

export default function AdminDisputeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [msgTarget, setMsgTarget] = useState<"buyer" | "seller" | "both">("both");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msgFile, setMsgFile] = useState<File | null>(null);

  const pwd = typeof window !== "undefined" ? sessionStorage.getItem("admin_password") : "";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${pwd ?? ""}` };

  const load = async () => {
    const res = await fetch(`/api/admin/disputes/${id}`, { headers });
    if (res.ok) {
      const data = await res.json();
      setDispute(data);
      setAdminNotes(data.adminNotes ?? "");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    await fetch(`/api/admin/disputes/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ adminNotes }),
    });
    setSavingNotes(false);
  };

  const sendMessage = async () => {
    if (!msgContent.trim()) return;
    setSendingMsg(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${id}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content: msgContent.trim(), toRole: msgTarget === "both" ? null : msgTarget }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setMsgContent("");
      setMsgFile(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSendingMsg(false);
    }
  };

  const resolveDispute = async (action: "SELLER" | "BUYER") => {
    const label = action === "SELLER" ? "seller (refund seller)" : "buyer (release to buyer)";
    if (!confirm(`Resolve in favour of the ${label}?`)) return;
    setResolving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setResolving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="w-6 h-6 border-2 border-[#7b3fe4] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!dispute) return <p className="font-sans text-[#888]">Dispute not found.</p>;

  const isResolved = dispute.status === "RESOLVED_BUYER" || dispute.status === "RESOLVED_SELLER";
  const statusCfg = STATUS_LABELS[dispute.status] ?? STATUS_LABELS.OPEN;
  const chatMsgs = dispute.order.chatRoom?.messages ?? [];

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/disputes" className="font-sans text-sm text-[#888] flex items-center gap-1 mb-2 hover:text-[#555]">
            <ArrowLeft className="w-4 h-4" /> All Disputes
          </Link>
          <h1 className="font-condensed text-3xl uppercase tracking-[1px]">Dispute Resolution</h1>
          <p className="font-sans text-sm text-[#888] mt-0.5">
            Order: <span className="font-mono">{dispute.order.orderId}</span> · Dispute: <span className="font-mono text-xs">{dispute.id}</span>
          </p>
        </div>
        <span className={`font-sans text-sm font-bold px-3 py-1.5 rounded-full self-start ${statusCfg.cls}`}>
          {statusCfg.label}
        </span>
      </div>

      {error && (
        <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-xl px-4 py-3">
          <p className="font-sans text-sm text-[#dc2626]">{error}</p>
        </div>
      )}

      {/* Overview row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Raised By",  `${dispute.raisedByRole} · ${dispute.raiser.name ?? "—"}`],
          ["Amount",     `${dispute.order.amount} ${dispute.order.asset}`],
          ["Value",      `₹${Number(dispute.order.totalValueInr).toLocaleString("en-IN")}`],
          ["UTR",        dispute.order.utr ?? "Not provided"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white border border-[#e8e8e8] rounded-xl px-4 py-3">
            <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-1">{k}</p>
            <p className="font-sans text-sm font-semibold text-[#111] break-all">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">

          {/* Payment screenshot */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
            <h2 className="font-condensed text-lg uppercase tracking-wide mb-3 border-b border-[#f0f0f0] pb-2">
              Payment Screenshot (from buyer)
            </h2>
            {dispute.paymentScreenshotUrl
              ? <ImageOrPdf url={dispute.paymentScreenshotUrl} label="Payment Screenshot" />
              : <p className="font-sans text-sm text-[#aaa]">No screenshot uploaded.</p>
            }
          </div>

          {/* Buyer evidence */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[#f0f0f0] pb-2">
              <h2 className="font-condensed text-lg uppercase tracking-wide">
                Buyer: {dispute.order.buyer?.name ?? "Unknown"}
              </h2>
              {dispute.buyerEvidenceSubmittedAt && (
                <span className="font-sans text-xs text-[#16a34a] font-semibold">
                  ✓ {new Date(dispute.buyerEvidenceSubmittedAt).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-1">Statement</p>
            <p className="font-sans text-sm bg-[#f9f9f9] border border-[#eee] rounded-lg p-3 min-h-[70px] whitespace-pre-wrap mb-3">
              {dispute.buyerStatement || <span className="text-[#bbb]">No statement yet.</span>}
            </p>
            <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-2">Evidence File</p>
            {dispute.buyerEvidenceUrl
              ? <ImageOrPdf url={dispute.buyerEvidenceUrl} label="Buyer Evidence" />
              : <p className="font-sans text-sm text-[#aaa]">No file uploaded.</p>
            }
          </div>

          {/* Seller evidence */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[#f0f0f0] pb-2">
              <h2 className="font-condensed text-lg uppercase tracking-wide">
                Seller: {dispute.order.seller.name ?? "Unknown"}
              </h2>
              {dispute.sellerEvidenceSubmittedAt && (
                <span className="font-sans text-xs text-[#16a34a] font-semibold">
                  ✓ {new Date(dispute.sellerEvidenceSubmittedAt).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-1">Statement</p>
            <p className="font-sans text-sm bg-[#f9f9f9] border border-[#eee] rounded-lg p-3 min-h-[70px] whitespace-pre-wrap mb-3">
              {dispute.sellerStatement || <span className="text-[#bbb]">No statement yet.</span>}
            </p>
            <p className="font-sans text-xs text-[#999] uppercase tracking-widest mb-2">Evidence File</p>
            {dispute.sellerEvidenceUrl
              ? <ImageOrPdf url={dispute.sellerEvidenceUrl} label="Seller Evidence" />
              : <p className="font-sans text-sm text-[#aaa]">No file uploaded.</p>
            }
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* Trade chat transcript */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
            <h2 className="font-condensed text-lg uppercase tracking-wide mb-3 border-b border-[#f0f0f0] pb-2">
              Trade Chat Transcript
            </h2>
            {chatMsgs.length === 0
              ? <p className="font-sans text-sm text-[#aaa]">No messages.</p>
              : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {chatMsgs.map((m) => (
                    <div key={m.id} className={`flex gap-2 ${m.type === "SYSTEM" ? "justify-center" : ""}`}>
                      {m.type === "SYSTEM"
                        ? <span className="font-sans text-xs text-[#888] bg-[#f0f0f0] px-3 py-1 rounded-full">{m.content}</span>
                        : (
                          <div>
                            <span className="font-sans text-[0.65rem] text-[#999] font-semibold uppercase tracking-wide mr-1">
                              {m.sender?.name ?? "Unknown"}
                            </span>
                            <span className="font-sans text-[0.65rem] text-[#bbb]">
                              {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <p className="font-sans text-sm text-[#333]">{m.content}</p>
                          </div>
                        )
                      }
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Admin ↔ party message thread */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
            <h2 className="font-condensed text-lg uppercase tracking-wide mb-3 border-b border-[#f0f0f0] pb-2">
              Evidence Requests
            </h2>

            {/* Thread */}
            <div className="space-y-3 max-h-56 overflow-y-auto mb-4 pr-1">
              {dispute.messages.length === 0
                ? <p className="font-sans text-sm text-[#aaa]">No messages yet.</p>
                : dispute.messages.map((m) => (
                  <div key={m.id} className={`rounded-lg px-3 py-2.5 ${m.fromAdmin ? "bg-[#eff6ff] border border-[#bfdbfe]" : "bg-[#f9f9f9] border border-[#e8e8e8]"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-xs font-semibold text-[#555]">
                        {m.fromAdmin ? `Admin → ${m.toRole ?? "Both parties"}` : `${m.sender?.name ?? "Party"} replied`}
                      </span>
                      <span className="font-sans text-[0.6rem] text-[#bbb]">
                        {new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-[#333] whitespace-pre-wrap">{m.content}</p>
                    {m.fileUrl && (
                      <div className="mt-2">
                        <ImageOrPdf url={m.fileUrl} label="Attachment" />
                      </div>
                    )}
                  </div>
                ))
              }
            </div>

            {/* Compose */}
            {!isResolved && (
              <div className="border-t border-[#f0f0f0] pt-4 space-y-3">
                <div className="flex gap-2">
                  {(["both", "buyer", "seller"] as const).map((t) => (
                    <button key={t} onClick={() => setMsgTarget(t)}
                      className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        msgTarget === t ? "bg-black text-white border-black" : "bg-white text-[#555] border-[#e5e5e5]"
                      }`}>
                      {t === "both" ? "Both parties" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <textarea
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Request additional evidence or information…"
                  rows={3}
                  className="w-full font-sans text-sm border border-[#e5e5e5] bg-[#fafafa] rounded-xl px-4 py-2.5 outline-none focus:border-[#7b3fe4] transition-colors resize-none"
                />
                <button onClick={sendMessage} disabled={sendingMsg || !msgContent.trim()}
                  className="flex items-center gap-2 font-sans text-sm font-semibold bg-[#7b3fe4] text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-40 transition-opacity">
                  <Send className="w-4 h-4" />
                  {sendingMsg ? "Sending…" : "Send Request"}
                </button>
              </div>
            )}
          </div>

          {/* Admin notes */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
            <h2 className="font-condensed text-lg uppercase tracking-wide mb-3 border-b border-[#f0f0f0] pb-2">
              Admin Notes (internal)
            </h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes — not visible to parties…"
              rows={4}
              className="w-full font-sans text-sm border border-[#e5e5e5] bg-[#fafafa] rounded-xl px-4 py-2.5 outline-none focus:border-[#7b3fe4] transition-colors resize-none mb-3"
            />
            <button onClick={saveNotes} disabled={savingNotes}
              className="font-sans text-sm font-semibold bg-black text-white px-4 py-2 rounded-lg cursor-pointer disabled:opacity-40">
              {savingNotes ? "Saving…" : "Save Notes"}
            </button>
          </div>

          {/* Resolve */}
          {!isResolved && (
            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
              <h2 className="font-condensed text-lg uppercase tracking-wide mb-1 border-b border-[#f0f0f0] pb-2">
                Resolution
              </h2>
              <p className="font-sans text-xs text-[#999] mb-4">
                This calls the smart contract and is irreversible. Make sure all evidence has been reviewed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => resolveDispute("SELLER")} disabled={resolving}
                  className="flex-1 py-3 font-sans text-sm font-semibold border border-[#e5e5e5] text-[#111] bg-white hover:bg-[#f5f5f5] rounded-xl cursor-pointer disabled:opacity-40 transition-colors">
                  Refund Seller
                </button>
                <button onClick={() => resolveDispute("BUYER")} disabled={resolving}
                  className="flex-1 py-3 font-sans text-sm font-bold bg-black text-white rounded-xl cursor-pointer disabled:opacity-40 hover:bg-[#333] transition-colors">
                  Release to Buyer
                </button>
              </div>
              {resolving && <p className="font-sans text-xs text-[#888] mt-2 text-center">Resolving… calling smart contract</p>}
            </div>
          )}

          {isResolved && (
            <div className="bg-[#f0fdf4] border border-[#86efac] rounded-xl p-5">
              <p className="font-condensed text-xl text-[#166534] mb-1">Resolved ✓</p>
              <p className="font-sans text-sm text-[#15803d]">{dispute.resolution}</p>
              {dispute.resolvedAt && (
                <p className="font-sans text-xs text-[#aaa] mt-1">
                  {new Date(dispute.resolvedAt).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" />
    </div>
  );
}
