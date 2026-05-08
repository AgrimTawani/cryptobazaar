"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function KYCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);

  const openPopup = (url: string) => {
    const width = 450;
    const height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      "DiditVerification",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  };

  const startKYC = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verification/create", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to start verification");
      const data = await response.json();
      if (data.sessionUrl) {
        setSessionUrl(data.sessionUrl);
        openPopup(data.sessionUrl);
      } else {
        throw new Error("No session URL returned");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
          Step 01 of 04
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
          Identity Verification
        </h1>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.875rem",
            color: "#666",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          We use Didit to verify your Aadhaar, PAN, and run a liveness check.
          Your data is never stored on our servers.
        </p>

        {sessionUrl ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 20px",
              background: "#fafafa",
              borderRadius: "14px",
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid #D4FF00",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <h3
              style={{
                fontFamily: "var(--condensed)",
                fontSize: "1.5rem",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              Waiting for Verification
            </h3>
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.85rem",
                color: "#888",
                marginBottom: "28px",
                lineHeight: 1.5,
              }}
            >
              Complete the process in the popup window, then click below.
            </p>
            <button
              onClick={() => router.push("/onboarding/bank-statement")}
              style={{
                width: "100%",
                padding: "13px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontFamily: "var(--sans)",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              I have completed verification →
            </button>
            <button
              onClick={() => openPopup(sessionUrl)}
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.8rem",
                color: "#888",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reopen popup
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "3px solid #D4FF00",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 16px",
                  }}
                />
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: "0.85rem",
                    color: "#888",
                  }}
                >
                  Initializing secure session…
                </p>
              </div>
            ) : (
              <button
                onClick={startKYC}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#000",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontFamily: "var(--sans)",
                  fontSize: "0.925rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Verify with Didit
              </button>
            )}
            {error && (
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.8rem",
                  color: "#e53e3e",
                  marginTop: "12px",
                }}
              >
                {error}
              </p>
            )}
          </>
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
            End-to-end encrypted. Data discarded after credential issuance.
          </span>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
