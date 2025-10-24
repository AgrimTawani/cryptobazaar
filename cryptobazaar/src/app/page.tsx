"use client";

import { ShieldCheck, Zap, TrendingUp, Lock, Sparkles, ArrowRight, CheckCircle2, AlertCircle, DollarSign, Users, Globe, ChevronDown } from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-black to-orange-900/10" />
      
      <Navbar />
      <main className="relative flex-grow z-10">
        <HeroSection />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { openSignIn } = useClerk();
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    await openSignIn({
      forceRedirectUrl: "/post-login",
      signUpForceRedirectUrl: "/post-login",
    });
  }, [openSignIn]);

  const handleDashboard = useCallback(() => {
    router.push("/exchange/profile");
  }, [router]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-6 backdrop-blur-md bg-transparent">
      <nav className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            CryptoBazaar
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('why-choose-us')}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Why Choose Us
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            FAQs
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {isSignedIn ? (
            <button 
              onClick={handleDashboard} 
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
            >
              Profile
            </button>
          ) : (
            <button 
              onClick={handleLogin} 
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
            >
              Login
            </button>
          )}
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

// How It Works Section
function HowItWorksSection() {
  const { openSignIn } = useClerk();
  
  return (
    <section id="how-it-works" className="relative py-24 px-6 border-t border-neutral-800">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 bg-neutral-800/50 border border-neutral-700 rounded-full">
            <span className="text-sm text-neutral-400">📖 Simple & Secure</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Trade USDC for INR directly with other users. Our smart contract escrow system ensures your funds are safe throughout the entire transaction.
          </p>
        </div>

        {/* The P2P Flow */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Seller Side */}
          <div className="relative p-8 rounded-xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10">
              <div className="absolute top-4 right-4 px-3 py-1 bg-neutral-800 rounded-full">
                <span className="text-xs font-semibold text-neutral-400">SELLER</span>
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6 mt-4">
                Selling USDC
              </h3>
              
              <div className="space-y-4">
                <StepCard 
                  number={1}
                  title="Connect Wallet"
                  description="Sign in with Google and connect your MetaMask wallet to CryptoBazaar"
                  icon={<Globe className="w-5 h-5" />}
                />
                <StepCard 
                  number={2}
                  title="Create Sell Order"
                  description="Enter the amount of USDC you want to sell and set your INR price per USDC"
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <StepCard 
                  number={3}
                  title="USDC Gets Locked"
                  description="Your USDC is automatically locked in our smart contract escrow - keeping it safe"
                  icon={<Lock className="w-5 h-5" />}
                />
                <StepCard 
                  number={4}
                  title="Wait for Buyer"
                  description="Your order appears in the marketplace. Buyers can see your offer and purchase it"
                  icon={<Users className="w-5 h-5" />}
                />
                <StepCard 
                  number={5}
                  title="Receive INR Payment"
                  description="Buyer pays you INR directly to your bank account via secure payment gateway"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                />
                <StepCard 
                  number={6}
                  title="USDC Released"
                  description="Once payment is confirmed, the smart contract automatically releases USDC to the buyer's wallet"
                  icon={<Zap className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>

          {/* Buyer Side */}
          <div className="relative p-8 rounded-xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10">
              <div className="absolute top-4 right-4 px-3 py-1 bg-neutral-800 rounded-full">
                <span className="text-xs font-semibold text-neutral-400">BUYER</span>
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6 mt-4">
                Buying USDC
              </h3>
              
              <div className="space-y-4">
                <StepCard 
                  number={1}
                  title="Connect Wallet"
                  description="Sign in with Google and connect your MetaMask wallet to CryptoBazaar"
                  icon={<Globe className="w-5 h-5" />}
                />
                <StepCard 
                  number={2}
                  title="Browse Sell Orders"
                  description="View all available USDC sell orders from different sellers with their prices"
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <StepCard 
                  number={3}
                  title="Select an Order"
                  description="Choose the best offer that matches your needs (amount and price)"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                />
                <StepCard 
                  number={4}
                  title="Pay INR"
                  description="Pay the seller's INR amount directly to their bank account using our secure payment system"
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <StepCard 
                  number={5}
                  title="Payment Confirmed"
                  description="System verifies your payment and confirms the transaction"
                  icon={<ShieldCheck className="w-5 h-5" />}
                />
                <StepCard 
                  number={6}
                  title="Receive USDC"
                  description="Smart contract automatically releases USDC from escrow directly to your wallet"
                  icon={<Sparkles className="w-5 h-5" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="text-center">
          <div className="inline-flex items-center gap-8 p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-neutral-300">Smart Contract Escrow</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-neutral-300">Bank Freeze Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-neutral-300">Instant Settlement</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => openSignIn()}
            className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/50"
          >
            Start Trading Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

// Step Card Component
function StepCard({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-sm font-bold text-white">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-neutral-400">{icon}</div>
          <h4 className="font-semibold text-white">{title}</h4>
        </div>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

// Why Choose Us Section
function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="relative py-24 px-6 border-t border-neutral-800">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 bg-neutral-800/50 border border-neutral-700 rounded-full">
            <span className="text-sm text-neutral-400">🏆 World&apos;s First</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
            Why Choose CryptoBazaar?
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Revolutionary P2P trading with complete automation and bank account protection
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1: Bank Freeze Protection */}
          <div className="group relative p-8 rounded-xl bg-gradient-to-br from-green-500/5 to-neutral-950 border border-neutral-800 hover:border-green-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10">
              <div className="inline-flex p-4 rounded-lg bg-neutral-900 mb-6 group-hover:bg-neutral-800 transition-colors">
                <ShieldCheck className="w-10 h-10 text-neutral-400 group-hover:text-green-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Zero Bank Freeze Risk
              </h3>
              <p className="text-neutral-400 leading-relaxed mb-4">
                Your personal bank account <span className="text-green-400 font-semibold">never touches P2P transactions</span>. We act as the trusted intermediary for all INR payments.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">All INR payments go through our verified payment gateway</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Your bank sees only legitimate business transactions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">No direct peer-to-peer bank transfers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Complete protection from suspicious activity flags</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Fully Automated */}
          <div className="group relative p-8 rounded-xl bg-gradient-to-br from-blue-500/5 to-neutral-950 border border-neutral-800 hover:border-blue-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10">
              <div className="inline-flex p-4 rounded-lg bg-neutral-900 mb-6 group-hover:bg-neutral-800 transition-colors">
                <Zap className="w-10 h-10 text-neutral-400 group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="inline-block mb-4 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="text-xs font-bold text-blue-400">WORLD&apos;S FIRST</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                100% Automated P2P
              </h3>
              <p className="text-neutral-400 leading-relaxed mb-4">
                The <span className="text-blue-400 font-semibold">first-ever fully automated P2P crypto exchange</span>. No manual approvals, no waiting for confirmations.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Smart contracts automatically lock and release USDC</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Instant payment verification through our gateway</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Zero human intervention needed</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Trades complete in minutes, not hours or days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: 24/7 Support */}
          <div className="group relative p-8 rounded-xl bg-gradient-to-br from-purple-500/5 to-neutral-950 border border-neutral-800 hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            <div className="relative z-10">
              <div className="inline-flex p-4 rounded-lg bg-neutral-900 mb-6 group-hover:bg-neutral-800 transition-colors">
                <Users className="w-10 h-10 text-neutral-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                24/7 Expert Support
              </h3>
              <p className="text-neutral-400 leading-relaxed mb-4">
                Real humans ready to help you <span className="text-purple-400 font-semibold">anytime, anywhere</span>. Never face an issue alone.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Live support available round the clock</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Instant dispute resolution by our team</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Expert guidance for new users</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-500">Multi-channel support (chat, email, phone)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <div className="inline-block mb-8 px-4 py-1.5 bg-neutral-800/50 border border-neutral-700 rounded-full">
            <span className="text-sm text-neutral-400">🔒 Trusted by Thousands</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <TrustCard value="$10M+" label="Total Volume Traded" />
            <TrustCard value="50K+" label="Active Users" />
            <TrustCard value="0" label="Bank Freezes Ever" />
            <TrustCard value="15 Min" label="Average Trade Time" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, accentColor }: { icon: React.ReactNode; title: string; description: string; accentColor: string }) {
  const colorMap: { [key: string]: { bg: string; hover: string; icon: string; border: string } } = {
    green: { bg: "from-green-500/5", hover: "group-hover:from-green-500/10", icon: "group-hover:text-green-400", border: "group-hover:border-green-500/20" },
    blue: { bg: "from-blue-500/5", hover: "group-hover:from-blue-500/10", icon: "group-hover:text-blue-400", border: "group-hover:border-blue-500/20" },
    yellow: { bg: "from-yellow-500/5", hover: "group-hover:from-yellow-500/10", icon: "group-hover:text-yellow-400", border: "group-hover:border-yellow-500/20" },
    purple: { bg: "from-purple-500/5", hover: "group-hover:from-purple-500/10", icon: "group-hover:text-purple-400", border: "group-hover:border-purple-500/20" },
    pink: { bg: "from-pink-500/5", hover: "group-hover:from-pink-500/10", icon: "group-hover:text-pink-400", border: "group-hover:border-pink-500/20" },
    cyan: { bg: "from-cyan-500/5", hover: "group-hover:from-cyan-500/10", icon: "group-hover:text-cyan-400", border: "group-hover:border-cyan-500/20" },
  };
  
  const colors = colorMap[accentColor] || colorMap.green;
  
  return (
    <div className={`group relative p-6 rounded-xl bg-gradient-to-br ${colors.bg} to-neutral-950 border border-neutral-800 ${colors.border} hover:border-neutral-700 transition-all duration-300`}>
      <div className="inline-flex p-3 rounded-lg bg-neutral-900 mb-4 group-hover:bg-neutral-800 transition-colors">
        <div className={`text-neutral-400 ${colors.icon} transition-colors`}>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TrustCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6 rounded-xl bg-neutral-950 border border-neutral-800">
      <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
        {value}
      </div>
      <div className="text-sm text-neutral-500">{label}</div>
    </div>
  );
}

// FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does CryptoBazaar protect me from bank freezes?",
      answer: "Traditional P2P platforms require direct bank transfers between users, which banks often flag as suspicious. CryptoBazaar uses smart contract escrow - your USDC is locked on the blockchain, not in your bank. INR payments happen through our verified payment gateway, keeping your bank account safe."
    },
    {
      question: "What is smart contract escrow and how does it work?",
      answer: "A smart contract is code running on the blockchain that automatically executes when conditions are met. When you create a sell order, your USDC is locked in the smart contract. Once the buyer pays INR and we verify it, the contract automatically releases USDC to the buyer. No human can interfere with this process."
    },
    {
      question: "Is my money safe? What if the other person doesn't pay?",
      answer: "Your USDC is 100% safe in the smart contract escrow. If a buyer doesn't complete the INR payment within the time limit, the order is automatically cancelled and your USDC is returned to your wallet. No manual intervention needed."
    },
    {
      question: "How long does a trade take?",
      answer: "Most trades complete within 15-30 minutes. Once you create a sell order, buyers can see it immediately. After a buyer pays INR, we verify the payment (usually instant) and the smart contract releases USDC immediately."
    },
    {
      question: "What are the fees?",
      answer: "CryptoBazaar charges a small 0.5% fee on completed trades. This is much lower than traditional exchanges because we don't have middleman costs. Sellers set their own rates, so you get competitive prices."
    },
    {
      question: "Do I need KYC verification?",
      answer: "Yes, we require basic KYC (Google sign-in and bank account verification) to comply with Indian regulations and prevent fraud. This protects both buyers and sellers and keeps the platform safe."
    },
    {
      question: "Which cryptocurrencies can I trade?",
      answer: "Currently, we support USDC (USD Coin) trading for INR. USDC is a stablecoin pegged to the US Dollar, which means it doesn't have the price volatility of Bitcoin or Ethereum."
    },
    {
      question: "What wallets are supported?",
      answer: "We support MetaMask and any WalletConnect-compatible wallet. You need a wallet that works with Polygon Amoy network (testnet) for testing, and Polygon mainnet for real trading."
    },
    {
      question: "What if I have a dispute with a buyer/seller?",
      answer: "Our support team is available 24/7 to help resolve disputes. Since all transactions are recorded on the blockchain and payment gateway, we can verify what happened and resolve issues fairly."
    },
    {
      question: "Can I cancel my sell order?",
      answer: "Yes! If no one has purchased your order yet, you can cancel it anytime. Your USDC will be immediately returned from the smart contract to your wallet."
    }
  ];

  return (
    <section id="faq" className="relative py-24 px-6 border-t border-neutral-800">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 bg-neutral-800/50 border border-neutral-700 rounded-full">
            <span className="text-sm text-neutral-400">❓ Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400 text-lg">
            Everything you need to know about trading on CryptoBazaar
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-neutral-900/50 transition-colors"
              >
                <span className="font-semibold text-white pr-8">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}>
                <div className="px-6 pb-6 border-t border-neutral-800">
                  <p className="text-neutral-400 leading-relaxed pt-4">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
            <p className="text-neutral-400 mb-6">Our support team is here to help you 24/7</p>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/30">
              Contact Support
            </button>
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
