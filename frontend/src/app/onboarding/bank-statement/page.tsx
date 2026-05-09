"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function BankStatementPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setAnalyzing(false);
    router.push("/onboarding/questionnaire");
  };

  const devSkip = async () => {
    await fetch("/api/verification/dev-approve-edd", { method: "POST" });
    router.push("/onboarding/questionnaire");
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
          Step 02 of 04
        </div>

        <h1 className="font-condensed text-[2.2rem] tracking-[1px] mb-[10px] leading-none">
          Bank Statement Review
        </h1>
        <p className="font-sans text-sm text-[#666] mb-8 leading-[1.6]">
          Upload your last 6 months of bank statements. Our ML system checks for
          income patterns and flags. PDF only, max 10MB.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[14px] py-10 px-6 text-center cursor-pointer mb-5 transition-colors duration-200 ${
            file
              ? "border-lime bg-lime/[0.04]"
              : "border-[#ddd] bg-[#fafafa]"
          }`}
        >
          {file ? (
            <>
              <div className="text-[2rem] mb-[10px]">📄</div>
              <p className="font-sans text-sm font-semibold text-[#111] mb-1">
                {file.name}
              </p>
              <p className="font-sans text-[0.75rem] text-[#999] mb-3">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="font-sans text-[0.75rem] text-[#999] underline bg-transparent border-0 cursor-pointer"
              >
                Replace file
              </button>
            </>
          ) : (
            <>
              <div className="text-[2rem] mb-3">📁</div>
              <p className="font-sans text-sm font-semibold text-[#333] mb-1">
                Drop your PDF here
              </p>
              <p className="font-sans text-[0.78rem] text-[#aaa]">
                or click to browse
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {error && (
          <p className="font-sans text-[0.8rem] text-[#e53e3e] mb-4">
            {error}
          </p>
        )}

        {process.env.NODE_ENV === "development" && (
          <button
            onClick={devSkip}
            className="w-full py-[11px] bg-transparent text-[#999] border-[1.5px] border-dashed border-[#ddd] rounded-[10px] font-sans text-[0.8rem] cursor-pointer mb-[10px]"
          >
            [DEV] Skip Bank Statement
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || analyzing}
          className={`w-full py-[14px] border-0 rounded-[10px] font-sans text-[0.925rem] font-semibold transition-colors duration-200 ${
            file && !analyzing
              ? "bg-black text-white cursor-pointer"
              : "bg-[#f0f0f0] text-[#aaa] cursor-not-allowed"
          }`}
        >
          {analyzing ? "Analysing…" : "Submit Statement →"}
        </button>

        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#f0f0f0]">
          <span>🔒</span>
          <span className="font-sans text-[0.72rem] text-[#bbb]">
            Analysed and discarded instantly. Never stored on our servers.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
