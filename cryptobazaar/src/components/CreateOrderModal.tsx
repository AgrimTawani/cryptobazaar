"use client";

import { useState, useEffect } from "react";
import { X, Plus, Lock, Wallet } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useActiveAccount } from "thirdweb/react";

// Contract addresses
const USDT_LOCKER_ADDRESS = "0xba098ad1a0B1aD9B02030E7F258AFf4d90634Ed3";
const USDC_ADDRESS = "0x8B0180f2101c8260d49339abfEe87927412494B4";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const { user } = useUser();
  const account = useActiveAccount();
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("84.50");
  const [duration, setDuration] = useState("24"); // Duration in hours
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const total = amount && rate ? (parseFloat(amount) * parseFloat(rate)).toFixed(2) : "0.00";

  // Fetch USDC balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !isOpen) return;

      // @ts-ignore
      if (!window.ethereum) return;

      try {
        // @ts-ignore
        const provider = window.ethereum;
        
        const balanceData = '0x70a08231' + account.address.slice(2).padStart(64, '0');

        const balance = await provider.request({
          method: 'eth_call',
          params: [{
            to: USDC_ADDRESS,
            data: balanceData,
          }, 'latest'],
        });

        const balanceNum = parseInt(balance, 16) / 1_000_000;
        setUsdcBalance(balanceNum.toFixed(2));
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    fetchBalance();
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setIsLoading(true);

    try {
      // Validations
      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      const amountNum = parseFloat(amount);
      const balanceNum = parseFloat(usdcBalance);

      if (!amount || amountNum <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (amountNum > balanceNum) {
        throw new Error(`Insufficient balance. You have ${usdcBalance} USDC`);
      }

      if (!rate || parseFloat(rate) <= 0) {
        throw new Error("Please enter a valid rate");
      }

      const durationHours = parseInt(duration);
      if (!duration || durationHours < 1 || durationHours > 168) {
        throw new Error("Duration must be between 1 and 168 hours (7 days)");
      }

      // @ts-ignore
      if (!window.ethereum) {
        throw new Error("MetaMask not found");
      }

      // @ts-ignore
      const provider = window.ethereum;
      
      // Switch to Polygon Amoy
      setStatus("Switching to Polygon Amoy...");
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // 80002 in hex
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology/'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            }],
          });
        } else {
          throw switchError;
        }
      }

      setStatus("Step 1/2: Approving USDC...");

      // Calculate amount with 6 decimals
      const amountWei = Math.floor(amountNum * 1_000_000);

      // Approve USDC
      const approveData = '0x095ea7b3' + // approve(address,uint256)
        USDT_LOCKER_ADDRESS.slice(2).padStart(64, '0') +
        amountWei.toString(16).padStart(64, '0');

      const approveTx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: USDC_ADDRESS,
          data: approveData,
          gas: '0x186A0', // 100000
        }],
      });

      console.log("✅ Approve transaction:", approveTx);
      setStatus("Waiting for approval confirmation...");
      await new Promise(resolve => setTimeout(resolve, 3000));

      setStatus("Step 2/2: Locking USDC...");

      // Lock tokens
      const durationSeconds = durationHours * 3600;
      const lockData = '0x6c0360eb' + // lock5USDT(uint256) - using same function
        durationSeconds.toString(16).padStart(64, '0');

      const lockTx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: USDT_LOCKER_ADDRESS,
          data: lockData,
          gas: '0x30D40', // 200000
        }],
      });

      console.log("✅ Lock transaction:", lockTx);
      setStatus("Creating order in database...");

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

      // Create order in database
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountNum,
          rate: parseFloat(rate),
          walletAddress: account.address,
          expiresAt: expiresAt,
          lockTxHash: lockTx,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      // Success!
      setStatus("✅ Order created successfully!");
      setTimeout(() => {
        setAmount("");
        setRate("84.50");
        setDuration("24");
        setStatus("");
        onSuccess();
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error("Error creating order:", err);
      
      let errorMessage = err.message || "Failed to create order";
      
      if (err?.message?.includes("user rejected") || err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient MATIC for gas fees";
      }
      
      setError(errorMessage);
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-xl border border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-neutral-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Plus className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Sell Order</h2>
              <p className="text-sm text-neutral-400">Lock USDC and list for sale</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Balance Display */}
        <div className="p-6 pb-0">
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Your Balance</span>
              </div>
              <span className="text-lg font-bold text-white">{usdcBalance} USDC</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Amount (USDC) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={usdcBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 100"
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">
              Maximum: {usdcBalance} USDC
            </p>
          </div>

          {/* Rate Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Rate (INR per USDC) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g., 84.50"
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">
              Current market rate: ₹84.50
            </p>
          </div>

          {/* Duration Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Order Duration (Hours) *
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 24"
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">
              Your USDC will be locked for this duration (Max: 168 hours / 7 days)
            </p>
          </div>

          {/* Total Display */}
          <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Total Value</span>
              <span className="text-lg font-bold text-white">
                ₹{parseFloat(total).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Lock Duration</span>
              <span className="text-xs text-white">{duration} hours</span>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-400">{status}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-400 space-y-1">
                <p><strong>Important:</strong> Your USDC will be locked in the smart contract for the specified duration.</p>
                <p>• You can cancel the order anytime to remove it from marketplace</p>
                <p>• After the duration expires, USDC will be automatically unlockable</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-neutral-700 text-white hover:bg-neutral-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !account}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : !account ? (
                "Connect Wallet First"
              ) : (
                "Lock & Create Order"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
