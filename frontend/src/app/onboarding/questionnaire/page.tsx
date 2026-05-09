"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function QuestionnairePage() {
  const router = useRouter();

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
          Step 03 of 04
        </div>

        <h1 className="font-condensed text-[2.2rem] tracking-[1px] mb-[10px] leading-none">
          Interview
        </h1>
        <p className="font-sans text-sm text-[#666] mb-10 leading-[1.6]">
          10 questions to understand your trading background and risk profile.
          Scored by AI. Takes about 5 minutes.
        </p>

        {/* Placeholder */}
        <div className="bg-[#fafafa] border-[1.5px] border-dashed border-[#e0e0e0] rounded-[14px] py-12 px-6 text-center">
          <div className="text-[2.5rem] mb-4">🚧</div>
          <p className="font-condensed text-[1.3rem] tracking-[1px] mb-2">
            Coming Soon
          </p>
          <p className="font-sans text-[0.8rem] text-[#aaa] leading-[1.5]">
            AI interview is under development. Click below to skip for now
            during testing.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <button
            onClick={async () => {
              await fetch("/api/verification/dev-approve-interview", { method: "POST" });
              router.push("/onboarding/wallet");
            }}
            className="w-full py-[11px] bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer mt-5 mb-2"
          >
            [DEV] Skip Interview
          </button>
        )}

        <button
          onClick={() => router.push("/onboarding/wallet")}
          className={`w-full py-[14px] bg-black text-white border-0 rounded-[10px] font-sans text-[0.925rem] font-semibold cursor-pointer ${
            process.env.NODE_ENV === "development" ? "mt-0" : "mt-5"
          }`}
        >
          Continue →
        </button>
      </motion.div>
    </div>
  );
}
