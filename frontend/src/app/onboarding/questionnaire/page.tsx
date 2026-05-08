"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function QuestionnairePage() {
  const router = useRouter();

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
          Step 03 of 04
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
          Interview
        </h1>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.875rem",
            color: "#666",
            marginBottom: "40px",
            lineHeight: 1.6,
          }}
        >
          10 questions to understand your trading background and risk profile.
          Scored by AI. Takes about 5 minutes.
        </p>

        {/* Placeholder */}
        <div
          style={{
            background: "#fafafa",
            border: "1.5px dashed #e0e0e0",
            borderRadius: "14px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🚧</div>
          <p
            style={{
              fontFamily: "var(--condensed)",
              fontSize: "1.3rem",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}
          >
            Coming Soon
          </p>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.8rem",
              color: "#aaa",
              lineHeight: 1.5,
            }}
          >
            AI interview is under development. Click below to skip for now
            during testing.
          </p>
        </div>

        <button
          onClick={() => router.push("/onboarding/wallet")}
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
            marginTop: "20px",
          }}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
