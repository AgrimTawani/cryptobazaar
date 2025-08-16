"use client";

import { motion } from "framer-motion";
import { Wallet, Network, DollarSign, LogOut } from "lucide-react";
import { ConnectButton, useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useSession, signOut } from "next-auth/react";
import { client } from "@/app/client";
import { polygonAmoy } from "thirdweb/chains";
import Image from "next/image";
import Link from "next/link";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";

export function Navbar() {
  const { data: session } = useSession();
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const { balance, isLoading, error, hasAccount } = useUSDCBalance();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                CryptoBazar
              </span>
            </Link>
          </motion.div>

          {/* Right side - Login button or User info and wallet connect */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            {session ? (
              <>
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                {/* Wallet Connect Button - only show if authenticated */}
                <ConnectButton
                  client={client}
                  chain={polygonAmoy}
                  connectButton={{
                    label: "Connect Wallet",
                    style: {
                      background: "linear-gradient(135deg, #f97316, #dc2626)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: "500",
                    },
                  }}
                />

                {/* Network and Balance Display */}
                {account && (
                  <div className="hidden lg:flex items-center space-x-4">
                    {/* Network Display */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <Network className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {chain?.name || "Unknown"}
                      </span>
                    </div>                    {/* Balance Display */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        {isLoading ? (
                          "Loading..."
                        ) : error ? (
                          "Error"
                        ) : (
                          `${balance} USDC`
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              /* Login Button - show when not authenticated */
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
