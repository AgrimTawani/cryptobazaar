import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'

export type LayerStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED'

export type Layer = {
  label: string
  status: LayerStatus
  rejectionReason?: string
}

const config: Record<LayerStatus, { icon: React.ReactNode; color: string; label: string }> = {
  PENDING: { icon: <Clock className="h-5 w-5" />, color: 'text-zinc-500', label: 'Pending' },
  IN_PROGRESS: {
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
    color: 'text-blue-400',
    label: 'In Progress',
  },
  PASSED: { icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-400', label: 'Passed' },
  FAILED: { icon: <XCircle className="h-5 w-5" />, color: 'text-red-400', label: 'Failed' },
}

export function OnboardingStatus({ layers }: { layers: Layer[] }) {
  const allPassed = layers.length > 0 && layers.every((l) => l.status === 'PASSED')

  return (
    <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Verification Status</h2>
        {allPassed && (
          <span className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
            Verified Member
          </span>
        )}
      </div>
      <div className="space-y-4">
        {layers.map((layer, i) => {
          const c = config[layer.status]
          return (
            <div key={i} className="flex items-start gap-3">
              <span className={c.color}>{c.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{layer.label}</span>
                  <span className={`text-xs ${c.color}`}>{c.label}</span>
                </div>
                {layer.status === 'FAILED' && layer.rejectionReason && (
                  <p className="text-xs text-red-400 mt-1">{layer.rejectionReason}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
