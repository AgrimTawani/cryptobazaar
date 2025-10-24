"use client";
import { useState, useEffect } from "react";
import { Search, Filter, TrendingUp, TrendingDown, Plus } from "lucide-react";
import CreateOrderModal from "@/components/CreateOrderModal";

interface Order {
  id: string;
  amount: number;
  rate: number;
  total: number;
  walletAddress: string;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    const sellerName = `${order.seller.firstName || ""} ${order.seller.lastName || ""}`.toLowerCase();
    const walletAddress = order.walletAddress.toLowerCase();
    
    return (
      walletAddress.includes(searchLower) ||
      sellerName.includes(searchLower) ||
      order.amount.toString().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Buy USDC</h2>
          <p className="text-sm text-neutral-400">Browse available sell orders from verified sellers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white">₹84.50</span>
            <span className="text-xs text-green-400">+2.1%</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Sell Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by seller address or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-white">Filters</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-500 border-r-transparent mb-4"></div>
            <p className="text-neutral-400">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Amount (USDC)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Rate (INR)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total (INR)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredOrders.map((order) => {
                  const sellerName = order.seller.firstName && order.seller.lastName
                    ? `${order.seller.firstName} ${order.seller.lastName}`
                    : order.seller.email || "Anonymous";
                  const shortWallet = `${order.walletAddress.slice(0, 6)}...${order.walletAddress.slice(-4)}`;
                  
                  return (
                    <tr key={order.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-white">{sellerName}</p>
                            <p className="text-xs text-neutral-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-neutral-400">{shortWallet}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white font-medium">
                          {order.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white">
                          ₹{order.rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white font-medium">
                          ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white text-sm font-medium transition-all">
                          Buy
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingDown className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">
              {searchQuery ? "No orders match your search" : "No orders available"}
            </p>
            <p className="text-sm text-neutral-500">
              {searchQuery ? "Try a different search term" : "Be the first to create a sell order!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-medium transition-all"
              >
                Create Sell Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchOrders();
        }}
      />

      {/* Info Box */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">How to Buy USDC</h3>
        <ol className="space-y-2 text-sm text-neutral-400">
          <li>1. Choose an order from the list above</li>
          <li>2. Click "Buy" and confirm the transaction details</li>
          <li>3. Pay the INR amount through our secure payment gateway</li>
          <li>4. Once payment is confirmed, USDC will be released to your wallet automatically</li>
        </ol>
      </div>
    </div>
  );
}
