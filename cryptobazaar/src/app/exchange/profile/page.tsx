"use client";
import { useEffect, useState } from "react";
import { Wallet, Package, Clock, X, History, TrendingUp, TrendingDown, CheckCircle2, XCircle, ArrowUpRight, Home, FileText, Users, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

// USDC Contract address
const USDC_ADDRESS = "0x8B0180f2101c8260d49339abfEe87927412494B4"; // Polygon Amoy USDC

interface Order {
  id: string;
  amount: number;
  rate: number;
  total: number;
  walletAddress: string;
  status: string;
  expiresAt: string | null;
  lockTxHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

  // Calculate stats
  const stats = {
    activeOrders: myOrders.filter(o => o.status === 'ACTIVE').length,
    completedOrders: allOrders.filter(o => o.status === 'COMPLETED').length,
    cancelledOrders: allOrders.filter(o => o.status === 'CANCELLED').length,
    totalVolume: allOrders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.total, 0),
  };

  // Fetch USDC balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account) return;

      // @ts-ignore
      if (!window.ethereum) return;

      try {
        // @ts-ignore
        const provider = window.ethereum;
        
        // Encode balanceOf function call
        const balanceData = '0x70a08231' + // balanceOf(address) function selector
          account.address.slice(2).padStart(64, '0'); // user address

        const balance = await provider.request({
          method: 'eth_call',
          params: [{
            to: USDC_ADDRESS,
            data: balanceData,
          }, 'latest'],
        });

        // Convert hex to decimal and format (USDC has 6 decimals)
        const balanceNum = parseInt(balance, 16) / 1_000_000;
        setUsdcBalance(balanceNum.toFixed(2));
      } catch (err) {
        console.error("Error fetching USDC balance:", err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [account]);

  // Fetch my orders
  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      setIsLoading(true);
      
      // Fetch active orders
      const activeResponse = await fetch("/api/orders/my-orders");
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setMyOrders(activeData.filter((o: Order) => o.status === 'ACTIVE'));
      }
      
      // Fetch all orders (including completed and cancelled)
      const allResponse = await fetch("/api/orders/my-orders?includeAll=true");
      if (allResponse.ok) {
        const allData = await allResponse.json();
        setAllOrders(allData);
      }
    } catch (error) {
      console.error("Error fetching my orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingOrderId(orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel order");
      }

      // Refresh orders
      fetchMyOrders();
      alert("Order cancelled successfully!");
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return "No expiry";
    
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header with Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={user?.imageUrl || "https://avatar.vercel.sh/user"}
              alt={user?.fullName || "User"}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border-2 border-yellow-500/30"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{user?.fullName || "User"}</h2>
              <p className="text-sm text-neutral-400">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Wallet Status</span>
              <span className={cn(
                "text-sm font-medium",
                account ? "text-green-400" : "text-neutral-400"
              )}>
                {account ? "Connected" : "Not Connected"}
              </span>
            </div>
            {account && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Network</span>
                  <span className="text-sm text-white">{chain?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Address</span>
                  <span className="text-xs font-mono text-neutral-400">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* USDC Balance Card */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 hover:border-yellow-500/50 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-neutral-400">USDC Balance</p>
          </div>
          <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
            {account ? usdcBalance : "0.00"}
          </p>
          <p className="text-sm text-neutral-500">Available for trading</p>
        </div>

        {/* Stats Card */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-sm text-neutral-400">Trading Stats</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Active Orders</span>
              <span className="text-sm font-bold text-white">{stats.activeOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Completed</span>
              <span className="text-sm font-bold text-green-400">{stats.completedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Cancelled</span>
              <span className="text-sm font-bold text-red-400">{stats.cancelledOrders}</span>
            </div>
            <div className="pt-3 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Total Volume</span>
                <span className="text-sm font-bold text-white">
                  ₹{stats.totalVolume.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Sell Orders & Quick Actions - Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Sell Orders - Takes 2 columns */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">My Sell Orders</h2>
            </div>
            <span className="text-sm text-neutral-500">{myOrders.length} active</span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent mb-4"></div>
              <p className="text-neutral-400">Loading your orders...</p>
            </div>
          ) : myOrders.length > 0 ? (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Amount</p>
                        <p className="text-sm font-medium text-white">
                          {order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Rate</p>
                        <p className="text-sm font-medium text-white">₹{order.rate.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Total</p>
                        <p className="text-sm font-medium text-white">
                          ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Expires In</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-400" />
                          <p className="text-sm font-medium text-orange-400">
                            {getTimeRemaining(order.expiresAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="ml-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                    >
                      {cancellingOrderId === order.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {order.lockTxHash && (
                    <div className="mt-3 pt-3 border-t border-neutral-800">
                      <p className="text-xs text-neutral-500">Lock Transaction</p>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${order.lockTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                      >
                        {order.lockTxHash.slice(0, 10)}...{order.lockTxHash.slice(-8)}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-400 mb-2">No active sell orders</p>
              <p className="text-sm text-neutral-500">Create your first sell order in the Marketplace</p>
            </div>
          )}
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          
          <div className="space-y-3 mb-6">
            {/* Buy Crypto */}
            <button
              onClick={() => router.push("/exchange/marketplace")}
              className="w-full group p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 hover:border-orange-500/50 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <ArrowUpRight className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="text-base font-bold text-white">Buy Crypto</h3>
              </div>
              <p className="text-xs text-neutral-400 ml-11">
                Browse and purchase USDC
              </p>
            </button>

            {/* Sell Crypto */}
            <button
              onClick={() => router.push("/exchange/marketplace")}
              className="w-full group p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 hover:border-yellow-500/50 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-neutral-700">
                  <Home className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-base font-bold text-white">Sell Crypto</h3>
              </div>
              <p className="text-xs text-neutral-400 ml-11">
                Create a new sell order
              </p>
            </button>
          </div>

          {/* Help Links */}
          <div className="pt-6 border-t border-neutral-800">
            <p className="text-sm text-neutral-500 mb-3">Need Help?</p>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-yellow-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Documentation</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-yellow-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-yellow-400 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Community</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
          </div>
          <span className="text-sm text-neutral-500">{allOrders.length} total</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent mb-4"></div>
            <p className="text-neutral-400">Loading transactions...</p>
          </div>
        ) : allOrders.length > 0 ? (
          <div className="space-y-3">
            {allOrders.map((order) => {
              const statusConfig = {
                ACTIVE: {
                  icon: Clock,
                  text: "Active",
                  color: "text-blue-400",
                  bgColor: "bg-blue-500/10",
                  borderColor: "border-blue-500/30",
                },
                COMPLETED: {
                  icon: CheckCircle2,
                  text: "Completed",
                  color: "text-green-400",
                  bgColor: "bg-green-500/10",
                  borderColor: "border-green-500/30",
                },
                CANCELLED: {
                  icon: XCircle,
                  text: "Cancelled",
                  color: "text-red-400",
                  bgColor: "bg-red-500/10",
                  borderColor: "border-red-500/30",
                },
              }[order.status] || {
                icon: Clock,
                text: order.status,
                color: "text-neutral-400",
                bgColor: "bg-neutral-500/10",
                borderColor: "border-neutral-500/30",
              };

              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className={cn(
                    "p-4 rounded-lg border bg-neutral-900/50 transition-all hover:border-yellow-500/30",
                    statusConfig.borderColor
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", statusConfig.bgColor)}>
                        <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Sell Order - {order.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", statusConfig.color)}>
                        {statusConfig.text}
                      </p>
                      <p className="text-xs text-neutral-400">
                        @ ₹{order.rate.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Total Value</span>
                      <span className="text-sm font-mono text-white">
                        ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Wallet</span>
                      <span className="text-xs font-mono text-neutral-400">
                        {order.walletAddress.slice(0, 6)}...{order.walletAddress.slice(-4)}
                      </span>
                    </div>
                  </div>

                  {order.lockTxHash && (
                    <div className="mt-3 pt-3 border-t border-neutral-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Lock Transaction</span>
                        <a
                          href={`https://amoy.polygonscan.com/tx/${order.lockTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-mono"
                        >
                          {order.lockTxHash.slice(0, 10)}...{order.lockTxHash.slice(-8)} →
                        </a>
                      </div>
                    </div>
                  )}

                  {order.expiresAt && order.status === 'ACTIVE' && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-orange-400">
                          Expires in {getTimeRemaining(order.expiresAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">No transaction history</p>
            <p className="text-sm text-neutral-500">Your completed and cancelled orders will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
