"use client";

import { useEffect } from "react";

export default function KYCCallbackPage() {
  useEffect(() => {
    // Signal the opener (KYC page) that verification is done, then close
    if (window.opener) {
      window.opener.postMessage("didit:complete", window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-[2.5rem] mb-4">✓</div>
      <h1 className="font-condensed text-[1.8rem] tracking-[1px] text-black mb-2">
        Verification Complete
      </h1>
      <p className="font-sans text-sm text-[#888]">
        You can close this window and return to the app.
      </p>
    </div>
  );
}
