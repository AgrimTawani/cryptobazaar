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
          Step 02 of 04
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
          Bank Statement Review
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
          Upload your last 6 months of bank statements. Our ML system checks for
          income patterns and flags. PDF only, max 10MB.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${file ? "#D4FF00" : "#ddd"}`,
            borderRadius: "14px",
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: file ? "rgba(212,255,0,0.04)" : "#fafafa",
            transition: "border-color 0.2s, background 0.2s",
            marginBottom: "20px",
          }}
        >
          {file ? (
            <>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📄</div>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: "4px",
                }}
              >
                {file.name}
              </p>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.75rem",
                  color: "#999",
                  marginBottom: "12px",
                }}
              >
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.75rem",
                  color: "#999",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Replace file
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📁</div>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#333",
                  marginBottom: "4px",
                }}
              >
                Drop your PDF here
              </p>
              <p
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.78rem",
                  color: "#aaa",
                }}
              >
                or click to browse
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {error && (
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.8rem",
              color: "#e53e3e",
              marginBottom: "16px",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || analyzing}
          style={{
            width: "100%",
            padding: "14px",
            background: file && !analyzing ? "#000" : "#f0f0f0",
            color: file && !analyzing ? "#fff" : "#aaa",
            border: "none",
            borderRadius: "10px",
            fontFamily: "var(--sans)",
            fontSize: "0.925rem",
            fontWeight: 600,
            cursor: file && !analyzing ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          {analyzing ? "Analysing…" : "Submit Statement →"}
        </button>

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
            Analysed and discarded instantly. Never stored on our servers.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
