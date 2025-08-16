"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWalletChain,
} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import type { Account } from "thirdweb/wallets";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NetworkDebugger } from "@/components/network-debugger";
import { useWalletSync } from "@/hooks/useWalletSync";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { TrendingUp, Zap, Shield, Globe, Wallet, DollarSign } from "lucide-react";

// 1. Create a thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const account = useActiveAccount();

  // Sync wallet address with database
  useWalletSync();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {account ? (
            <WalletDetails account={account} />
          ) : (
            <Hero />
          )}
        </div>
      </main>
    </div>
  );
}

function Hero() {
  const { data: session } = useSession();

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-blue-50 -z-10" />
      
      <div className="relative py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-orange-600 via-red-600 to-blue-600 bg-clip-text text-transparent">
              Welcome back, {session?.user?.name?.split(" ")[0]}!
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Connect your wallet to start trading and managing your crypto assets with ease. 
            Your secure dashboard awaits.
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10"
          >
            <p className="text-sm text-gray-500 mb-4">Connect your wallet to get started</p>
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl border border-orange-200">
                <Wallet className="w-6 h-6 text-orange-600 mx-auto" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: TrendingUp,
              title: "Real-time Trading",
              description: "Trade with live market data",
              colors: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
            },
            {
              icon: Shield,
              title: "Secure Wallet",
              description: "Your assets are protected",
              colors: "border-red-200 bg-gradient-to-br from-red-50 to-red-100"
            },
            {
              icon: Zap,
              title: "Fast Transactions",
              description: "Lightning-fast processing",
              colors: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
            },
            {
              icon: Globe,
              title: "Multi-chain",
              description: "Support for multiple networks",
              colors: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
            }
          ].map((feature, index) => (
            <Card key={index} className={`${feature.colors} hover:shadow-lg transition-shadow duration-300`}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-white/50 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function WalletDetails({ account }: { account: Account }) {
  const chain = useActiveWalletChain();
  const { data: balance, isLoading, error } = useReadContract({
    contract: usdcContract,
    method: "function balanceOf(address) returns (uint256)",
    params: [account.address],
  });

  console.log("Balance fetch status:", { balance, isLoading, error, address: account.address });

  const formattedBalance = balance
    ? parseFloat(formatUnits(balance, 6)).toFixed(2)
    : "0.00";

  // Update navbar balance display
  useEffect(() => {
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay && !isLoading) {
      const balanceText = balanceDisplay.querySelector('span');
      if (balanceText) {
        if (error) {
          balanceText.textContent = 'Error loading balance';
        } else {
          balanceText.textContent = `${formattedBalance} USDC`;
        }
      }
    }
  }, [formattedBalance, isLoading, error]);

  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your wallet overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Wallet Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Wallet Address</p>
                </div>
              </div>
              <p className="text-sm text-blue-700 font-mono break-all">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chain Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Connected Chain</p>
                </div>
              </div>
              <p className="text-xl font-bold text-red-800">{chain?.name || "Unknown"}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* USDC Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">USDC Balance</p>
                </div>              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <div className="h-6 bg-orange-200 rounded w-20"></div>
                  </div>
                  <p className="text-xs text-orange-600">Fetching balance from contract...</p>
                </div>
              ) : error ? (
                <div className="text-orange-700">
                  <p className="text-lg font-bold">0.00</p>
                  <p className="text-xs mt-1">Contract not available on this network</p>
                  <p className="text-xs text-orange-600 mt-1">Switch to Polygon Amoy testnet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-orange-800">{formattedBalance}</p>
                  <p className="text-xs text-orange-600">USDC on {chain?.name || 'Unknown Network'}</p>
                </div>
              )}
            </CardContent>
          </Card>        </motion.div>
      </div>

      {/* Debug Information */}
      <NetworkDebugger />

      {/* Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent transactions found.</p>
              <p className="text-sm mt-2">Your transaction history will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
