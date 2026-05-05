'use client'

import { motion } from 'framer-motion'

export function FeatureCard({
  icon,
  title,
  desc,
  accent = false,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  accent?: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      className={`card-glow group relative flex flex-col gap-4 rounded-2xl border p-6 backdrop-blur-sm transition-colors duration-300 cursor-default ${
        accent
          ? 'border-green-500/20 bg-green-500/[0.04]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
          accent
            ? 'border-green-500/30 bg-green-500/10'
            : 'border-white/[0.08] bg-white/[0.04]'
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-100 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}
