"use client";

import { useState, useEffect } from "react";
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
    window.open(url, 'DiditVerification', `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);
  };

  const startKYC = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verification/create", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start verification");
      }

      const data = await response.json();
      
      if (data.sessionUrl) {
        setSessionUrl(data.sessionUrl);
        openPopup(data.sessionUrl);
      } else {
        throw new Error("No session URL returned");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="signup-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="signup-step">Step 01</div>
      <h1 className="signup-title">Identity Verification</h1>
      <p className="signup-desc">
        We use Didit to securely verify your identity. Your data is never stored on our servers.
      </p>

      {sessionUrl ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px', marginBottom: '20px' }}></div>
          <h3 style={{ fontFamily: 'var(--condensed)', fontSize: '1.8rem', letterSpacing: '1px', marginBottom: '8px' }}>Waiting for Verification</h3>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '28px', lineHeight: '1.5' }}>
            Please complete the verification process in the secure popup window.
          </p>
          
          <button 
            onClick={() => router.push("/signup/bank-statement")}
            className="btn-kyc"
            style={{ width: '100%', marginBottom: '12px' }}
          >
            I have completed verification &rarr;
          </button>
          
          <button 
            onClick={() => openPopup(sessionUrl)}
            style={{ fontFamily: 'var(--sans)', fontSize: '0.85rem', color: '#555', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Click here to reopen popup
          </button>
        </div>
      ) : (
        <div className="kyc-area">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="spinner"></div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', fontFamily: 'var(--sans)' }}>Initializing secure session...</p>
            </div>
          ) : (
            <button onClick={startKYC} className="btn-kyc">
              Verify with Didit
            </button>
          )}
          {error && <p className="error-msg mt-4 font-sans">{error}</p>}
        </div>
      )}

      {!sessionUrl && (
        <div className="sec-badge mt-6 font-sans">
          <span className="text-xl">🔒</span> End-to-end encrypted
        </div>
      )}
    </motion.div>
  );
}
