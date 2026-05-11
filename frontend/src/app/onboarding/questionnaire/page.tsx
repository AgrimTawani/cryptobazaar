"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: "volume",
    question: "How much USDT do you expect to trade monthly?",
    type: "select" as const,
    options: ["Under ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000 – ₹10,00,000", "Over ₹10,00,000"],
  },
  {
    id: "experience",
    question: "Are you new to P2P trading?",
    type: "select" as const,
    options: ["Yes, completely new", "Some experience (under 6 months)", "Experienced (6 months – 2 years)", "Very experienced (2+ years)"],
  },
  {
    id: "binance",
    question: "Do you have a verified Binance P2P account?",
    type: "select_with_detail" as const,
    options: ["Yes", "No"],
    detailPrompt: "Enter your Binance UID (optional)",
    detailFor: "Yes",
  },
  {
    id: "duration",
    question: "Since how long have you been trading cryptocurrency?",
    type: "select" as const,
    options: ["Never traded before", "Less than 6 months", "6 months – 2 years", "Over 2 years"],
  },
  {
    id: "active",
    question: "Are you currently actively trading on any P2P platform?",
    type: "select" as const,
    options: ["Yes, daily", "Yes, a few times a week", "Occasionally", "No, just starting out"],
  },
  {
    id: "txn_time",
    question: "What is your expected average transaction completion time?",
    type: "select" as const,
    options: ["Under 15 minutes", "15 – 30 minutes", "30 – 60 minutes", "Over 1 hour"],
  },
  {
    id: "source_of_funds",
    question: "What is your primary source of funds for trading?",
    type: "select" as const,
    options: ["Salary / Employment income", "Business income", "Investment returns", "Savings", "Other"],
  },
  {
    id: "lien",
    question: "Has your bank account ever been frozen or had a lien placed on it?",
    type: "select_with_detail" as const,
    options: ["Yes", "No"],
    detailPrompt: "Please briefly explain the reason",
    detailFor: "Yes",
  },
  {
    id: "purpose",
    question: "What is your primary purpose for using CryptoBazaar?",
    type: "select" as const,
    options: ["International remittances", "Business payments", "Portfolio diversification / savings", "Converting crypto earnings", "Other"],
  },
  {
    id: "max_txn",
    question: "What is the maximum single transaction size you expect to make?",
    type: "select" as const,
    options: ["Under ₹25,000", "₹25,000 – ₹1,00,000", "₹1,00,000 – ₹5,00,000", "Over ₹5,00,000"],
  },
];

type Answers = Record<string, string>;

export default function QuestionnairePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ passed: boolean; score: number; summary: string } | null>(null);

  const answeredCount = Object.keys(answers).filter((k) => !k.endsWith("_detail")).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/verification/submit-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Submission failed. Please try again."); return; }
      setResult(data);
      if (data.passed) setTimeout(() => router.push("/onboarding/wallet"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const devSkip = async () => {
    await fetch("/api/verification/dev-approve-interview", { method: "POST" });
    router.push("/onboarding/wallet");
  };

  return (
    <div className="w-full max-w-[560px]">
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
          AI Questionnaire
        </h1>
        <p className="font-sans text-sm text-[#666] mb-8 leading-[1.6]">
          10 questions about your trading background. Scored by AI to assess
          intent and risk. Takes under 3 minutes.
        </p>

        {result ? (
          <div className={`rounded-[14px] p-5 mb-4 border ${result.passed ? "bg-[#f0fff4] border-[#68d391]" : "bg-[#fff5f5] border-[#fc8181]"}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{result.passed ? "✓" : "✗"}</span>
              <span className="font-condensed text-[1.3rem] tracking-[1px]">
                {result.passed ? "Questionnaire Passed" : "Questionnaire Declined"}
              </span>
              <span className={`ml-auto font-sans text-[0.8rem] font-bold px-2 py-[2px] rounded-full ${result.passed ? "bg-[#68d391] text-[#1a4731]" : "bg-[#fc8181] text-[#742a2a]"}`}>
                Score {result.score}/100
              </span>
            </div>
            <p className="font-sans text-[0.82rem] text-[#555] leading-[1.6]">{result.summary}</p>
            {result.passed && (
              <p className="font-sans text-[0.78rem] text-[#38a169] mt-3">Redirecting to wallet step…</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-7 mb-8">
              {QUESTIONS.map((q, i) => (
                <div key={q.id}>
                  <p className="font-sans text-[0.88rem] font-semibold text-[#111] mb-3 leading-[1.5]">
                    <span className="font-sans text-[0.78rem] text-[#bbb] mr-2 font-normal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {q.question}
                  </p>
                  <div className="flex flex-col gap-[6px]">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={`text-left py-[10px] px-4 rounded-[8px] font-sans text-[0.85rem] border transition-all duration-150 ${
                          answers[q.id] === opt
                            ? "border-black bg-black text-white"
                            : "border-[#e5e5e5] bg-white text-[#333] hover:border-[#bbb]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {"detailFor" in q && answers[q.id] === q.detailFor && (
                    <input
                      type="text"
                      placeholder={q.detailPrompt}
                      onChange={(e) => setAnswers((a) => ({ ...a, [`${q.id}_detail`]: e.target.value }))}
                      className="mt-2 w-full py-[10px] px-4 border border-[#e5e5e5] rounded-[8px] font-sans text-[0.85rem] text-[#333] outline-none focus:border-black"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <p className="font-sans text-[0.8rem] text-[#e53e3e] mb-4">{error}</p>
            )}

            {process.env.NODE_ENV === "development" && (
              <button
                onClick={devSkip}
                className="w-full py-[11px] bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer mb-[10px]"
              >
                [DEV] Skip Questionnaire
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className={`w-full py-[14px] border-0 rounded-[10px] font-sans text-[0.925rem] font-semibold transition-colors duration-200 ${
                allAnswered && !submitting
                  ? "bg-black text-white cursor-pointer"
                  : "bg-[#f0f0f0] text-[#aaa] cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                  Scoring with AI…
                </span>
              ) : allAnswered ? (
                "Submit Answers →"
              ) : (
                `Answer all questions (${answeredCount}/10)`
              )}
            </button>
          </>
        )}

        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#f0f0f0]">
          <span>🔒</span>
          <span className="font-sans text-[0.72rem] text-[#bbb]">
            Answers are used solely for risk assessment and stored securely.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
