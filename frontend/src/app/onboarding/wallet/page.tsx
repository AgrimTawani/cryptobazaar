"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const router = useRouter();
  const [acknowledged, setAcknowledged] = useState(false);
  const [connected, setConnected] = useState(false);

  return (
    <div style={{ width: "100%", maxWidth: "520px" }}>
      <button
        onClick={() => router.back()}
        style={{
          fontFamily: "var(--sans)",
          fontSize: "0.8rem",
          color: "#999",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "28px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        ← Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background: "#fff",
          border: "1.5px solid #e5e5e5",
          borderRadius: "20px",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#D4FF00",
            borderRadius: "999px",
            padding: "4px 14px",
            fontFamily: "var(--sans)",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          Step 04 of 04
        </div>

        <h1
          style={{
            fontFamily: "var(--condensed)",
            fontSize: "2.2rem",
            letterSpacing: "1px",
            marginBottom: "10px",
            lineHeight: 1,
          }}
        >
          Connect Wallet
        </h1>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.875rem",
            color: "#666",
            marginBottom: "28px",
            lineHeight: 1.6,
          }}
        >
          Your wallet address will be permanently bound to your account and
          screened for on-chain history.
        </p>

        {/* Warning banner */}
        <div
          style={{
            background: "#fffbeb",
            border: "1.5px solid #fde68a",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "28px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.8rem",
              color: "#92400e",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <strong>⚠️ Wallet lock warning:</strong> If you change your connected
            wallet in the future, all 3 verification credentials will be
            invalidated and you must restart the full onboarding process from
            KYC.
          </p>
        </div>

        {/* Acknowledgement */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            cursor: "pointer",
            marginBottom: "28px",
          }}
        >
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            style={{ marginTop: "2px", accentColor: "#D4FF00", width: "16px", height: "16px" }}
          />
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.8rem",
              color: "#555",
              lineHeight: 1.6,
            }}
          >
            I understand that my wallet address is permanently bound to my
            account. Changing it will require full re-verification.
          </span>
        </label>

        {/* Connect button — ThirdWeb will replace this */}
        <button
          disabled={!acknowledged || connected}
          onClick={() => setConnected(true)}
          style={{
            width: "100%",
            padding: "14px",
            background: acknowledged ? "#000" : "#f0f0f0",
            color: acknowledged ? "#fff" : "#aaa",
            border: "none",
            borderRadius: "10px",
            fontFamily: "var(--sans)",
            fontSize: "0.925rem",
            fontWeight: 600,
            cursor: acknowledged ? "pointer" : "not-allowed",
            transition: "background 0.2s",
            marginBottom: "12px",
          }}
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
              style={{
                width: "100%",
                padding: "14px",
                background: "#D4FF00",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                fontFamily: "var(--sans)",
                fontSize: "0.925rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Enter CryptoBazaar →
            </button>
          </motion.div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <span>🔒</span>
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.72rem",
              color: "#bbb",
            }}
          >
            Wallet screened via Nominis for on-chain history. Clean wallet
            required.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
