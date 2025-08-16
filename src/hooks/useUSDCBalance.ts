"use client";

import { useReadContract, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient, getContract } from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import { formatUnits } from "viem";

// Create a thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Get the USDC contract instance
const usdcContract = getContract({
  client,
  chain: polygonAmoy,
  address: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS!,
});

export function useUSDCBalance() {
  const account = useActiveAccount();
  
  const { data: balance, isLoading, error } = useReadContract({
    contract: usdcContract,
    method: "function balanceOf(address) returns (uint256)",
    params: account ? [account.address] : undefined,
  });

  console.log("USDC Balance fetch status:", { 
    balance, 
    isLoading, 
    error, 
    address: account?.address,
    hasAccount: !!account
  });

  const formattedBalance = balance
    ? parseFloat(formatUnits(balance, 6)).toFixed(2)
    : "0.00";

  return {
    balance: formattedBalance,
    isLoading: isLoading && !!account, // Only show loading if we have an account
    error,
    hasAccount: !!account
  };
}
