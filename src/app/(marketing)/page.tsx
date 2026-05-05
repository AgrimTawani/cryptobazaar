import Link from 'next/link'
import {
  ShieldCheck, Lock, ScanFace, FileText,
  MessageSquare, ArrowRight, Check, BadgeCheck, Zap, Wallet,
} from 'lucide-react'
import { HeroSection } from '@/components/marketing/hero-section'
import { FeatureCard } from '@/components/marketing/feature-card'
import { Reveal, RevealGroup, RevealItem } from '@/components/marketing/reveal'
import { AnimatedBorderCard } from '@/components/ui/animated-border-card'
const shimmerLink = 'group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-amber-400 active:scale-[0.98]'

export const metadata = {
  title: 'CryptoBazaar — Trade Crypto P2P Without Bank Freeze Risk',
  description: "India's first gated P2P stablecoin exchange. 3-layer EDD. Smart contract escrow. Bank freeze insurance up to ₹5L.",
}

const pillars = [
  {
    icon: <ScanFace className="h-5 w-5 text-slate-300" strokeWidth={1.5} aria-hidden="true" />,
    title: '3-Layer EDD Verification',
    desc: 'KYC, bank statement ML scoring, and an AI source-of-funds interview. All three must pass before a single trade.',
    accent: false,
  },
  {
    icon: <Lock className="h-5 w-5 text-slate-300" strokeWidth={1.5} aria-hidden="true" />,
    title: 'Smart Contract Escrow',
    desc: "Seller's crypto locks on-chain from the moment a trade opens. CryptoBazaar never touches your funds.",
    accent: false,
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />,
    title: 'Bank Freeze Insurance',
    desc: '0.75% of every trade builds an on-chain fund. Wrongful freeze from a CryptoBazaar trade? Claim up to ₹5,00,000.',
    accent: true,
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-slate-300" strokeWidth={1.5} aria-hidden="true" />,
    title: 'Decentralised Identity',
    desc: 'Hyperledger Identus issues you cryptographic credentials. Your verified status lives on-chain — not on our servers.',
    accent: false,
  },
]

const howItWorks = [
  {
    num: '01',
    icon: <ScanFace className="h-5 w-5 text-slate-300" strokeWidth={1.5} aria-hidden="true" />,
    title: 'Get Verified',
    desc: 'Complete all 3 EDD layers — KYC, bank statement ML, and AI interview. Credentials issued to your on-chain DID.',
  },
  {
    num: '02',
    icon: <Wallet className="h-5 w-5 text-slate-300" strokeWidth={1.5} aria-hidden="true" />,
    title: 'Subscribe',
    desc: 'Pick Starter, Trader, or Pro based on your monthly volume. Your fee funds the INR insurance pool.',
  },
  {
    num: '03',
    icon: <Zap className="h-5 w-5 text-slate-300" strokeWidth={1.5} aria-hidden="true" />,
    title: 'Trade Safely',
    desc: 'Escrow opens. Buyer pays INR bank-to-bank. Seller confirms. Crypto releases. 0.75% flows to insurance.',
  },
]

const eddLayers = [
  {
    num: '01',
    icon: <ScanFace className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />,
    title: 'KYC — Identity Verification',
    time: '~3 min',
    desc: 'Aadhaar OTP, PAN match, liveness check via HyperVerge. Issues a cryptographic KYCCredential to your on-chain DID.',
  },
  {
    num: '02',
    icon: <FileText className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />,
    title: 'Bank Statement EDD',
    time: '~5 min',
    desc: '6 months of statements processed by Perfios. ML model scores for AML patterns — structuring, rapid pass-throughs, counterparty anomalies. Score ≤40 auto-approves. 41–70 human review. 71+ rejected.',
  },
  {
    num: '03',
    icon: <MessageSquare className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />,
    title: 'AI Interview',
    time: '~7 min',
    desc: 'Text questionnaire: source of funds, trading purpose, volume. Claude scores for consistency and red flags. Borderline cases escalate to a video interview.',
  },
]

