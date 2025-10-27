"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Lock } from "lucide-react";

// Contract addresses - TokenLocker.sol deployed on Polygon Amoy
const TOKEN_LOCKER_ADDRESS = "0x00b72b00336C5128D8CAD431d7B7fE1496D9B536"; // ✅ DEPLOYED
const USDC_ADDRESS = "0x8B0180f2101c8260d49339abfEe87927412494B4"; // Polygon Amoy Test USDC
const POLYGON_AMOY_CHAIN_ID = "0x13882"; // 80002 in hex

export default function LockUSDTButton() {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [usdcBalance, setUsdcBalance] = useState<string>("0");

  // Fetch USDC balance
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

  // Fetch balance when account changes
  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const lockUSDT = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    // @ts-ignore - Using window.ethereum directly
    if (!window.ethereum) {
      setError("MetaMask not found");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("Preparing transaction...");

    try {
      // @ts-ignore
      const provider = window.ethereum;
      
      // Switch to Polygon Amoy if needed
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // 80002 in hex
        });
      } catch (switchError: any) {
        // Chain not added, try adding it
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

      // 1️⃣ Approve USDC: approve(address spender, uint256 amount)
      const amount = BigInt(5_000_000); // 5 USDC with 6 decimals
      const approveData = '0x095ea7b3' + // approve(address,uint256) function selector
        TOKEN_LOCKER_ADDRESS.slice(2).toLowerCase().padStart(64, '0') + // spender address
        amount.toString(16).padStart(64, '0'); // amount

      // Send approve transaction
      const approveTx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: USDC_ADDRESS,
          data: approveData,
          gas: '0x186A0', // 100000 in hex
        }],
      });

      console.log("✅ Approve transaction:", approveTx);
      setStatus("Waiting for approval...");
      
      // Wait for confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      setStatus("Step 2/2: Locking USDC...");

      // 2️⃣ Lock tokens: lockTokens(uint256 amount, uint256 lockDuration)
      const duration = BigInt(3600); // 1 hour in seconds
      const lockData = '0x7f9fadee' + // lockTokens(uint256,uint256) function selector  
        amount.toString(16).padStart(64, '0') + // amount parameter
        duration.toString(16).padStart(64, '0'); // duration parameter

      // Send lock transaction
      const lockTx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.address,
          to: TOKEN_LOCKER_ADDRESS,
          data: lockData,
          gas: '0x493E0', // 300000 in hex
        }],
      });

      console.log("✅ Lock transaction:", lockTx);

      setStatus("✅ Success! 5 USDC locked for 1 hour");
      setError("");
      
      // Refresh balance after locking
      setTimeout(() => {
        fetchBalance();
      }, 3000);
      
      // Show success for 5 seconds then reset
      setTimeout(() => {
        setStatus("");
      }, 5000);

    } catch (err: any) {
      console.error("❌ Error locking USDC:", err);
      
      let errorMessage = "Failed to lock USDC.";
      
      if (err?.message?.includes("user rejected") || err.code === 4001) {
        errorMessage = "Transaction rejected by user.";
      } else if (err?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient MATIC for gas fees.";
      } else if (err?.message) {
        errorMessage = err.message.substring(0, 150);
      }
      
      setError(errorMessage);
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Lock USDC</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-neutral-400">Your Balance:</p>
        <p className="text-2xl font-bold text-green-400">{usdcBalance} USDC</p>
      </div>

      <p className="text-sm text-neutral-400 mb-4">
        Test the locking functionality by locking 5 USDC for 1 hour
      </p>

      {/* Status Messages */}
      {status && (
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-400">{status}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Lock Button */}
      <button
        onClick={lockUSDT}
        disabled={!account || isLoading}
        className={`
          w-full p-4 rounded-lg font-medium transition-all
          ${
            !account || isLoading
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white transform hover:scale-105"
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : !account ? (
          "Connect Wallet First"
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Lock 5 USDC (1 Hour)
          </span>
        )}
      </button>

      {/* Info */}
      <div className="mt-4 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <p className="text-xs text-neutral-500">
          <strong className="text-neutral-400">Note:</strong> Make sure you have at least 5 USDT and some MATIC for gas fees on Polygon Amoy testnet.
        </p>
      </div>
    </div>
  );
}
