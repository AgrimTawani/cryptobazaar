"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sparkles, Bitcoin, TrendingUp, Shield, Zap } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstname") as string,
      lastName: formData.get("lastname") as string,
      address: formData.get("address") as string,
      age: formData.get("age") as string,
      pan: formData.get("pan") as string,
    };

    try {
      console.log("Submitting onboarding data:", data);
      
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const error = await res.json();
        console.error("API error:", error);
        throw new Error(error.error || "Failed to save profile");
      }

      const result = await res.json();
      console.log("Success:", result);

      // Redirect to exchange after successful onboarding
      router.push("/exchange");
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black relative overflow-hidden">
      
      {/* Left Side - Form */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-8 bg-neutral-950">
        {/* Background Effects for Left */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md p-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Fill in your details to start trading on CryptoBazaar.
          </p>

          <form className="my-8" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <LabelInputContainer>
                <Label htmlFor="firstname">First name</Label>
                <Input 
                  id="firstname" 
                  name="firstname" 
                  placeholder="John" 
                  type="text" 
                  required 
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname">Last name</Label>
                <Input 
                  id="lastname" 
                  name="lastname" 
                  placeholder="Doe" 
                  type="text" 
                  required 
                />
              </LabelInputContainer>
            </div>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="123 Market Street, City" 
                type="text" 
                required 
              />
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                name="age" 
                placeholder="21" 
                type="number" 
                required 
                min="18"
              />
            </LabelInputContainer>

            <LabelInputContainer className="mb-8">
              <Label htmlFor="pan">PAN Card No.</Label>
              <Input 
                id="pan" 
                name="pan" 
                placeholder="ABCDE1234F" 
                type="text" 
                required 
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Please enter a valid PAN number (e.g., ABCDE1234F)"
                className="uppercase"
              />
            </LabelInputContainer>

            <button
              className="relative block h-11 w-full rounded-md bg-gradient-to-r from-yellow-600 to-orange-600 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Profile →"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Crypto Visual */}
      <div className="hidden lg:flex relative w-1/2 items-center justify-center p-8 bg-gradient-to-br from-yellow-900/20 via-black to-orange-900/20">
        {/* Background Effects for Right */}
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:50px_50px] pointer-events-none" />
        <div className="relative w-full max-w-lg">
          {/* Logo at top */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              CryptoBazaar
            </span>
          </div>

          {/* Central Bitcoin Icon */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-64 h-64 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
            <Bitcoin className="relative w-40 h-40 text-yellow-500" />
          </div>

          {/* Floating Cards */}
          <div className="absolute top-10 right-0 bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-neutral-400">24h Volume</p>
                <p className="text-lg font-bold text-white">$10M+</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-0 bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-neutral-400">Secure Trading</p>
                <p className="text-lg font-bold text-white">100%</p>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 -right-10 bg-neutral-900/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-xs text-neutral-400">Fast Transactions</p>
                <p className="text-lg font-bold text-white">Instant</p>
              </div>
            </div>
          </div>

          {/* Decorative crypto symbols */}
          <div className="absolute top-20 left-10 text-6xl opacity-10 font-bold text-yellow-500">₿</div>
          <div className="absolute bottom-20 right-10 text-6xl opacity-10 font-bold text-orange-500">Ξ</div>
        </div>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
