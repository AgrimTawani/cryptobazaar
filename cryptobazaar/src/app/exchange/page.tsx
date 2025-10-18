"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut, Home, TrendingUp, Settings, Sparkles, Menu, X, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ConnectButton, useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { client } from "../client";
import { defineChain } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";

// USDC Contract addresses for different networks
const USDC_CONTRACTS: { [key: number]: string } = {
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum Mainnet
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
  137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon Mainnet
  80001: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23", // Mumbai (Polygon Testnet - Deprecated)
  80002: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582", // Polygon Amoy (New Testnet)
};

export default function ExchangePage() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // Fetch USDC balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !chain) {
        setUsdcBalance("0");
        return;
      }

      try {
        // Get USDC contract address for current chain
        const usdcAddress = USDC_CONTRACTS[chain.id];
        
        if (!usdcAddress) {
          console.log("USDC not available on this network");
          setUsdcBalance("N/A");
          return;
        }

        const contract = getContract({
          client,
          chain: chain,
          address: usdcAddress,
        });

        const balance = await balanceOf({
          contract,
          address: account.address,
        });

        // USDC has 6 decimals
        const formattedBalance = (Number(balance) / 1e6).toFixed(2);
        setUsdcBalance(formattedBalance);
      } catch (error) {
        console.error("Error fetching USDC balance:", error);
        setUsdcBalance("Error");
      }
    };

    fetchBalance();
  }, [account, chain]);

  const links = [
    {
      label: "Dashboard",
      icon: <Home className="h-5 w-5 shrink-0" />,
      onClick: () => {},
    },
    {
      label: "Marketplace",
      icon: <TrendingUp className="h-5 w-5 shrink-0" />,
      onClick: () => {},
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5 shrink-0" />,
      onClick: () => {},
    },
    {
      label: "Logout",
      icon: <LogOut className="h-5 w-5 shrink-0" />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={cn(
          "flex flex-col bg-neutral-950 border-r border-neutral-800 transition-all duration-300",
          sidebarOpen ? "w-56" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-neutral-800">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent whitespace-nowrap">
                CryptoBazaar
              </span>
            </div>
          ) : (
            <Sparkles className="w-5 h-5 text-yellow-500 mx-auto" />
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link, idx) => (
            <button
              key={idx}
              onClick={link.onClick}
              className={cn(
                "flex items-center w-full px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all",
                !sidebarOpen && "justify-center"
              )}
            >
              {link.icon}
              {sidebarOpen && <span className="ml-3 text-sm">{link.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-neutral-800">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer",
              !sidebarOpen && "justify-center"
            )}
          >
            <img
              src={user?.imageUrl || "https://avatar.vercel.sh/user"}
              alt={user?.fullName || "User"}
              className="w-8 h-8 rounded-full border-2 border-yellow-500/30"
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/50">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <ConnectButton
            client={client}
            theme="dark"
            connectButton={{
              label: "Connect Wallet",
              className: "!bg-gradient-to-r !from-yellow-600 !to-orange-600 !font-medium !text-white !rounded-lg !px-6 !py-2 hover:!from-yellow-500 hover:!to-orange-500",
            }}
            detailsButton={{
              className: "!bg-neutral-800 !border !border-neutral-700 !rounded-lg",
            }}
          />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-black">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            
            {/* Wallet Balance - Large Card */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2 p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-yellow-500/50 transition-all group">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-neutral-400">Your Wallet</p>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    {account ? `$${usdcBalance}` : "$0.00"}
                  </p>
                  <p className="text-neutral-400 text-sm">USDC Balance</p>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Network</span>
                    <span className="text-white font-medium">{chain?.name || "Not Connected"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-neutral-500">Status</span>
                    <span className={cn(
                      "font-medium",
                      account ? "text-green-400" : "text-neutral-400"
                    )}>
                      {account ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats - Small Cards */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-neutral-500">24h Volume</p>
              </div>
              <p className="text-2xl font-bold text-white">$10M+</p>
              <p className="text-xs text-green-400 mt-1">↑ 12.5%</p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-green-500/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-green-400" />
                <p className="text-xs text-neutral-500">Active Users</p>
              </div>
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-xs text-green-400 mt-1">↑ 8.2%</p>
            </div>

            {/* Market Trends - Medium Card */}
            <div className="md:col-span-2 lg:col-span-2 p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-orange-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Market Trends</h3>
                  <p className="text-xs text-neutral-500">Live cryptocurrency prices</p>
                </div>
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-400">₿</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Bitcoin</p>
                      <p className="text-xs text-neutral-500">BTC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">$43,250</p>
                    <p className="text-xs text-green-400">+2.4%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-400">Ξ</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Ethereum</p>
                      <p className="text-xs text-neutral-500">ETH</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">$2,280</p>
                    <p className="text-xs text-green-400">+1.8%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Wide Card */}
            <div className="md:col-span-2 lg:col-span-2 p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <p className="text-xs text-neutral-500">Your latest transactions</p>
                </div>
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-2">
                {account ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-500 text-sm">No recent activity</p>
                    <p className="text-neutral-600 text-xs mt-1">Your transactions will appear here</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">Connect your wallet to see activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions - Tall Card */}
            <div className="lg:row-span-2 p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-yellow-500/50 transition-all">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-medium transition-all transform hover:scale-105">
                  <span className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Buy Crypto
                  </span>
                </button>
                <button className="w-full p-4 rounded-lg border border-neutral-700 hover:border-neutral-600 text-white font-medium transition-all">
                  <span className="flex items-center justify-center gap-2">
                    <Home className="w-4 h-4" />
                    Sell Crypto
                  </span>
                </button>
                <button className="w-full p-4 rounded-lg border border-neutral-700 hover:border-neutral-600 text-white font-medium transition-all">
                  <span className="flex items-center justify-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Swap
                  </span>
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 mb-3">Need Help?</p>
                <div className="space-y-2">
                  <a href="#" className="block text-sm text-neutral-400 hover:text-white transition-colors">
                    → Documentation
                  </a>
                  <a href="#" className="block text-sm text-neutral-400 hover:text-white transition-colors">
                    → Support
                  </a>
                  <a href="#" className="block text-sm text-neutral-400 hover:text-white transition-colors">
                    → Community
                  </a>
                </div>
              </div>
            </div>

            {/* Platform Stats - Small Card */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-pink-500/50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <p className="text-xs text-neutral-500">Trades Today</p>
              </div>
              <p className="text-2xl font-bold text-white">1,234</p>
              <p className="text-xs text-green-400 mt-1">↑ 15.3%</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
