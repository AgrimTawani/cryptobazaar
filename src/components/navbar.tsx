'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800'
          : 'bg-transparent'
      }`}
    >
      <nav
        className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-50 hover:text-white transition-colors"
        >
          <Shield className="h-4 w-4 text-green-500" aria-hidden="true" />
          CryptoBazaar
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Pricing
          </Link>
          <Link
            href="/terms"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Terms
          </Link>
        </div>

        <Link
          href="/login"
          className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
        >
          Get Started
        </Link>
      </nav>
    </header>
  )
}
