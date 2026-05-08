"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const clerk = useClerk();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) router.replace("/onboarding");
  }, [isSignedIn, router]);

  const handleGoogleSignIn = async () => {
    if (loading || !clerk.client) return;
    setLoading(true);
    try {
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/onboarding`,
      });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Left panel ── */}
      <div
        style={{
          flex: "0 0 55%",
          background: "#000",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          overflow: "hidden",
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(212,255,0,0.13) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        {/* Lime gradient fade at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "240px",
            background:
              "linear-gradient(to top, rgba(212,255,0,0.06) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <span
            style={{
              fontFamily: "var(--condensed)",
              fontSize: "1.1rem",
              letterSpacing: "4px",
              color: "#D4FF00",
            }}
          >
            CRYPTOBAZAAR
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "var(--condensed)",
              fontSize: "clamp(3.2rem, 5.5vw, 5.2rem)",
              lineHeight: 0.95,
              letterSpacing: "1px",
              color: "#fff",
              marginBottom: "20px",
            }}
          >
            TRADE USDT.
            <br />
            <span style={{ color: "#D4FF00" }}>STAY INSURED.</span>
          </h1>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.45)",
              maxWidth: "300px",
              lineHeight: 1.65,
            }}
          >
            The only gated P2P exchange in India. Every member verified. Every
            trade insured.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "28px 40px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {[
            { value: "3-Layer", label: "Verification" },
            { value: "0.75%", label: "Insurance Levy" },
            { value: "₹5L", label: "Max Payout" },
            { value: "0", label: "Custody Risk" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: "var(--condensed)",
                  fontSize: "1.9rem",
                  color: "#D4FF00",
                  letterSpacing: "1px",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "64px 56px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "340px" }}>
          <h2
            style={{
              fontFamily: "var(--condensed)",
              fontSize: "2.6rem",
              letterSpacing: "1px",
              color: "#000",
              marginBottom: "8px",
              lineHeight: 1,
            }}
          >
            GET STARTED
          </h2>
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: "0.875rem",
              color: "#777",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            Sign in to begin your verification. Only verified members can trade.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              padding: "13px 20px",
              border: "1.5px solid #e0e0e0",
              borderRadius: "10px",
              background: loading ? "#fafafa" : "#fff",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "var(--sans)",
              fontSize: "0.925rem",
              fontWeight: 500,
              color: "#111",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#bbb";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0e0";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 1px 3px rgba(0,0,0,0.06)";
            }}
          >
            {loading ? (
              <span style={{ opacity: 0.5 }}>Redirecting…</span>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <p
              style={{
                fontFamily: "var(--sans)",
                fontSize: "0.72rem",
                color: "#bbb",
                lineHeight: 1.7,
              }}
            >
              By continuing, you agree to our Terms of Service and Privacy
              Policy. Only Indian residents are eligible to trade on
              CryptoBazaar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
