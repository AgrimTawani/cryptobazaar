import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  Wallet,
  ScanFace,
  FileText,
  MessageSquare,
  ArrowRight,
  Check,
  BadgeCheck,
} from 'lucide-react'

export const metadata = {
  title: 'CryptoBazaar — Trade Crypto P2P Without Bank Freeze Risk',
  description:
    'India\'s first gated P2P stablecoin exchange. Every trader is vetted through 3 layers of EDD. Smart contract escrow. Insurance fund. Trade USDT and USDC safely.',
}

const steps = [
  {
    num: '01',
    icon: ScanFace,
    title: 'Get Verified',
    desc: 'Pass KYC (Aadhaar + PAN), bank statement ML scoring, and an AI interview. All 3 layers required. Takes about 15 minutes.',
  },
  {
    num: '02',
    icon: Wallet,
    title: 'Subscribe',
    desc: 'Pick a monthly tier — Starter, Trader, or Pro — based on your trading volume. Your subscription also funds the INR insurance pool.',
  },
  {
    num: '03',
    icon: ShieldCheck,
    title: 'Trade Safely',
    desc: 'USDT/USDC locks in a smart contract escrow. You confirm INR receipt before it releases. 0.75% of every trade flows into the insurance fund.',
  },
]

const pillars = [
  {
    icon: ScanFace,
    title: '3-Layer EDD',
    desc: 'KYC via HyperVerge, bank statement ML scoring for AML patterns, and an AI-evaluated source-of-funds interview. All three must pass.',
  },
  {
    icon: Lock,
    title: 'Smart Contract Escrow',
    desc: 'Seller\'s USDT/USDC is locked on-chain from the moment a trade starts. CryptoBazaar never touches your funds.',
  },
  {
    icon: ShieldCheck,
    title: 'Insurance Fund',
    desc: '0.75% of every trade builds an on-chain pool. If your bank account gets frozen from a CryptoBazaar trade, you can claim up to ₹5,00,000.',
  },
  {
    icon: BadgeCheck,
    title: 'Decentralised Identity',
    desc: 'Powered by Hyperledger Identus. Your verification lives on-chain as a cryptographic credential — not on our servers.',
  },
]

