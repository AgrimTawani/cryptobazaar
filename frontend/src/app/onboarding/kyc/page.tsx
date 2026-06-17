"use client";

import { ArrowLeft, Upload, CheckCircle2, X, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type PollStatus = "IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED";
type DocUploadState = { file: File; uploading: boolean; done: boolean; error: string | null };

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const TODAY = new Date();

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const selected = value ? new Date(value + "T00:00:00") : null;
  const initial = selected ?? new Date(1995, 0, 1);
  const [view, setView] = useState({ month: initial.getMonth(), year: initial.getFullYear() });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", esc); };
  }, [open]);

  const prevMonth = useCallback(() => setView(v => {
    const d = new Date(v.year, v.month - 1, 1);
    return { month: d.getMonth(), year: d.getFullYear() };
  }), []);

  const nextMonth = useCallback(() => setView(v => {
    const d = new Date(v.year, v.month + 1, 1);
    // Don't go past current month
    if (d > TODAY) return v;
    return { month: d.getMonth(), year: d.getFullYear() };
  }), []);

  const canGoNext = new Date(view.year, view.month + 1, 1) <= TODAY;

  // Build calendar grid
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const selectDay = (day: number) => {
    const d = new Date(view.year, view.month, day);
    if (d > TODAY) return;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected &&
    selected.getDate() === day &&
    selected.getMonth() === view.month &&
    selected.getFullYear() === view.year;

  const isToday = (day: number) =>
    TODAY.getDate() === day &&
    TODAY.getMonth() === view.month &&
    TODAY.getFullYear() === view.year;

  const isFuture = (day: number) => new Date(view.year, view.month, day) > TODAY;

  const displayValue = selected
    ? selected.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between border-[1.5px] rounded-xl px-4 py-3 font-sans text-[0.95rem] transition-colors duration-150 bg-white ${
          open ? "border-[#7b3fe4]" : "border-[#e5e5e5] hover:border-[#bbb]"
        }`}
      >
        <span className={displayValue ? "text-[#111]" : "text-[#bbb]"}>
          {displayValue ?? "Select date of birth"}
        </span>
        <CalendarDays className="w-4 h-4 text-[#bbb] shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-[calc(100%+6px)] left-0 right-0 bg-white border-[1.5px] border-[#e5e5e5] rounded-2xl shadow-xl p-4"
          >
            {/* Month/year header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] transition-colors border-0 bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#555]" />
              </button>
              <span className="font-sans text-sm font-semibold text-[#111]">
                {MONTHS[view.month]} {view.year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                disabled={!canGoNext}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors border-0 bg-transparent ${
                  canGoNext ? "hover:bg-[#f5f5f5] cursor-pointer" : "opacity-30 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-4 h-4 text-[#555]" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center font-sans text-[0.68rem] font-semibold text-[#bbb] uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, i) => (
                <div key={i} className="flex items-center justify-center">
                  {day ? (
                    <button
                      type="button"
                      disabled={isFuture(day)}
                      onClick={() => selectDay(day)}
                      className={`w-8 h-8 rounded-lg font-sans text-sm transition-colors border-0 cursor-pointer ${
                        isSelected(day)
                          ? "bg-black text-white font-semibold"
                          : isFuture(day)
                          ? "text-[#ddd] cursor-not-allowed bg-transparent"
                          : isToday(day)
                          ? "bg-[#f5f0ff] text-[#7b3fe4] font-semibold hover:bg-[#ede8ff]"
                          : "text-[#333] bg-transparent hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {day}
                    </button>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>
              ))}
            </div>

            {/* Quick year jump */}
            <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center gap-2">
              <span className="font-sans text-xs text-[#aaa]">Year</span>
              <select
                value={view.year}
                onChange={(e) => setView(v => ({ ...v, year: parseInt(e.target.value) }))}
                className="flex-1 border-[1.5px] border-[#e5e5e5] rounded-lg px-2 py-1 font-sans text-xs text-[#111] focus:outline-none focus:border-[#7b3fe4] bg-white"
              >
                {Array.from({ length: TODAY.getFullYear() - 1924 }, (_, i) => TODAY.getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ACCEPTED = "image/jpeg,image/png,image/webp,application/pdf";

export default function KYCPage() {
  const router = useRouter();

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");

  // Document uploads
  const [aadhaarDoc, setAadhaarDoc] = useState<DocUploadState | null>(null);
  const [panDoc, setPanDoc] = useState<DocUploadState | null>(null);
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Didit KYC state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<PollStatus>("IDLE");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<Window | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data === "didit:complete") {
        stopPolling();
        setPollStatus("PASSED");
        setTimeout(() => router.push("/onboarding/bank-statement"), 1200);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  useEffect(() => () => stopPolling(), []);

  const openPopup = (url: string) => {
    const width = 450, height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    popupRef.current = window.open(url, "DiditVerification",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
  };

  const startPolling = () => {
    stopPolling();
    setPollStatus("IN_PROGRESS");
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/verification/status");
        const data = await res.json();
        if (data.status === "PASSED") {
          stopPolling(); setPollStatus("PASSED");
          setTimeout(() => router.push("/onboarding/bank-statement"), 1200);
        } else if (data.status === "FAILED") {
          stopPolling(); setPollStatus("FAILED");
          setError("Verification was declined. Please try again.");
        }
      } catch { /* transient — keep polling */ }
    }, 3000);
  };

  const handleDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: "aadhaar" | "pan",
    setState: (s: DocUploadState | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setState({ file, uploading: true, done: false, error: null });
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("docType", docType);
      const res = await fetch("/api/verification/upload-kyc-doc", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState({ file, uploading: false, done: true, error: null });
    } catch (err) {
      setState({ file, uploading: false, done: false, error: err instanceof Error ? err.message : "Upload failed" });
    }
  };

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return "Full name is required.";
    if (!phone.trim() || !/^\+?[\d\s\-]{10,}$/.test(phone)) return "Enter a valid phone number.";
    if (!dob) return "Date of birth is required.";
    if (aadhaar.replace(/\s/g, "").length !== 12) return "Aadhaar must be 12 digits.";
    if (pan.trim().length !== 10) return "PAN must be 10 characters.";
    if (!aadhaarDoc?.done) return "Please upload your Aadhaar card document.";
    if (!panDoc?.done) return "Please upload your PAN card document.";
    return null;
  };

  const handleSaveDetails = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError(null);
    setSavingDetails(true);
    try {
      const res = await fetch("/api/verification/save-kyc-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, dateOfBirth: dob, aadhaarNumber: aadhaar, panNumber: pan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetailsSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSavingDetails(false);
    }
  };

  const startKYC = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verification/create", { method: "POST" });
      if (!response.ok) throw new Error("Failed to start verification");
      const data = await response.json();
      if (!data.sessionUrl) throw new Error("No session URL returned");
      setSessionUrl(data.sessionUrl);
      openPopup(data.sessionUrl);
      startPolling();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const DocUploadField = ({
    label, docType, state, setState, inputRef,
  }: {
    label: string;
    docType: "aadhaar" | "pan";
    state: DocUploadState | null;
    setState: (s: DocUploadState | null) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div>
      <p className="font-sans text-xs font-semibold text-[#888] uppercase tracking-widest mb-2">{label}</p>
      <div
        onClick={() => !state?.done && !state?.uploading && inputRef.current?.click()}
        className={`flex items-center gap-3 border-[1.5px] border-dashed rounded-xl px-4 py-3.5 transition-colors duration-150 ${
          state?.done
            ? "border-[#68d391] bg-[#f0fff4] cursor-default"
            : state?.uploading
            ? "border-[#ddd] bg-[#fafafa] cursor-wait"
            : "border-[#e5e5e5] bg-[#fafafa] hover:border-[#999] cursor-pointer"
        }`}
      >
        {state?.uploading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#7b3fe4] border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="font-sans text-sm text-[#888]">Uploading…</span>
          </>
        ) : state?.done ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-[#38a169] shrink-0" />
            <span className="font-sans text-sm text-[#111] truncate flex-1">{state.file.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setState(null); if (inputRef.current) inputRef.current.value = ""; }}
              className="bg-transparent border-0 cursor-pointer p-0 shrink-0"
            >
              <X className="w-4 h-4 text-[#999] hover:text-[#333]" />
            </button>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 text-[#bbb] shrink-0" />
            <div>
              <p className="font-sans text-sm text-[#555]">Click to upload</p>
              <p className="font-sans text-xs text-[#bbb]">JPEG, PNG, WEBP or PDF · max 10MB</p>
            </div>
          </>
        )}
        {state?.error && <p className="font-sans text-xs text-[#e53e3e] mt-1">{state.error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleDocUpload(e, docType, setState)}
      />
    </div>
  );

  return (
    <div className="w-full max-w-[560px]">
      <button
        onClick={() => router.back()}
        className="font-sans text-[0.8rem] text-[#999] flex items-center gap-[6px] mb-7 bg-transparent border-0 cursor-pointer p-0"
      >
        <ArrowLeft className="inline-block w-4 h-4 mr-1" /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white border-[1.5px] border-solid border-[#e5e5e5] rounded-[20px] p-10"
      >
        <div className="inline-flex items-center gap-2 bg-lime rounded-full py-1 px-[14px] font-sans text-[0.72rem] font-semibold tracking-[1px] uppercase mb-5">
          Step 01 of 04
        </div>

        <h1 className="font-condensed text-[2.2rem] tracking-[1px] mb-[10px] leading-none">
          Identity Verification
        </h1>
        <p className="font-sans text-sm text-[#666] mb-8 leading-[1.6]">
          Provide your personal details and identity documents. A liveness check follows via our verification partner.
        </p>

        {pollStatus === "PASSED" ? (
          <div className="text-center py-8 px-5">
            <div className="w-12 h-12 rounded-full bg-[#f0fff4] border-2 border-[#68d391] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-[#38a169]" />
            </div>
            <h3 className="font-condensed text-2xl tracking-[1px]">Verification Complete</h3>
            <p className="font-sans text-[0.85rem] text-[#888] mt-2">Redirecting you to the next step…</p>
          </div>
        ) : pollStatus === "IN_PROGRESS" ? (
          <div className="text-center py-8 px-5 bg-[#fafafa] rounded-[14px] border border-[#f0f0f0]">
            <div className="w-9 h-9 border-[3px] border-lime border-t-transparent rounded-full animate-spin-fast mx-auto mb-5" />
            <h3 className="font-condensed text-2xl tracking-[1px] mb-2">Waiting for Verification</h3>
            <p className="font-sans text-[0.85rem] text-[#888] mb-7 leading-[1.5]">
              Complete the process in the popup window. This page will advance automatically.
            </p>
            <button
              onClick={() => sessionUrl && openPopup(sessionUrl)}
              className="font-sans text-[0.8rem] text-[#888] underline bg-transparent border-0 cursor-pointer"
            >
              Reopen popup
            </button>
          </div>
        ) : (
          <>
            {!detailsSaved ? (
              /* ── Step A: personal details + document uploads ── */
              <div className="flex flex-col gap-6">

                {/* Personal details */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-sans text-xs font-semibold text-[#333] uppercase tracking-widest block mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="As on your Aadhaar / PAN"
                      className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-xl px-4 py-3 font-sans text-[0.95rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors placeholder:text-[#bbb]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-sans text-xs font-semibold text-[#333] uppercase tracking-widest block mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-xl px-4 py-3 font-sans text-[0.95rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors placeholder:text-[#bbb]"
                      />
                    </div>
                    <div>
                      <label className="font-sans text-xs font-semibold text-[#333] uppercase tracking-widest block mb-2">
                        Date of Birth
                      </label>
                      <DatePicker value={dob} onChange={setDob} />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#f0f0f0]" />

                {/* Aadhaar */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="font-sans text-xs font-semibold text-[#333] uppercase tracking-widest block mb-2">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14}
                      className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-xl px-4 py-3 font-mono text-[0.95rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors placeholder:text-[#bbb]"
                    />
                    <p className="font-sans text-xs text-[#aaa] mt-1.5">Only the last 4 digits are stored.</p>
                  </div>
                  <DocUploadField
                    label="Aadhaar Card Document"
                    docType="aadhaar"
                    state={aadhaarDoc}
                    setState={setAadhaarDoc}
                    inputRef={aadhaarRef}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-[#f0f0f0]" />

                {/* PAN */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="font-sans text-xs font-semibold text-[#333] uppercase tracking-widest block mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-xl px-4 py-3 font-mono text-[0.95rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors placeholder:text-[#bbb]"
                    />
                    <p className="font-sans text-xs text-[#aaa] mt-1.5">Stored in masked form (e.g. ABCDE****F).</p>
                  </div>
                  <DocUploadField
                    label="PAN Card Document"
                    docType="pan"
                    state={panDoc}
                    setState={setPanDoc}
                    inputRef={panRef}
                  />
                </div>

                {formError && (
                  <p className="font-sans text-[0.8rem] text-[#e53e3e]">{formError}</p>
                )}

                {process.env.NODE_ENV === "development" && (
                  <button
                    onClick={async () => {
                      await fetch("/api/verification/dev-approve", { method: "POST" });
                      router.push("/onboarding/bank-statement");
                    }}
                    className="w-full py-3 bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer"
                  >
                    [DEV] Skip KYC
                  </button>
                )}

                <button
                  onClick={handleSaveDetails}
                  disabled={savingDetails}
                  className={`w-full py-[14px] border-0 rounded-[10px] font-sans text-[0.925rem] font-semibold transition-colors duration-200 ${
                    savingDetails ? "bg-[#f0f0f0] text-[#aaa] cursor-not-allowed" : "bg-black text-white cursor-pointer"
                  }`}
                >
                  {savingDetails ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#aaa] border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : (
                    "Continue to Liveness Check"
                  )}
                </button>
              </div>
            ) : (
              /* ── Step B: Didit liveness verification ── */
              <div className="flex flex-col gap-4">
                <div className="bg-[#f0fff4] border-[1.5px] border-[#68d391] rounded-xl px-5 py-4">
                  <p className="font-sans text-sm text-[#276749] font-semibold mb-0.5">Details saved</p>
                  <p className="font-sans text-xs text-[#555] leading-relaxed">
                    Your identity details and documents have been submitted. Complete the liveness check below to finish this step.
                  </p>
                </div>

                {error && <p className="font-sans text-[0.8rem] text-[#e53e3e]">{error}</p>}

                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-9 h-9 border-[3px] border-lime border-t-transparent rounded-full animate-spin-fast mx-auto mb-4" />
                    <p className="font-sans text-[0.85rem] text-[#888]">Initialising secure session…</p>
                  </div>
                ) : (
                  <button
                    onClick={pollStatus === "FAILED" ? () => { setError(null); setPollStatus("IDLE"); setDetailsSaved(false); } : startKYC}
                    className="w-full py-[14px] bg-black text-white border-0 rounded-[10px] font-sans text-[0.925rem] font-semibold cursor-pointer"
                  >
                    {pollStatus === "FAILED" ? "Try Again" : "Start Liveness Check"}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#f0f0f0]">
          <span className="font-sans text-[0.72rem] text-[#bbb]">
            End-to-end encrypted. Documents stored securely and accessible only to our compliance team.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
