'use client'

import { ConnectButton } from 'thirdweb/react'
import { thirdwebClient } from '@/lib/thirdweb'
import { polygon } from 'thirdweb/chains'

export function WalletConnectButton() {
  return (
    <ConnectButton
      client={thirdwebClient}
      chains={[polygon]}
      theme="dark"
      connectButton={{ label: 'Connect Wallet' }}
    />
  )
}
