"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const QUESTIONS = [
  {
    id: "volume",
    question: "How much USDT do you expect to trade monthly?",
    options: ["Under ₹50,000", "₹50,000 – ₹2,00,000", "₹2,00,000 – ₹10,00,000", "Over ₹10,00,000"],
    hasOther: false,
    detailFor: null as string | null,
    detailPrompt: null as string | null,
  },
  {
    id: "experience",
    question: "Are you new to P2P trading?",
    options: ["Yes, completely new", "Some experience (under 6 months)", "Experienced (6 months – 2 years)", "Very experienced (2+ years)"],
    hasOther: false,
    detailFor: null,
    detailPrompt: null,
  },
  {
    id: "binance",
    question: "Do you have a verified Binance P2P account?",
    options: ["Yes", "No"],
    hasOther: false,
    detailFor: "Yes",
    detailPrompt: "Enter your Binance UID (optional)",
  },
  {
    id: "duration",
    question: "Since how long have you been trading cryptocurrency?",
    options: ["Never traded before", "Less than 6 months", "6 months – 2 years", "Over 2 years"],
    hasOther: false,
    detailFor: null,
    detailPrompt: null,
  },
  {
    id: "active",
    question: "Are you currently actively trading on any P2P platform?",
    options: ["Yes, daily", "Yes, a few times a week", "Occasionally", "No, just starting out"],
    hasOther: false,
    detailFor: null,
    detailPrompt: null,
  },
  {
    id: "txn_time",
    question: "What is your expected average transaction completion time?",
    options: ["Under 15 minutes", "15 – 30 minutes", "30 – 60 minutes", "Over 1 hour"],
    hasOther: false,
    detailFor: null,
    detailPrompt: null,
  },
  {
    id: "source_of_funds",
    question: "What is your primary source of funds for trading?",
    options: ["Salary / Employment income", "Business income", "Investment returns", "Savings", "Other"],
    hasOther: true,
    detailFor: null,
    detailPrompt: null,
  },
  {
    id: "lien",
    question: "Has your bank account ever been frozen or had a lien placed on it?",
    options: ["Yes", "No"],
    hasOther: false,
    detailFor: "Yes",
    detailPrompt: "Please briefly explain the reason",
  },
  {
    id: "purpose",
    question: "What is your primary purpose for using CryptoBazaar?",
    options: ["International remittances", "Business payments", "Portfolio diversification / savings", "Converting crypto earnings", "Other"],
    hasOther: true,
    detailFor: null,
    detailPrompt: null,
  },
  {
    id: "max_txn",
    question: "What is the maximum single transaction size you expect to make?",
    options: ["Under ₹25,000", "₹25,000 – ₹1,00,000", "₹1,00,000 – ₹5,00,000", "Over ₹5,00,000"],
    hasOther: false,
    detailFor: null,
    detailPrompt: null,
  },
];

type Answers = Record<string, string>;

export default function QuestionnairePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ passed: boolean; score: number; summary: string } | null>(null);

  const answeredCount = QUESTIONS.filter((q) => {
    const val = answers[q.id];
    if (!val) return false;
    if (val === "Other") return !!answers[`${q.id}_detail`]?.trim();
    return true;
  }).length;
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
    <div className="w-full max-w-[680px]">
      <button
        onClick={() => router.back()}
        className="font-sans text-sm text-[#999] flex items-center gap-2 mb-8 bg-transparent border-0 cursor-pointer p-0"
      >
        ← Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white border-[1.5px] border-solid border-[#e5e5e5] rounded-[20px] p-12"
      >
        <div className="inline-flex items-center gap-2 bg-lime rounded-full py-[6px] px-4 font-sans text-[0.78rem] font-semibold tracking-[1px] uppercase mb-6">
          Step 03 of 04
        </div>

        <h1 className="font-condensed text-[2.8rem] tracking-[1px] mb-3 leading-none">
          AI Questionnaire
        </h1>
        <p className="font-sans text-base text-[#666] mb-10 leading-relaxed">
          10 questions about your trading background. Scored by AI to assess intent and risk. Takes under 3 minutes.
        </p>

        {result ? (
          <div className={`rounded-2xl p-7 mb-4 border-2 ${result.passed ? "bg-[#f0fff4] border-[#68d391]" : "bg-[#fff5f5] border-[#fc8181]"}`}>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-3xl">{result.passed ? "✓" : "✗"}</span>
              <span className="font-condensed text-[1.8rem] tracking-[1px]">
                {result.passed ? "Questionnaire Passed" : "Questionnaire Declined"}
              </span>
              <span className={`ml-auto font-sans text-sm font-bold px-3 py-1 rounded-full ${result.passed ? "bg-[#68d391] text-[#1a4731]" : "bg-[#fc8181] text-[#742a2a]"}`}>
                Score {result.score}/100
              </span>
            </div>
            <p className="font-sans text-[0.95rem] text-[#555] leading-relaxed">{result.summary}</p>
            {result.passed && (
              <p className="font-sans text-sm text-[#38a169] mt-4">Redirecting to wallet step…</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-10 mb-10">
              {QUESTIONS.map((q, i) => (
                <div key={q.id}>
                  <p className="font-sans text-[1rem] font-semibold text-[#111] mb-4 leading-snug">
                    <span className="font-sans text-[0.85rem] text-[#bbb] font-normal mr-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {q.question}
                  </p>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={`text-left py-4 px-5 rounded-xl font-sans text-[0.95rem] border-[1.5px] transition-all duration-150 ${
                          answers[q.id] === opt
                            ? "border-black bg-black text-white"
                            : "border-[#e5e5e5] bg-white text-[#333] hover:border-[#999]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}

                    {/* "Other" free-text input */}
                    {q.hasOther && answers[q.id] === "Other" && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Please specify…"
                        value={answers[`${q.id}_detail`] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [`${q.id}_detail`]: e.target.value }))}
                        className="mt-1 w-full py-4 px-5 border-[1.5px] border-black rounded-xl font-sans text-[0.95rem] text-[#111] outline-none placeholder:text-[#bbb]"
                      />
                    )}

                    {/* Conditional detail field (e.g. Binance UID, lien reason) */}
                    {q.detailFor && answers[q.id] === q.detailFor && (
                      <input
                        type="text"
                        autoFocus
                        placeholder={q.detailPrompt ?? ""}
                        value={answers[`${q.id}_detail`] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [`${q.id}_detail`]: e.target.value }))}
                        className="mt-1 w-full py-4 px-5 border-[1.5px] border-[#e5e5e5] rounded-xl font-sans text-[0.95rem] text-[#111] outline-none focus:border-black placeholder:text-[#bbb]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="font-sans text-sm text-[#e53e3e] mb-5">{error}</p>
            )}

            {process.env.NODE_ENV === "development" && (
              <button
                onClick={devSkip}
                className="w-full py-3 bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-xl font-sans text-sm cursor-pointer mb-3"
              >
                [DEV] Skip Questionnaire
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className={`w-full py-5 border-0 rounded-xl font-sans text-[1rem] font-semibold transition-colors duration-200 ${
                allAnswered && !submitting
                  ? "bg-black text-white cursor-pointer"
                  : "bg-[#f0f0f0] text-[#aaa] cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                  Scoring with AI…
                </span>
              ) : allAnswered ? (
                "Submit Answers →"
              ) : (
                `Answer all questions (${answeredCount} / 10 done)`
              )}
            </button>
          </>
        )}

        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-[#f0f0f0]">
          <span>🔒</span>
          <span className="font-sans text-[0.78rem] text-[#bbb]">
            Answers are used solely for risk assessment and stored securely.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