const trustItems = [
  { icon: <ScanFace className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />, label: 'Aadhaar + PAN KYC', sub: 'via HyperVerge' },
  { icon: <FileText className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />, label: 'Bank Statement ML', sub: 'via Perfios' },
  { icon: <Lock className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />, label: 'On-chain Escrow', sub: 'Polygon · Solana · Tron' },
  { icon: <ShieldCheck className="h-5 w-5 text-amber-400" strokeWidth={1.5} aria-hidden="true" />, label: 'Insurance Fund', sub: 'Up to ₹5,00,000' },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <HeroSection />

      {/* Problem */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div aria-hidden="true" className="section-glow-right pointer-events-none absolute inset-0" />
        <div className="relative max-w-4xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-4 leading-tight tracking-tight">
              Indian P2P traders lose their bank accounts every day.
            </h2>
            <p className="text-base text-slate-400 max-w-2xl mb-12 leading-relaxed">
              Buying crypto from a scammer — even unknowingly — can trace tainted money to your account.
              Police freeze it. You fight alone for months. Standard P2P platforms do nothing.
            </p>
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-2 gap-4" stagger={0.1}>
            <RevealItem>
              <AnimatedBorderCard className="bg-white/2 p-6 rounded-2xl h-full">
                <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-0.5 inline-block mb-4">
                  The Status Quo
                </span>
                <p className="text-sm font-medium text-slate-200 mb-2">The freeze chain</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A buyer pays with scam-sourced money. Police trace it. Every account it touched
                  gets frozen — including yours, even though you had no idea.
                </p>
              </AnimatedBorderCard>
            </RevealItem>
            <RevealItem>
              <AnimatedBorderCard className="bg-amber-500/4 p-6 rounded-2xl h-full">
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 inline-block mb-4">
                  CryptoBazaar
                </span>
                <p className="text-sm font-medium text-slate-200 mb-2">Gated entry + insurance</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Every user is ML-scored for AML risk before they can trade. If a freeze still
                  happens, the on-chain insurance fund covers you up to ₹5,00,000.
                </p>
              </AnimatedBorderCard>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative px-6 py-24 border-t border-white/[0.04]">
        <div aria-hidden="true" className="section-glow-left pointer-events-none absolute inset-0" />
        <div className="relative max-w-4xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Platform Pillars</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-12 leading-tight tracking-tight">
              Built for traders who take risk seriously.
            </h2>
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-2 gap-4" stagger={0.08}>
            {pillars.map((p) => (
              <RevealItem key={p.title}>
                <FeatureCard icon={p.icon} title={p.title} desc={p.desc} accent={p.accent} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-12 leading-tight tracking-tight">
              Three steps to protected trading.
            </h2>
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-3 gap-4" stagger={0.1}>
            {howItWorks.map((step) => (
              <RevealItem key={step.title}>
                <AnimatedBorderCard className="relative bg-white/2 p-6 rounded-2xl h-full flex flex-col gap-4">
                  <span className="absolute top-4 right-5 text-4xl font-bold text-white/4 tabular-nums select-none">
                    {step.num}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </AnimatedBorderCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* EDD Detail */}
      <section className="relative px-6 py-24 border-t border-white/[0.04] overflow-hidden">
        <div aria-hidden="true" className="section-glow-right pointer-events-none absolute inset-0" />
        <div className="relative max-w-3xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Verification</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-3 leading-tight tracking-tight">
              The hardest gate on any Indian P2P platform.
            </h2>
            <p className="text-sm text-slate-400 mb-12 max-w-lg leading-relaxed">
              All three layers must be passed and unexpired to trade. Credentials refresh every 6 months.
            </p>
          </Reveal>
          <RevealGroup className="space-y-3" stagger={0.1}>
            {eddLayers.map((layer) => (
              <RevealItem key={layer.num}>
                <AnimatedBorderCard className="flex gap-5 bg-white/2 p-5 rounded-2xl">
                  <div className="shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                      {layer.icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-slate-600">{layer.num}</span>
                      <h3 className="text-sm font-semibold text-slate-100">{layer.title}</h3>
                      <span className="ml-auto text-xs text-slate-600 font-mono shrink-0">{layer.time}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{layer.desc}</p>
                  </div>
                </AnimatedBorderCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Assets */}
      <section className="px-6 py-16 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-8">
              Supported Assets &amp; Networks
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {['USDT · Polygon', 'USDT · Solana', 'USDT · Tron TRC-20', 'USDC · Polygon', 'USDC · Solana'].map((a) => (
                <span key={a} className="rounded-full border border-white/8 bg-white/2 px-4 py-1.5 text-xs text-slate-400 font-mono">
                  {a}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-5">
              Cross-chain USDC · Circle CCTP v2 &nbsp;·&nbsp; Cross-chain USDT · Wormhole
            </p>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative px-6 py-24 border-t border-white/[0.04] overflow-hidden">
        <div aria-hidden="true" className="section-glow-center pointer-events-none absolute inset-0" />
        <div className="relative max-w-4xl mx-auto">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-3 leading-tight tracking-tight">
              Simple monthly subscription.
            </h2>
            <p className="text-sm text-slate-400 mb-12 max-w-md leading-relaxed">
              Your subscription directly funds the INR insurance pool. The more members, the larger the coverage for everyone.
            </p>
          </Reveal>
          <RevealGroup className="grid sm:grid-cols-3 gap-4 mb-6" stagger={0.08}>
            {[
              { name: 'Starter', price: '₹200', cap: '₹5L / month', highlight: false, features: ['3-Layer EDD', 'Smart contract escrow', 'Insurance eligibility', 'UPI · IMPS · NEFT'] },
              { name: 'Trader', price: '₹500', cap: '₹20L / month', highlight: true, features: ['Everything in Starter', '₹20L monthly cap', 'Priority dispute resolution', 'Priority support'] },
              { name: 'Pro', price: '₹1,000', cap: 'Unlimited', highlight: false, features: ['Everything in Trader', 'Unlimited cap', 'Dedicated compliance agent', 'Phone support'] },
            ].map((tier) => (
              <RevealItem key={tier.name}>
                <AnimatedBorderCard
                  containerClassName="h-full"
                  className={`relative flex flex-col rounded-2xl p-6 h-full ${tier.highlight ? 'bg-amber-500/4' : 'bg-white/2'}`}
                >
                  {tier.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-amber-400 bg-[#020617] border border-amber-500/30 rounded-full px-3 py-0.5 whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-slate-300 mb-2">{tier.name}</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-3xl font-bold text-slate-50 tabular-nums">{tier.price}</span>
                      <span className="text-sm text-slate-500">/mo</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Cap: {tier.cap}</p>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                        <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`text-sm font-semibold text-center py-2.5 rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      tier.highlight
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'border border-white/8 bg-white/3 text-slate-300 hover:bg-white/7 hover:text-white'
                    }`}
                  >
                    Get Started
                  </Link>
                </AnimatedBorderCard>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal>
            <p className="text-center text-xs text-slate-600">
              All plans require 3-layer EDD before first trade.{' '}
              <Link href="/pricing" className="text-slate-400 hover:text-slate-200 underline underline-offset-2 cursor-pointer">
                See full pricing details &rarr;
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-6 py-12 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/4 rounded-2xl overflow-hidden border border-white/4">
              {trustItems.map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 bg-[#020617] px-4 py-6 text-center">
                  {item.icon}
                  <p className="text-xs font-medium text-slate-300">{item.label}</p>
                  <p className="text-xs text-slate-600">{item.sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-24 border-t border-white/[0.04] overflow-hidden">
        <div aria-hidden="true" className="section-glow-center pointer-events-none absolute inset-0" />
        <div className="relative max-w-2xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-4 leading-tight tracking-tight">
              Ready to trade without the risk?
            </h2>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Complete EDD in ~15 minutes. Pick your tier. Trade USDT and USDC with verified
              counterparties only — backed by on-chain insurance.
            </p>
            <Link href="/login" className={shimmerLink}>
              Apply for Early Access
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="text-xs text-slate-600 mt-4">
              Invite-only beta &nbsp;·&nbsp; India only &nbsp;·&nbsp; USDT &amp; USDC
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
