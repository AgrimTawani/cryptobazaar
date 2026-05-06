"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function BankStatementPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    // Simulate an ML upload and scoring process
    setTimeout(() => {
      setUploading(false);
      // Move to next step (for now, just alert or go back home)
      alert("Bank statement uploaded successfully and ML scoring complete!");
      router.push("/");
    }, 2000);
  };

  return (
    <motion.div 
      className="signup-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="signup-step">Step 02</div>
      <h1 className="signup-title">Upload Bank Statement</h1>
      <p className="signup-desc">
        To complete your EDD, please upload your last 6 months' bank statement. 
        Our ML model will securely analyze this to assign your trust score.
      </p>

      <div className="upload-zone">
        <input 
          type="file" 
          id="statement" 
          accept=".pdf" 
          onChange={handleFileChange} 
          style={{ display: "none" }} 
        />
        <label htmlFor="statement" className="cursor-pointer flex flex-col items-center">
          <div className="text-4xl mb-4">📄</div>
          {file ? (
            <div className="text-center font-sans">
              <p className="font-bold">{file.name}</p>
              <p className="text-sm text-gray-500 mt-2">Click to replace</p>
            </div>
          ) : (
            <div className="text-center font-sans">
              <p className="font-bold">Click to upload PDF</p>
              <p className="text-sm text-gray-500 mt-2">Max file size: 10MB</p>
            </div>
          )}
        </label>
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!file || uploading} 
        className={`w-full py-3 rounded-md font-condensed text-xl tracking-wider uppercase transition-all ${
          file && !uploading ? "bg-[#D4FF00] text-black hover:bg-[#c2eb00]" : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {uploading ? "Analyzing..." : "Submit Statement"}
      </button>

      <div className="sec-badge mt-6 font-sans">
        <span className="text-xl">🔒</span> Data is analyzed and discarded instantly
      </div>
    </motion.div>
  );
}
