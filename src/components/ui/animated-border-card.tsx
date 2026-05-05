'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import React, { useRef, useState } from 'react'

export function AnimatedBorderCard({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn('relative rounded-2xl', containerClassName)}
    >
      {/* Mouse-tracking glow border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(251,191,36,0.12), transparent 60%)`,
        }}
      />
      {/* Static border */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />
      {/* Rotating conic gradient border */}
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[15px] transition-opacity duration-500"
        style={{ opacity: opacity * 0.6 }}
      >
        <div
          className="absolute inset-[-1px] rounded-2xl"
          style={{
            background: `conic-gradient(from 0deg at ${position.x}px ${position.y}px, transparent 0deg, rgba(251,191,36,0.3) 60deg, transparent 120deg)`,
          }}
        />
      </div>
      {/* Content */}
      <div className={cn('relative rounded-2xl', className)}>{children}</div>
    </div>
  )
}