const stats = [
  { value: '₹5L', label: 'Max insurance payout' },
  { value: '3-Layer', label: 'EDD verification' },
  { value: '0%', label: 'Platform custody' },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Subtle radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[600px] w-[600px] rounded-full bg-green-500/5 blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
            Invite-Only Beta · India
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.1]">
            Trade crypto P2P without the fear of{' '}
            <span className="text-green-500">bank freezes.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            CryptoBazaar is a gated P2P exchange for India. Every member passes 3-layer EDD before
            trading. Smart contract escrow. On-chain insurance. No tainted fiat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black text-sm font-medium px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
            >
              Apply for Early Access
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-300 text-sm font-medium px-6 py-3 rounded-lg hover:border-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              See How It Works
            </a>
          </div>

          {/* Stats strip */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 pt-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-zinc-50 tabular-nums">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            The Problem
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-6 leading-tight">
            Indian P2P traders lose their bank accounts every day.
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm font-medium text-zinc-200 mb-2">The freeze chain</p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                A buyer pays with money from a scam or fraud. Police trace it. Every account
                the money touched gets frozen — including yours, even though you had no idea.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm font-medium text-zinc-200 mb-2">The standard P2P response</p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Binance, WazirX, and others don&apos;t vet buyers&apos; funds. Anyone can
                trade. The seller bears all the risk. There&apos;s no insurance. You fight alone.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/5 p-5">
            <p className="text-sm font-medium text-green-400 mb-1">CryptoBazaar&apos;s answer</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Gate every user with 3-layer EDD before they can trade. If someone with tainted
              money tries to enter — the ML model and interview catches it. And if something still
              slips through, the insurance fund covers you up to ₹5,00,000.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-800 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            How It Works
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-12 leading-tight">
            Three steps to protected trading.
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="relative rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                <span className="text-3xl font-bold text-zinc-800 tabular-nums select-none">
                  {step.num}
                </span>
                <step.icon
                  className="h-5 w-5 text-green-500 mt-3 mb-3"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            Platform Pillars
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-12 leading-tight">
            Built for traders who take risk seriously.
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {pillars.map((p) => (
              <div key={p.title} className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <p.icon className="h-4 w-4 text-green-500" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">{p.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assets supported */}
      <section className="border-t border-zinc-800 px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">
            Supported Assets & Chains
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['USDT · Polygon', 'USDT · Solana', 'USDT · Tron (TRC-20)', 'USDC · Polygon', 'USDC · Solana'].map(
              (a) => (
                <span
                  key={a}
                  className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300"
                >
                  {a}
                </span>
              )
            )}
          </div>
          <p className="text-xs text-zinc-600 mt-4">Cross-chain USDC via Circle CCTP v2 · Cross-chain USDT via Wormhole</p>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            Pricing
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-3 leading-tight">
            Simple monthly subscription.
          </h2>
          <p className="text-sm text-zinc-400 mb-12 max-w-md">
            Your subscription fees fund the INR insurance pool. The more members, the larger
            the coverage.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                name: 'Starter',
                price: '₹200',
                cap: '₹5 lakh / month',
                features: ['All EDD verification', 'Smart contract escrow', 'Insurance eligibility', 'UPI / IMPS / NEFT'],
                highlight: false,
              },
              {
                name: 'Trader',
                price: '₹500',
                cap: '₹20 lakh / month',
                features: ['All EDD verification', 'Smart contract escrow', 'Insurance eligibility', 'Priority support'],
                highlight: true,
              },
              {
                name: 'Pro',
                price: '₹1,000',
                cap: 'Unlimited',
                features: ['All EDD verification', 'Smart contract escrow', 'Insurance eligibility', 'Dedicated compliance agent'],
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg p-6 flex flex-col ${
                  tier.highlight
                    ? 'border border-green-500/40 bg-green-500/5'
                    : 'border border-zinc-800 bg-zinc-900'
                }`}
              >
                {tier.highlight && (
                  <span className="self-start text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 mb-3">
                    Most Popular
                  </span>
                )}
                <p className="text-sm font-semibold text-zinc-200 mb-1">{tier.name}</p>
                <p className="text-3xl font-bold text-zinc-50 tabular-nums">
                  {tier.price}
                  <span className="text-sm font-normal text-zinc-500">/mo</span>
                </p>
                <p className="text-xs text-zinc-500 mt-1 mb-5">Monthly cap: {tier.cap}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`text-sm font-medium text-center py-2.5 rounded-lg transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 ${
                    tier.highlight
                      ? 'bg-green-500 text-black hover:bg-green-400'
                      : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-zinc-600 mt-6">
            All plans require completing 3-layer EDD before the first trade.{' '}
            <Link href="/pricing" className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer">
              See full pricing details
            </Link>
          </p>
        </div>
      </section>

      {/* EDD detail */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
            Verification Layers
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-10 leading-tight">
            The hardest gate on any Indian P2P platform.
          </h2>
          <div className="space-y-4">
            {[
              {
                num: 'Layer 1',
                icon: ScanFace,
                title: 'KYC — Identity Verification',
                desc: 'Aadhaar OTP, PAN match, and liveness check via HyperVerge. Takes ~3 minutes. Issues a cryptographic KYC credential to your on-chain identity.',
              },
              {
                num: 'Layer 2',
                icon: FileText,
                title: 'EDD — Bank Statement Analysis',
                desc: '6 months of bank statements processed by Perfios. ML model scores for AML patterns: structuring, pass-throughs, counterparty anomalies. Score below 40 auto-approves. 41–70 goes to human review. 71+ is rejected.',
              },
              {
                num: 'Layer 3',
                icon: MessageSquare,
                title: 'AI Interview — Source of Funds',
                desc: 'Text questionnaire: source of funds, trading purpose, expected volume. Claude scores for consistency and red flags. Borderline cases escalate to a video interview.',
              },
            ].map((layer) => (
              <div key={layer.num} className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                    <layer.icon className="h-4 w-4 text-green-500" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">{layer.num}</p>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">{layer.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-4 leading-tight">
            Ready to trade without the risk?
          </h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            Apply for early access. Complete EDD verification in under 15 minutes. Start trading
            USDT and USDC with verified counterparties only.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-8 py-3 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
          >
            Apply for Early Access
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-xs text-zinc-600 mt-4">Invite-only beta · India only · USDT &amp; USDC</p>
        </div>
      </section>
    </div>
  )
}
