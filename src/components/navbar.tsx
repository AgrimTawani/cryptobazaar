'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#020617]/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <nav
        className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-50 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500/15 border border-green-500/25">
            <Shield className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
          </div>
          CryptoBazaar
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'Pricing', href: '/pricing' },
            { label: 'Terms', href: '/terms' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-400 hover:text-slate-100 transition-colors duration-200 cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="text-sm font-semibold bg-white text-black px-4 py-1.5 rounded-lg hover:bg-zinc-100 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-green-500"
        >
          Get Started
        </Link>
      </nav>
    </header>
  )
}
