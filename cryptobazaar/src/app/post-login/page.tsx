"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostLoginPage() {
  const router = useRouter();

  useEffect(() => {
    const handlePostLogin = async () => {
      try {
        // Call the post-login API to upsert user and check onboarding status
        const res = await fetch("/api/auth/post-login", { method: "POST" });
        
        if (!res.ok) {
          console.error("Failed to process post-login");
          router.replace("/");
          return;
        }

        const data = await res.json();
        
        // Redirect based on onboarding status
        if (data.onboarded) {
          router.replace("/exchange");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Error during post-login:", error);
        router.replace("/");
      }
    };

    handlePostLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
        <p className="text-sm text-neutral-400">Setting up your account…</p>
      </div>
    </div>
  );
}
