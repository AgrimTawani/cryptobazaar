"use client";
import { motion } from "framer-motion";
import { Wallet, Network, DollarSign } from "lucide-react";
import { ConnectButton, useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { client } from "@/app/client";
import { polygonAmoy } from "thirdweb/chains";

export function Navbar() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                CryptoBazar
              </span>
            </div>
          </motion.div>

          {/* Right side - Wallet info and connect button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-4"
          >
            {account && (
              <>
                {/* Chain Info */}
                <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {chain?.name || "Unknown"}
                  </span>
                </div>

                {/* Balance Info - Will be populated by parent component */}
                <div id="balance-display" className="hidden sm:flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Loading...
                  </span>
                </div>
              </>
            )}

            {/* Connect Button */}
            <div className="relative">
              <ConnectButton
                client={client}
                chain={polygonAmoy}
                appMetadata={{
                  name: "CryptoBazar",
                  url: "http://localhost:3000",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
