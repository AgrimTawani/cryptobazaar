'use client'

import { useActiveAccount } from 'thirdweb/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { OnboardingStatus, type Layer } from '@/components/onboarding-status'
import { WalletConnectButton } from '@/components/wallet-connect-button'

export default function DashboardPage() {
  const account = useActiveAccount()
  const router = useRouter()

  useEffect(() => {
    if (!account) router.push('/login')
  }, [account, router])

  const layers: Layer[] = [
    { label: 'KYC Verification', status: 'PENDING' },
    { label: 'Bank Statement EDD', status: 'PENDING' },
    { label: 'AI Interview', status: 'PENDING' },
  ]

  if (!account) return null

  return (
    <main className="flex flex-1 flex-col p-8">
      <div className="max-w-2xl w-full mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <WalletConnectButton />
        </div>
        <div className="text-sm text-zinc-400 font-mono break-all">{account.address}</div>
        <OnboardingStatus layers={layers} />
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-400 text-sm">
          Trading will be available after completing all 3 verification layers.
        </div>
      </div>
    </main>
  )
}
