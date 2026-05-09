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
    <div className="flex h-screen overflow-hidden">
      {/* ── Left panel ── */}
      <div className="basis-[55%] shrink-0 bg-black relative flex flex-col justify-between py-12 px-14 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(circle,rgba(212,255,0,0.13)_1.5px,transparent_1.5px)] [background-size:28px_28px]" />

        {/* Lime gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[240px] pointer-events-none [background:linear-gradient(to_top,rgba(212,255,0,0.06)_0%,transparent_100%)]" />

        {/* Logo */}
        <div className="relative z-[1]">
          <span className="font-condensed text-[1.1rem] tracking-[4px] text-lime">
            CRYPTOBAZAAR
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-[1]">
          <h1 className="font-condensed text-[clamp(3.2rem,5.5vw,5.2rem)] leading-[0.95] tracking-[1px] text-white mb-5">
            TRADE USDT.
            <br />
            <span className="text-lime">STAY INSURED.</span>
          </h1>
          <p className="font-sans text-[0.9rem] text-white/[0.45] max-w-[300px] leading-[1.65]">
            The only gated P2P exchange in India. Every member verified. Every
            trade insured.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-[28px_40px] relative z-[1]">
          {[
            { value: "3-Layer", label: "Verification" },
            { value: "0.75%", label: "Insurance Levy" },
            { value: "₹5L", label: "Max Payout" },
            { value: "0", label: "Custody Risk" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-condensed text-[1.9rem] text-lime tracking-[1px] leading-none">
                {stat.value}
              </div>
              <div className="font-sans text-[0.7rem] text-white/[0.35] tracking-[1.5px] uppercase mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 bg-white flex flex-col justify-center items-start py-16 px-14">
        <div className="w-full max-w-[340px]">
          <h2 className="font-condensed text-[2.6rem] tracking-[1px] text-black mb-2 leading-none">
            GET STARTED
          </h2>
          <p className="font-sans text-sm text-[#777] mb-10 leading-[1.6]">
            Sign in to begin your verification. Only verified members can trade.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`flex items-center justify-center gap-3 w-full py-[13px] px-5 border-[1.5px] border-solid border-[#e0e0e0] rounded-[10px] font-sans text-[0.925rem] font-medium text-[#111] transition-all duration-150 shadow-sm hover:border-[#bbb] hover:shadow-md ${loading ? "bg-[#fafafa] cursor-wait" : "bg-white cursor-pointer"}`}
          >
            {loading ? (
              <span className="opacity-50">Redirecting…</span>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-5 pt-5 border-t border-[#f0f0f0]">
            <p className="font-sans text-[0.72rem] text-[#bbb] leading-[1.7]">
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
