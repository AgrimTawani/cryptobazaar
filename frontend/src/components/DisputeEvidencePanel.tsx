"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface DisputeMsg {
  id: string;
  fromAdmin: boolean;
  content: string;
  fileUrl: string | null;
  createdAt: string;
}

interface DisputeData {
  disputeId: string;
  status: string;
  evidenceDeadline: string | null;
  myStatement: string | null;
  myEvidenceSubmittedAt: string | null;
  messages: DisputeMsg[];
}

export function DisputeEvidencePanel({ orderId }: { orderId: string }) {
  const [data, setData] = useState<DisputeData | null>(null);
  const [loading, setLoading] = useState(true);

  // evidence submission
  const [statement, setStatement] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const evidenceFileRef = useRef<HTMLInputElement>(null);

  // admin message reply
  const [replyContent, setReplyContent] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/dispute`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [orderId]);

  const submitEvidence = async () => {
    if (!statement.trim()) { setSubmitError("Please write a statement."); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.append("statement", statement.trim());
      if (file) form.append("file", file);
      const res = await fetch(`/api/orders/${orderId}/dispute`, { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Submission failed");
      await load();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim()) return;
    setSendingReply(true);
    setReplyError(null);
    try {
      const form = new FormData();
      form.append("content", replyContent.trim());
      if (replyFile) form.append("file", replyFile);
      const res = await fetch(`/api/orders/${orderId}/dispute-message`, { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to send");
      setReplyContent("");
      setReplyFile(null);
      await load();
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return (
    <div className="border-t border-[#fca5a5] px-5 py-4 shrink-0 bg-[#fef2f2]">
      <p className="font-sans text-sm text-[#dc2626]">Loading dispute details…</p>
    </div>
  );

  const alreadySubmitted = !!data?.myEvidenceSubmittedAt;
  const adminMessages = data?.messages.filter((m) => m.fromAdmin) ?? [];
  const myReplies = data?.messages.filter((m) => !m.fromAdmin) ?? [];
  const allMessages = data?.messages ?? [];

  return (
    <div className="border-t border-[#fca5a5] bg-[#fef2f2] shrink-0">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-[#fca5a5]/40">
        <p className="font-condensed text-xl text-[#991b1b]">Dispute Raised</p>
        <p className="font-sans text-xs text-[#dc2626] mt-0.5">
          Admin will review and resolve within 24 hours. Submit your statement and evidence below.
        </p>
        {data?.evidenceDeadline && (
          <p className="font-sans text-xs text-[#b91c1c] font-semibold mt-1">
            Evidence deadline: {new Date(data.evidenceDeadline).toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* Evidence submission */}
      <div className="px-5 py-4 border-b border-[#fca5a5]/40">
        {alreadySubmitted ? (
          <div className="flex items-center gap-2 bg-white border border-[#86efac] rounded-lg px-4 py-3">
            <span className="text-[#16a34a]">✓</span>
            <div>
              <p className="font-sans text-sm font-semibold text-[#166534]">Statement submitted</p>
              <p className="font-sans text-xs text-[#aaa]">
                {new Date(data!.myEvidenceSubmittedAt!).toLocaleString("en-IN")}
              </p>
              {data?.myStatement && (
                <p className="font-sans text-xs text-[#555] mt-1 italic">&ldquo;{data.myStatement}&rdquo;</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold">Your Statement</p>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Describe what happened from your perspective. Be specific about dates, amounts, and any communication you had…"
              rows={4}
              className="w-full font-sans text-sm border border-[#fca5a5] bg-white rounded-xl px-4 py-2.5 outline-none focus:border-[#dc2626] transition-colors resize-none"
            />

            {/* File upload */}
            <div
              onClick={() => evidenceFileRef.current?.click()}
              className={`border-[1.5px] border-dashed rounded-lg py-3 px-4 text-center cursor-pointer transition-colors ${
                file ? "border-[#16a34a] bg-[#f0fdf4]" : "border-[#fca5a5] bg-white hover:border-[#dc2626]"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-[#111]">📎 {file.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (evidenceFileRef.current) evidenceFileRef.current.value = ""; }}
                    className="font-sans text-xs text-[#999] underline bg-transparent border-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <p className="font-sans text-sm font-semibold text-[#555]">Upload supporting evidence (optional)</p>
                  <p className="font-sans text-xs text-[#aaa]">Bank statement, screenshot, PDF · max 10MB</p>
                </>
              )}
            </div>
            <input
              ref={evidenceFileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
            />

            {submitError && <p className="font-sans text-xs text-[#dc2626]">{submitError}</p>}

            <button
              onClick={submitEvidence}
              disabled={submitting || !statement.trim()}
              className="w-full py-3 font-sans text-sm font-bold bg-[#991b1b] text-white rounded-xl cursor-pointer disabled:opacity-40 transition-opacity"
            >
              {submitting ? "Submitting…" : "Submit Statement & Evidence"}
            </button>
          </div>
        )}
      </div>

      {/* Admin requests + reply thread */}
      {(adminMessages.length > 0 || allMessages.length > 0) && (
        <div className="px-5 py-4 space-y-3">
          <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold">Admin Requests</p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allMessages.map((m) => (
              <div key={m.id} className={`rounded-lg px-3 py-2.5 ${
                m.fromAdmin
                  ? "bg-white border border-[#fca5a5]"
                  : "bg-[#f9f9f9] border border-[#e5e5e5] ml-4"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-xs font-semibold text-[#555]">
                    {m.fromAdmin ? "Admin" : "You replied"}
                  </span>
                  <span className="font-sans text-[0.6rem] text-[#bbb]">
                    {new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="font-sans text-sm text-[#333] whitespace-pre-wrap">{m.content}</p>
                {m.fileUrl && (
                  <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="font-sans text-xs text-[#7b3fe4] underline mt-1 block">
                    📎 View attachment ↗
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Reply box — only show if admin has asked something */}
          {adminMessages.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#fca5a5]/30">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Reply to admin request…"
                rows={2}
                className="w-full font-sans text-sm border border-[#fca5a5] bg-white rounded-xl px-4 py-2.5 outline-none focus:border-[#dc2626] transition-colors resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => replyFileRef.current?.click()}
                  className="font-sans text-xs text-[#555] border border-[#e5e5e5] bg-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#f5f5f5]"
                >
                  {replyFile ? `📎 ${replyFile.name}` : "Attach file"}
                </button>
                <input
                  ref={replyFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setReplyFile(f); }}
                />
                <button
                  onClick={sendReply}
                  disabled={sendingReply || !replyContent.trim()}
                  className="flex items-center gap-1.5 font-sans text-sm font-semibold bg-[#991b1b] text-white px-4 py-1.5 rounded-lg cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingReply ? "Sending…" : "Send"}
                </button>
              </div>
              {replyError && <p className="font-sans text-xs text-[#dc2626]">{replyError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
