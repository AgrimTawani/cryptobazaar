"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type PollStatus = "IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED";

export default function KYCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<PollStatus>("IDLE");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<Window | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
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

  const startPolling = () => {
    stopPolling();
    setPollStatus("IN_PROGRESS");
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/verification/status");
        const data = await res.json();

        if (data.status === "PASSED") {
          stopPolling();
          setPollStatus("PASSED");
          setTimeout(() => router.push("/onboarding/bank-statement"), 1200);
        } else if (data.status === "FAILED") {
          stopPolling();
          setPollStatus("FAILED");
          setError("Verification was declined. Please try again.");
        }
      } catch {
        // transient error — keep polling
      }
    }, 3000);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const openPopup = (url: string) => {
    const width = 450;
    const height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    popupRef.current = window.open(
      url,
      "DiditVerification",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
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

  const retry = () => {
    setSessionUrl(null);
    setPollStatus("IDLE");
    setError(null);
  };

  return (
    <div className="w-full max-w-[520px]">
      <button
        onClick={() => router.back()}
        className="font-sans text-[0.8rem] text-[#999] flex items-center gap-[6px] mb-7 bg-transparent border-0 cursor-pointer p-0"
      >
        ← Back
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
          We use Didit to verify your Aadhaar, PAN, and run a liveness check.
          Your data is never stored on our servers.
        </p>

        {pollStatus === "PASSED" && (
          <div className="text-center py-8 px-5">
            <div className="text-[2.5rem] mb-3">✓</div>
            <h3 className="font-condensed text-2xl tracking-[1px]">
              Verification Complete
            </h3>
            <p className="font-sans text-[0.85rem] text-[#888] mt-2">
              Redirecting you to the next step…
            </p>
          </div>
        )}

        {pollStatus === "IN_PROGRESS" && (
          <div className="text-center py-8 px-5 bg-[#fafafa] rounded-[14px] border border-[#f0f0f0]">
            <div className="w-9 h-9 border-[3px] border-lime border-t-transparent rounded-full animate-spin-fast mx-auto mb-5" />
            <h3 className="font-condensed text-2xl tracking-[1px] mb-2">
              Waiting for Verification
            </h3>
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
        )}

        {process.env.NODE_ENV === "development" && pollStatus === "IDLE" && (
          <button
            onClick={async () => {
              await fetch("/api/verification/dev-approve", { method: "POST" });
              router.push("/onboarding/bank-statement");
            }}
            className="w-full py-[11px] bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer mb-[10px]"
          >
            [DEV] Skip KYC
          </button>
        )}

        {(pollStatus === "IDLE" || pollStatus === "FAILED") && (
          <>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-9 h-9 border-[3px] border-lime border-t-transparent rounded-full animate-spin-fast mx-auto mb-4" />
                <p className="font-sans text-[0.85rem] text-[#888]">
                  Initializing secure session…
                </p>
              </div>
            ) : (
              <button
                onClick={pollStatus === "FAILED" ? retry : startKYC}
                className="w-full py-[14px] bg-black text-white border-0 rounded-[10px] font-sans text-[0.925rem] font-semibold cursor-pointer"
              >
                {pollStatus === "FAILED" ? "Try Again" : "Verify with Didit"}
              </button>
            )}
            {error && (
              <p className="font-sans text-[0.8rem] text-[#e53e3e] mt-3">
                {error}
              </p>
            )}
          </>
        )}

        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#f0f0f0]">
          <span>🔒</span>
          <span className="font-sans text-[0.72rem] text-[#bbb]">
            End-to-end encrypted. Data discarded after credential issuance.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
