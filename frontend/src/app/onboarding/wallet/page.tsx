"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ConnectEmbed } from "thirdweb/react";
import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { defineChain } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { thirdwebClient } from "@/lib/thirdweb";

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID ?? "137");
const activeChain = CHAIN_ID === 80002 ? defineChain(80002) : polygon;

export default function WalletPage() {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { disconnect } = useDisconnect();
  const activeWallet = useActiveWallet();
  const account = useActiveAccount();
  const address = account?.address ?? null;

  const handleDisconnect = () => {
    if (activeWallet) disconnect(activeWallet);
  };

  const handleSave = async () => {
    if (!address || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/verification/link-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, walletChain: "POLYGON" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save wallet"); return; }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const devSkip = async () => {
    await fetch("/api/verification/dev-approve-wallet", { method: "POST" });
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-[520px]">
      <button
        onClick={() => router.back()}
        className="font-sans text-[0.8rem] text-[#999] flex items-center gap-1.5 mb-7 bg-transparent border-0 cursor-pointer p-0"
      >
        ← Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white border-[1.5px] border-solid border-[#e5e5e5] rounded-[20px] p-10"
      >
        <div className="inline-flex items-center gap-2 bg-lime rounded-full py-1 px-3.5 font-sans text-[0.72rem] font-semibold tracking-[1px] uppercase mb-5">
          Step 04 of 04
        </div>

        <h1 className="font-condensed text-[2.2rem] tracking-[1px] mb-2.5 leading-none">
          Connect Wallet
        </h1>
        <p className="font-sans text-sm text-[#666] mb-7 leading-[1.6]">
          Your wallet address will be permanently bound to your account and screened for on-chain history.
        </p>

        {/* Warning */}
        <div className="bg-[#fffbeb] border-[1.5px] border-solid border-[#fde68a] rounded-xl py-4 px-5 mb-7">
          <p className="font-sans text-[0.8rem] text-[#92400e] leading-[1.6] m-0">
            <strong>Permanent bind:</strong> Once linked, changing your wallet requires full re-onboarding.
          </p>
        </div>

        {/* Acknowledgement */}
        <label className="flex items-start gap-3 cursor-pointer mb-7">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-[2px] w-4 h-4 cursor-pointer"
            style={{ accentColor: "#D4FF00" }}
          />
          <span className="font-sans text-[0.82rem] text-[#555] leading-[1.6]">
            I understand that my wallet address is permanently bound to my account. Changing it requires full re-verification.
          </span>
        </label>

        {address ? (
          /* Connected state */
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-[#f6fff9] border-[1.5px] border-[#68d391] rounded-xl py-4 px-5 mb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-[0.75rem] text-[#38a169] font-semibold uppercase tracking-[1px]">
                  Wallet Connected
                </span>
                <button
                  onClick={handleDisconnect}
                  className="font-sans text-[0.72rem] text-[#999] underline bg-transparent border-0 cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
              <p className="font-mono text-[0.82rem] text-[#111] break-all">{address}</p>
            </div>

            {error && <p className="font-sans text-[0.8rem] text-[#e53e3e] mb-4">{error}</p>}

            <button
              onClick={handleSave}
              disabled={!acknowledged || saving}
              className={`w-full py-3.5 border-0 rounded-[10px] font-sans text-[0.925rem] font-bold transition-colors duration-200 ${
                acknowledged && !saving
                  ? "bg-black text-white cursor-pointer"
                  : "bg-[#f0f0f0] text-[#aaa] cursor-not-allowed"
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                  Saving wallet…
                </span>
              ) : (
                "Confirm & Enter CryptoBazaar →"
              )}
            </button>
          </motion.div>
        ) : (
          /* Wallet connect UI */
          <div className={`transition-opacity duration-200 ${!acknowledged ? "opacity-40 pointer-events-none" : ""}`}>
            <ConnectEmbed
              client={thirdwebClient}
              chain={activeChain}
              theme="light"
              style={{ width: "100%", border: "none", boxShadow: "none", padding: 0 }}
            />
            {!acknowledged && (
              <p className="font-sans text-[0.78rem] text-[#bbb] text-center mt-4">
                Check the box above to enable wallet connection.
              </p>
            )}
          </div>
        )}

        {process.env.NODE_ENV === "development" && !address && (
          <button
            onClick={devSkip}
            className="w-full mt-4 py-2.5 bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer"
          >
            [DEV] Skip Wallet
          </button>
        )}

        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#f0f0f0]">
          <span>🔒</span>
          <span className="font-sans text-[0.72rem] text-[#bbb]">
            Wallet screened for on-chain history. Clean wallet required.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
