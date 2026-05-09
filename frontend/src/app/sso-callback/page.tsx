"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-5">
        <span className="font-condensed text-[1.2rem] tracking-[4px] text-black">
          CRYPTOBAZAAR
        </span>
        <div className="w-9 h-9 border-[3px] border-lime border-t-transparent rounded-full animate-spin-fast" />
        <p className="font-sans text-[0.85rem] text-[#999]">
          Signing you in…
        </p>
      </div>
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/onboarding"
        signUpForceRedirectUrl="/onboarding"
      />
    </>
  );
}
