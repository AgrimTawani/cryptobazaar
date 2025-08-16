"use client";

import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
  useActiveWalletChain,
} from "thirdweb/react";
import { createThirdwebClient, getContract } from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import { formatUnits } from "viem";
import type { Account } from "thirdweb/wallets";

// 1. Create a thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// 2. Get the USDC contract instance
const usdcContract = getContract({
  client,
  chain: polygonAmoy,
  address: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS!,
});

export default function Home() {
  const account = useActiveAccount();

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">CryptoBazar</h1>

      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <ConnectButton
            client={client}
            chain={polygonAmoy}
            appMetadata={{
              name: "CryptoBazar",
              url: "http://localhost:3000",
            }}
          />
        </div>

        {account ? (
          <WalletDetails account={account} />
        ) : (
          <div className="text-center text-gray-500">
            Please connect your wallet to see your balance.
          </div>
        )}
      </div>
    </main>
  );
}

function WalletDetails({ account }: { account: Account }) {
  const chain = useActiveWalletChain();
  const { data: balance, isLoading } = useReadContract({
    contract: usdcContract,
    method: "function balanceOf(address) returns (uint256)",
    params: [account.address],
  });

  const formattedBalance = balance
    ? parseFloat(formatUnits(balance, 6)).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-400">Connected Chain</p>
        <p className="text-lg font-semibold">{chain?.name || "Unknown"}</p>
      </div>
      <div className="p-4 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-400">USDC Balance</p>
        {isLoading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <p className="text-lg font-semibold">{formattedBalance}</p>
        )}
      </div>
    </div>
  );
}
