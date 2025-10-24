"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExchangePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to profile
    router.push("/exchange/profile");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent"></div>
        <p className="mt-4 text-neutral-400">Redirecting to profile...</p>
      </div>
    </div>
  );
}
