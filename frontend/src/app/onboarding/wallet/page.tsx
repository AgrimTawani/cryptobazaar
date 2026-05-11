"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useActiveAccount, useConnect, useDisconnect, useActiveWallet } from "thirdweb/react";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { thirdwebClient } from "@/lib/thirdweb";

const WALLETS = [
  {
    id: "io.metamask",
    name: "MetaMask",
    icon: "🦊",
    desc: "Browser extension wallet",
  },
  {
    id: "com.coinbase.wallet",
    name: "Coinbase Wallet",
    icon: "🔵",
    desc: "Coinbase self-custody wallet",
  },
  {
    id: "walletConnect",
    name: "WalletConnect",
    icon: "🔗",
    desc: "Connect any mobile wallet",
  },
] as const;

export default function WalletPage() {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const activeWallet = useActiveWallet();
  const account = useActiveAccount();
  const address = account?.address ?? null;

  const handleConnect = async (walletId: (typeof WALLETS)[number]["id"]) => {
    if (!acknowledged) return;
    setConnecting(walletId);
    setError(null);
    try {
      await connect(async () => {
        const wallet = createWallet(walletId);
        await wallet.connect({ client: thirdwebClient, chain: polygon });
        return wallet;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      // MetaMask not installed — suggest it
      if (msg.toLowerCase().includes("provider") || msg.toLowerCase().includes("not found")) {
        setError(`${WALLETS.find(w => w.id === walletId)?.name} not detected. Please install it and try again.`);
      } else {
        setError(msg);
      }
    } finally {
      setConnecting(null);
    }
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
          screened for on-chain history. Use a Polygon-compatible wallet holding USDT.
        </p>

        {/* Warning */}
        <div className="bg-[#fffbeb] border-[1.5px] border-solid border-[#fde68a] rounded-xl py-4 px-5 mb-7">
          <p className="font-sans text-[0.8rem] text-[#92400e] leading-[1.6] m-0">
            <strong>⚠️ Permanent bind:</strong> Once linked, changing your wallet invalidates all 3 verification credentials and requires full re-onboarding.
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

        {/* Connected state */}
        {address ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-[#f6fff9] border-[1.5px] border-[#68d391] rounded-xl py-4 px-5 mb-5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-[0.75rem] text-[#38a169] font-semibold uppercase tracking-[1px]">
                  Wallet Connected
                </span>
                <button
                  onClick={() => activeWallet && disconnect(activeWallet)}
                  className="font-sans text-[0.72rem] text-[#999] underline bg-transparent border-0 cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
              <p className="font-mono text-[0.8rem] text-[#111] break-all">{address}</p>
              <p className="font-sans text-[0.72rem] text-[#888] mt-1">Network: Polygon</p>
            </div>

            {error && <p className="font-sans text-[0.8rem] text-[#e53e3e] mb-4">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-[14px] bg-lime text-black border-0 rounded-[10px] font-sans text-[0.925rem] font-bold cursor-pointer transition-colors hover:bg-lime-dark disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin-fast" />
                  Saving wallet…
                </span>
              ) : (
                "Confirm & Enter CryptoBazaar →"
              )}
            </button>
          </motion.div>
        ) : (
          <>
            {/* Wallet options */}
            <div className={`flex flex-col gap-3 mb-5 transition-opacity ${!acknowledged ? "opacity-40 pointer-events-none" : ""}`}>
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleConnect(w.id)}
                  disabled={!!connecting}
                  className="flex items-center gap-4 w-full py-4 px-5 border-[1.5px] border-[#e5e5e5] rounded-xl font-sans text-left transition-all hover:border-black disabled:opacity-60"
                >
                  <span className="text-2xl">{w.icon}</span>
                  <div className="flex-1">
                    <div className="font-sans text-[0.9rem] font-semibold text-[#111]">{w.name}</div>
                    <div className="font-sans text-[0.75rem] text-[#999]">{w.desc}</div>
                  </div>
                  {connecting === w.id && (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin-fast" />
                  )}
                </button>
              ))}
            </div>

            {!acknowledged && (
              <p className="font-sans text-[0.78rem] text-[#bbb] text-center mb-5">
                Check the box above to enable wallet connection.
              </p>
            )}

            {error && <p className="font-sans text-[0.8rem] text-[#e53e3e] mb-4">{error}</p>}

            {process.env.NODE_ENV === "development" && (
              <button
                onClick={devSkip}
                className="w-full py-[11px] bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer"
              >
                [DEV] Skip Wallet
              </button>
            )}
          </>
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
