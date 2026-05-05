'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const stats = [
  { value: '₹5L', label: 'Max insurance payout' },
  { value: '3-Layer', label: 'EDD required to trade' },
  { value: '0%', label: 'Platform custody of funds' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
      {/* Ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="blob-1 absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[100px]" />
        <div className="blob-2 absolute right-1/4 bottom-1/3 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="blob-3 absolute left-1/2 top-2/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-green-400/5 blur-[80px]" />
      </div>

      {/* Grid */}
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-100" />

      {/* Vignette bottom */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020617] to-transparent" />

      <div className="relative max-w-3xl mx-auto space-y-6">
        <FadeUp delay={0.05}>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-400 backdrop-blur-sm">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
            Invite-Only Beta · India · USDT &amp; USDC
          </div>
        </FadeUp>

        <FadeUp delay={0.12}>
          <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-slate-50">
            Trade crypto P2P without{' '}
            <br className="hidden sm:block" />
            the fear of{' '}
            <span className="text-gradient-green">bank freezes.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            CryptoBazaar is India&apos;s first gated P2P stablecoin exchange. Every member
            passes 3-layer EDD. Funds in smart contract escrow. Bank freeze insurance up to ₹5L.
          </p>
        </FadeUp>

        <FadeUp delay={0.28}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
            >
              Apply for Early Access
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-slate-300 text-sm font-medium px-6 py-3 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer backdrop-blur-sm"
            >
              See How It Works
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.38}>
          <div className="flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-white/10 border border-white/10 bg-white/[0.03] backdrop-blur-sm rounded-2xl overflow-hidden mt-4">
            {stats.map((s) => (
              <div key={s.label} className="w-full sm:w-auto px-8 py-4 text-center">
                <p className="text-2xl font-bold text-slate-50 tabular-nums">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
