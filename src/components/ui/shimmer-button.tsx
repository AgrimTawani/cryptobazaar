'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  background?: string
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = 'rgba(255,255,255,0.35)',
  background = '#fbbf24',
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl px-6 py-3 text-sm font-semibold text-black transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400 active:scale-[0.98] hover:brightness-110',
        className
      )}
      style={{ background }}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] transition-transform duration-700 ease-out group-hover:translate-x-[200%]"
        style={{ background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)` }}
        aria-hidden="true"
      />
      {children}
    </button>
  )
}

export function OutlineShimmerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl border border-white/10 bg-white/3 px-6 py-3 text-sm font-medium text-slate-300 backdrop-blur-sm transition-all duration-200 hover:border-amber-500/25 hover:bg-amber-500/5 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-amber-400 active:scale-[0.98]',
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] transition-transform duration-700 ease-out group-hover:translate-x-[200%]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.1), transparent)' }}
        aria-hidden="true"
      />
      {children}
    </button>
  )
}
