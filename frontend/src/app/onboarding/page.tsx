"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Identity Verification",
    desc: "Aadhaar OCR, PAN check, and liveness detection via Didit.",
    href: "/onboarding/kyc",
    status: "pending" as const,
  },
  {
    number: "02",
    title: "Bank Statement Review",
    desc: "Upload 6 months of statements for ML-based EDD scoring.",
    href: "/onboarding/bank-statement",
    status: "locked" as const,
  },
  {
    number: "03",
    title: "Interview",
    desc: "10 questions scored by AI to assess trading intent and risk.",
    href: "/onboarding/questionnaire",
    status: "locked" as const,
  },
  {
    number: "04",
    title: "Connect Wallet",
    desc: "Link your crypto wallet. This address is permanently bound to your account.",
    href: "/onboarding/wallet",
    status: "locked" as const,
  },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/sync", { method: "POST" }).catch(() => null);
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "600px" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.8rem",
            color: "#999",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </p>
        <h1
          style={{
            fontFamily: "var(--condensed)",
            fontSize: "2.8rem",
            letterSpacing: "1px",
            marginBottom: "8px",
            lineHeight: 1,
          }}
        >
          COMPLETE YOUR VERIFICATION
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
          All 4 steps must be completed before you can trade. Steps unlock
          sequentially.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              index={i}
              onStart={() => router.push(step.href)}
            />
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.72rem",
            color: "#bbb",
            marginTop: "32px",
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          Your personal data is never stored on our servers. All verification is
          processed in-flight and discarded after credentials are issued.
        </p>
      </motion.div>
    </div>
  );
}

function StepCard({
  step,
  index,
  onStart,
}: {
  step: (typeof STEPS)[0];
  index: number;
  onStart: () => void;
}) {
  const isPending = step.status === "pending";
  const isLocked = step.status === "locked";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      style={{
        background: "#fff",
        border: `1.5px solid ${isPending ? "#000" : "#f0f0f0"}`,
        borderRadius: "14px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        opacity: isLocked ? 0.45 : 1,
        cursor: isPending ? "pointer" : "default",
      }}
      onClick={isPending ? onStart : undefined}
    >
      {/* Step badge */}
      <div
        style={{
          flexShrink: 0,
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: isPending ? "#D4FF00" : "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--condensed)",
          fontSize: "1rem",
          letterSpacing: "1px",
          color: isPending ? "#000" : "#bbb",
        }}
      >
        {step.status === "locked" ? (
          <LockIcon />
        ) : (
          step.number
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--condensed)",
            fontSize: "1.15rem",
            letterSpacing: "0.5px",
            color: "#000",
            marginBottom: "2px",
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.8rem",
            color: "#888",
            lineHeight: 1.4,
          }}
        >
          {step.desc}
        </div>
      </div>

      {/* CTA */}
      {isPending && (
        <div
          style={{
            flexShrink: 0,
            fontFamily: "var(--sans)",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#000",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          Start →
        </div>
      )}
    </motion.div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
