"use client";

import { ShieldCheck, Zap, TrendingUp, Lock, Sparkles } from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-black to-orange-900/10" />
      
      <Navbar />
      <main className="relative flex-grow z-10">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { openSignIn } = useClerk();

  const handleLogin = useCallback(async () => {
    await openSignIn({
      forceRedirectUrl: "/post-login",
      signUpForceRedirectUrl: "/post-login",
      // Prefer Google as provider in the modal; Clerk project config must enable Google OAuth
      // Clerk handles the actual OAuth selection UI.
    });
    // After redirect, we'll upsert the user in DB via a server endpoint.
  }, [openSignIn]);
  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-6">
      <nav className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            CryptoBazaar
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleLogin} className="px-6 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50">
            Login
          </button>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative text-center py-20 md:py-32 px-6">
      {/* Spotlight Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 via-transparent to-transparent" />
      
      <div className="relative container mx-auto">
        <div className="inline-block mb-6 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <span className="text-sm text-yellow-300">🚀 Legally Compliant & Secure</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-9xl font-extrabold leading-tight mb-2 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent relative z-20">
          CryptoBazaar
        </h1>

        {/* Sparkles Effect - Seamlessly integrated */}
        <div className="w-full max-w-5xl mx-auto h-48 relative -mt-4 mb-4">
          {/* Gradients - Yellow/Ochre theme */}
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-yellow-500 to-transparent h-[2px] w-3/4 blur-sm mx-auto left-0 right-0" />
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-yellow-500 to-transparent h-px w-3/4 mx-auto left-0 right-0" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent h-[5px] w-1/4 blur-sm mx-auto left-0 right-0" />
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent h-px w-1/4 mx-auto left-0 right-0" />

          {/* Core component */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FCD34D"
          />

          {/* Radial Gradient to prevent sharp edges - more subtle */}
          <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(400px_250px_at_top,transparent_10%,white)]"></div>
        </div>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 relative z-20">
          The Future of Secure & Automated P2P Trading. Trade with confidence while we protect you from bank freezes.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
          <button className="group relative px-8 py-4 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-500/50">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
          </button>
          
          <button className="px-8 py-4 text-lg font-semibold text-white rounded-xl border border-white/20 hover:bg-white/5 transition-all duration-300 transform hover:scale-105">
            Learn More
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto relative z-20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
              $10M+
            </div>
            <div className="text-sm text-gray-400">Trading Volume</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              50K+
            </div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-xl py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                CryptoBazaar
              </span>
            </div>
            <p className="text-gray-400 text-sm">&copy; 2025 CryptoBazaar. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
