'use client'

import { AnimatedBorderCard } from '@/components/ui/animated-border-card'
import { cn } from '@/lib/utils'

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
    <AnimatedBorderCard
      containerClassName="h-full"
      className={cn(
        'flex flex-col gap-4 p-6 h-full rounded-2xl transition-colors duration-300',
        accent ? 'bg-amber-500/[0.04]' : 'bg-white/[0.02]'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border',
          accent
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-white/[0.08] bg-white/[0.04]'
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-100 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </AnimatedBorderCard>
  )
}
