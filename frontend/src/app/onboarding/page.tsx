"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type StepStatus = "done" | "active" | "locked";

interface OnboardingStatus {
  userStatus: string;
  walletAddress: string | null;
  kyc: string;
  edd: string;
  interview: string;
}

function deriveSteps(s: OnboardingStatus): StepStatus[] {
  const kyc: StepStatus = s.kyc === "PASSED" ? "done" : "active";
  const edd: StepStatus = kyc === "done" ? (s.edd === "PASSED" ? "done" : "active") : "locked";
  const interview: StepStatus = edd === "done" ? (s.interview === "PASSED" ? "done" : "active") : "locked";
  const wallet: StepStatus = interview === "done" ? (s.walletAddress ? "done" : "active") : "locked";
  return [kyc, edd, interview, wallet];
}

const STEPS = [
  {
    number: "01",
    title: "Identity Verification",
    desc: "Aadhaar OCR, PAN check, and liveness detection via Didit.",
    href: "/onboarding/kyc",
  },
  {
    number: "02",
    title: "Bank Statement Review",
    desc: "Upload 6 months of statements for ML-based EDD scoring.",
    href: "/onboarding/bank-statement",
  },
  {
    number: "03",
    title: "AI Questionnaire",
    desc: "10 questions scored by AI to assess trading intent and risk.",
    href: "/onboarding/questionnaire",
  },
  {
    number: "04",
    title: "Connect Wallet",
    desc: "Link your crypto wallet. This address is permanently bound to your account.",
    href: "/onboarding/wallet",
  },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [statuses, setStatuses] = useState<StepStatus[]>(["active", "locked", "locked", "locked"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/sync", { method: "POST" }).catch(() => null);

    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data: OnboardingStatus) => {
        setStatuses(deriveSteps(data));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-[600px]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="font-sans text-[0.8rem] text-[#999] tracking-[2px] uppercase mb-[10px]">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </p>
        <h1 className="font-condensed text-[2.8rem] tracking-[1px] mb-2 leading-none">
          COMPLETE YOUR VERIFICATION
        </h1>
        <p className="font-sans text-sm text-[#666] mb-10 leading-[1.6]">
          All 4 steps must be completed before you can trade. Steps unlock
          sequentially.
        </p>

        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              status={loading ? (i === 0 ? "active" : "locked") : statuses[i]}
              index={i}
              onStart={() => router.push(step.href)}
            />
          ))}
        </div>

        <p className="font-sans text-[0.72rem] text-[#bbb] mt-8 leading-[1.7] text-center">
          Your personal data is never stored on our servers. All verification is
          processed in-flight and discarded after credentials are issued.
        </p>
      </motion.div>
    </div>
  );
}

function StepCard({
  step,
  status,
  index,
  onStart,
}: {
  step: (typeof STEPS)[0];
  status: StepStatus;
  index: number;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className={`bg-white border-[1.5px] border-solid rounded-[14px] py-5 px-6 flex items-center gap-5 ${
        status === "active" ? "border-black cursor-pointer" : "border-[#f0f0f0] cursor-default"
      } ${status === "locked" ? "opacity-[0.45]" : "opacity-100"}`}
      onClick={status === "active" ? onStart : undefined}
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center font-condensed text-base tracking-[1px] text-black ${
          status === "done" || status === "active" ? "bg-lime" : "bg-[#f5f5f5]"
        }`}
      >
        {status === "done" ? "✓" : status === "locked" ? <LockIcon /> : step.number}
      </div>

      <div className="flex-1">
        <div className="font-condensed text-[1.15rem] tracking-[0.5px] text-black mb-[2px]">
          {step.title}
        </div>
        <div className="font-sans text-[0.8rem] text-[#888] leading-[1.4]">
          {step.desc}
        </div>
      </div>

      {status === "active" && (
        <div className="shrink-0 font-sans text-[0.8rem] font-semibold text-black">
          Start →
        </div>
      )}
      {status === "done" && (
        <div className="shrink-0 font-sans text-[0.75rem] text-[#999]">
          Complete
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
