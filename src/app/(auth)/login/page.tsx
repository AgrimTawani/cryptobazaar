'use client'

import { WalletConnectButton } from '@/components/wallet-connect-button'
import { useActiveAccount } from 'thirdweb/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const account = useActiveAccount()
  const router = useRouter()

  useEffect(() => {
    if (account) router.push('/dashboard')
  }, [account, router])

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-950 p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Connect Your Wallet</h1>
        <p className="text-sm text-zinc-400">
          Connect to access CryptoBazaar. New users will be guided through EDD verification.
        </p>
        <div className="pt-2 flex justify-center">
          <WalletConnectButton />
        </div>
      </div>
    </main>
  )
}
