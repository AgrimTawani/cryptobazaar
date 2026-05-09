"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [connected, setConnected] = useState(false);

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
          Step 04 of 04
        </div>

        <h1 className="font-condensed text-[2.2rem] tracking-[1px] mb-[10px] leading-none">
          Connect Wallet
        </h1>
        <p className="font-sans text-sm text-[#666] mb-7 leading-[1.6]">
          Your wallet address will be permanently bound to your account and
          screened for on-chain history.
        </p>

        {/* Warning banner */}
        <div className="bg-[#fffbeb] border-[1.5px] border-solid border-[#fde68a] rounded-xl py-4 px-5 mb-7">
          <p className="font-sans text-[0.8rem] text-[#92400e] leading-[1.6] m-0">
            <strong>⚠️ Wallet lock warning:</strong> If you change your connected
            wallet in the future, all 3 verification credentials will be
            invalidated and you must restart the full onboarding process from
            KYC.
          </p>
        </div>

        {/* Acknowledgement */}
        <label className="flex items-start gap-3 cursor-pointer mb-7">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            style={{ marginTop: "2px", accentColor: "#D4FF00", width: "16px", height: "16px" }}
          />
          <span className="font-sans text-[0.8rem] text-[#555] leading-[1.6]">
            I understand that my wallet address is permanently bound to my
            account. Changing it will require full re-verification.
          </span>
        </label>

        {process.env.NODE_ENV === "development" && !connected && (
          <button
            onClick={async () => {
              await fetch("/api/verification/dev-approve-wallet", { method: "POST" });
              router.push("/dashboard");
            }}
            className="w-full py-[11px] bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer mb-[10px]"
          >
            [DEV] Skip Wallet
          </button>
        )}

        {/* Connect button — ThirdWeb will replace this */}
        <button
          disabled={!acknowledged || connected}
          onClick={() => setConnected(true)}
          className={`w-full py-[14px] border-0 rounded-[10px] font-sans text-[0.925rem] font-semibold transition-colors duration-200 mb-3 ${
            acknowledged ? "bg-black text-white cursor-pointer" : "bg-[#f0f0f0] text-[#aaa] cursor-not-allowed"
          }`}
        >
          {connected ? "✓ Wallet Connected" : "Connect Wallet"}
        </button>

        {connected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-[14px] bg-lime text-black border-0 rounded-[10px] font-sans text-[0.925rem] font-bold cursor-pointer"
            >
              Enter CryptoBazaar →
            </button>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#f0f0f0]">
          <span>🔒</span>
          <span className="font-sans text-[0.72rem] text-[#bbb]">
            Wallet screened via Nominis for on-chain history. Clean wallet
            required.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
