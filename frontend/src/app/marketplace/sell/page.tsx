"use client";

import { useEffect, useState } from "react";
import {
  useActiveAccount,
  useSendTransaction,
  useActiveWalletConnectionStatus,
  useConnect,
  useActiveWalletChain,
} from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import {
  getContract,
  prepareContractCall,
  readContract,
  waitForReceipt,
  defineChain,
} from "thirdweb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { thirdwebClient } from "@/lib/thirdweb";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { txUrl } from "@/lib/explorer";

const amoyChain = defineChain(80002);
const ESCROW_ADDR = (process.env.NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS ?? "") as `0x${string}`;
const USDC_ADDR = (process.env.NEXT_PUBLIC_AMOY_USDC_ADDRESS ?? "") as `0x${string}`;

const escrowContract = getContract({ client: thirdwebClient, chain: amoyChain, address: ESCROW_ADDR });
const usdcContract = getContract({ client: thirdwebClient, chain: amoyChain, address: USDC_ADDR });

type Step = "form" | "review" | "approving" | "creating" | "saving" | "done" | "error";
type PaymentMethod = "UPI" | "IMPS" | "NEFT";

const STEPS: { key: Step; label: string }[] = [
  { key: "approving", label: "Approving USDC" },
  { key: "creating",  label: "Creating order" },
  { key: "saving",    label: "Saving" },
  { key: "done",      label: "Done!" },
];
const STEP_ORDER = STEPS.map((s) => s.key);

export default function SellPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const walletOk = connectionStatus === "connected" && !!account;
  const activeChain = useActiveWalletChain();
  const sellChainId = parseInt(process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID ?? "80002");
  // Require exact chain match — !activeChain (Solana/unknown) is NOT ok
  const chainOk = !account || activeChain?.id === sellChainId;
  const sellChainLabel = sellChainId === 80002 ? "Polygon Amoy" : "Polygon";
  const CHAIN_LABELS: Record<number, string> = {
    1: "Ethereum", 137: "Polygon", 80002: "Polygon Amoy",
    56: "BNB Chain", 97: "BNB Testnet",
    728126428: "Tron", 3448148188: "Tron Nile", 2494104990: "Tron Shasta",
    1399811149: "Solana", 103: "Solana Devnet",
  };
  const activeChainName = activeChain
    ? (CHAIN_LABELS[activeChain.id] ?? `Chain ${activeChain.id}`)
    : account ? "Unknown Network" : null;
  const { connect } = useConnect();
  const { mutateAsync: sendTx } = useSendTransaction();

  const reconnectWallet = () => connect(async () => {
    const wallet = createWallet("io.metamask");
    await wallet.connect({ client: thirdwebClient });
    return wallet;
  });

  const [walletInfo, setWalletInfo] = useState<{ address: string } | null>(null);
  const [profilePayment, setProfilePayment] = useState<{
    upiId: string | null;
    bankAccount: string | null;
    ifscCode: string | null;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(["UPI"]);
  const [partialAllowed, setPartialAllowed] = useState(false);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/onboarding/status").then((r) => r.json()).catch(() => ({})),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]).then(([d]) => {
      if (d.walletAddress) setWalletInfo({ address: d.walletAddress });
      setProfilePayment({ upiId: d.upiId ?? null, bankAccount: d.bankAccount ?? null, ifscCode: d.ifscCode ?? null });
      if (!d.upiId) setPaymentMethods((prev) => prev.filter((m) => m !== "UPI"));
      setIsLoadingDb(false);
    });
  }, []);

  const totalInr = amount && pricePerUnit
    ? (parseFloat(amount) * parseFloat(pricePerUnit)).toFixed(2)
    : null;

  const togglePayment = (method: PaymentMethod) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const validate = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return "Enter a valid amount.";
    if (!pricePerUnit || isNaN(parseFloat(pricePerUnit)) || parseFloat(pricePerUnit) <= 0) return "Enter a valid price.";
    if (paymentMethods.length === 0) return "Select at least one payment method.";
    if (!profilePayment?.bankAccount || !profilePayment?.ifscCode)
      return "Payment details missing. Complete the bank statement step in onboarding.";
    if (partialAllowed) {
      const min = parseFloat(minOrderAmount);
      const total = parseFloat(amount);
      if (!minOrderAmount || isNaN(min) || min <= 0)
        return "Enter a valid minimum order amount.";
      if (min >= total)
        return "Minimum order must be less than total amount.";
      if (min < 1)
        return "Minimum order must be at least 1 USDC.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    try {
      const amountRaw = BigInt(Math.round(parseFloat(amount) * 1e6));
      const priceRaw = BigInt(Math.round(parseFloat(pricePerUnit) * 100));

      setStep("approving");
      await sendTx(prepareContractCall({
        contract: usdcContract,
        method: "function approve(address spender, uint256 amount)",
        params: [ESCROW_ADDR, amountRaw],
        gas: BigInt(100000),
      }));

      const nextId = await readContract({
        contract: escrowContract,
        method: "function nextOrderId() view returns (uint256)",
        params: [],
      });

      setStep("creating");
      const { transactionHash } = await sendTx(prepareContractCall({
        contract: escrowContract,
        method: "function createOrder(address token, uint128 amount, uint96 priceInr)",
        params: [USDC_ADDR, amountRaw, priceRaw],
        gas: BigInt(200000),
      }));

      const receipt = await waitForReceipt({ client: thirdwebClient, chain: amoyChain, transactionHash });
      if (receipt.status === "reverted") {
        throw new Error("createOrder transaction reverted on-chain. Your USDC was not moved. Please try again.");
      }

      setTxHash(transactionHash);
      setStep("saving");
      const orderId = `${ESCROW_ADDR.toLowerCase()}_${nextId.toString()}`;
      const saveRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId, chain: "POLYGON", asset: "USDC",
          amount: parseFloat(amount), pricePerUnit: parseFloat(pricePerUnit),
          escrowTxHash: transactionHash, escrowContractAddress: ESCROW_ADDR,
          paymentMethods,
          partialAllowed,
          minOrderAmount: partialAllowed ? parseFloat(minOrderAmount) : null,
        }),
      });
      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => ({})) as { error?: string };
        throw new Error(`Order saved on-chain (tx: ${transactionHash}) but failed to save to database: ${body.error ?? saveRes.status}. Contact support with this transaction hash.`);
      }

      setStep("done");
      setTimeout(() => router.push("/marketplace"), 1500);
    } catch (e: unknown) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "Transaction failed. Please try again.");
      setStep("error");
    }
  };

  const isBusy = step === "approving" || step === "creating" || step === "saving";

  if (isLoadingDb) return <LoadingSpinner />;

  const isNonEvmWallet = walletInfo && !walletInfo.address.startsWith("0x");
  if (isNonEvmWallet) {
    const chainLabel = walletInfo.address.startsWith("T") && walletInfo.address.length === 34
      ? "TRON" : "Solana";
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="font-condensed text-2xl mb-2">Only available on Polygon</h2>
        <p className="font-sans text-sm text-[#666] max-w-xs leading-relaxed">
          Your wallet is on {chainLabel}. Sell orders are currently only supported on Polygon.
        </p>
        <Link href="/marketplace" className="mt-6 font-sans text-sm text-[#7b3fe4] underline">← Back to marketplace</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-white border-b border-[#ebebeb] px-5 md:px-10 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="font-condensed text-base tracking-[3px] text-black no-underline">CRYPTOBAZAAR</Link>
        <Link href="/marketplace" className="font-sans text-sm text-[#888] no-underline">← Back to marketplace</Link>
      </header>

      <div className="max-w-[560px] mx-auto py-8 px-5">
        <h1 className="font-condensed text-[2.4rem] tracking-[1px] mb-1">SELL USDC</h1>
        <p className="font-sans text-sm text-[#888] mb-8">
          Tokens are held in escrow until you confirm the buyer&apos;s INR payment.
        </p>

        {/* Wallet banners */}
        {connectionStatus === "connecting" && (
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-4 mb-5 flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-[#0369a1] border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="font-sans text-sm text-[#0369a1]">Reconnecting wallet…</p>
          </div>
        )}
        {!walletOk && connectionStatus !== "connecting" && (
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base shrink-0">🦊</span>
              <p className="font-sans text-sm text-[#92400e]">Wallet disconnected.</p>
            </div>
            <button onClick={reconnectWallet}
              className="font-sans text-sm font-semibold text-white bg-[#92400e] px-3 py-1.5 rounded-lg cursor-pointer shrink-0">
              Reconnect →
            </button>
          </div>
        )}
        {account && walletInfo && account.address.toLowerCase() !== walletInfo.address.toLowerCase() && (
          <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-xl p-4 mb-5">
            <p className="font-sans text-sm text-[#9a3412]">
              ⚠️ Connected wallet <strong>{account.address.slice(0, 8)}…</strong> doesn&apos;t match your registered wallet{" "}
              <strong>{walletInfo?.address.slice(0, 8)}…</strong>. Switch accounts in MetaMask.
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {step !== "form" && step !== "error" && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {STEPS.map(({ key, label }, i) => {
              const currentIdx = STEP_ORDER.indexOf(step);
              const thisIdx = STEP_ORDER.indexOf(key);
              const done = currentIdx > thisIdx;
              const active = step === key;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    done ? "bg-[#22c55e] text-white" : active ? "bg-[#7b3fe4] text-white animate-pulse" : "bg-[#e5e5e5] text-[#999]"
                  }`}>
                    {done ? "✓" : "·"}
                  </div>
                  <span className={`font-sans text-sm ${active ? "text-[#7b3fe4] font-semibold" : "text-[#999]"}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && <span className="text-[#ddd]">→</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Done state */}
        {step === "done" && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded-xl p-5 mb-6">
            <p className="font-condensed text-2xl text-[#166534] mb-1 text-center">Order Created!</p>
            {txHash && (
              <div className="mt-3 pt-3 border-t border-[#86efac]">
                <p className="font-sans text-xs text-[#166534] uppercase tracking-widest mb-1">Transaction</p>
                <a href={txUrl(txHash)} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-[#15803d] underline break-all">
                  {txHash.slice(0, 18)}…{txHash.slice(-10)} ↗
                </a>
              </div>
            )}
            <p className="font-sans text-sm text-[#15803d] mt-3 text-center">Redirecting to marketplace…</p>
          </div>
        )}

        {/* Review panel */}
        {step === "review" && (
          <div className="bg-white border-2 border-black rounded-xl p-6 mb-6 space-y-5">
            <h2 className="font-condensed text-2xl tracking-[0.5px]">Confirm your listing</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Amount", `${amount} USDC`],
                ["Price per USDC", `₹${pricePerUnit}`],
                ["Total value", `₹${totalInr ? parseFloat(totalInr).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—"}`],
                ["Payment methods", paymentMethods.join(", ")],
                ["Partial orders", partialAllowed ? `Yes — min ${minOrderAmount} USDC` : "No (full order only)"],
                ...(profilePayment?.upiId ? [["UPI ID", profilePayment.upiId]] : []),
                ...(profilePayment?.bankAccount ? [["Bank account", profilePayment.bankAccount], ["IFSC", profilePayment.ifscCode ?? ""]] : []),
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="font-sans text-xs text-[#999] uppercase tracking-widest">{k}</p>
                  <p className="font-sans text-sm font-semibold text-[#111]">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg px-4 py-3">
              <p className="font-sans text-sm text-[#92400e] leading-relaxed">
                MetaMask will ask you to approve exactly <strong>{amount} USDC</strong> for the escrow — not unlimited.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep("form")}
                className="flex-1 py-3 border-[1.5px] border-[#e5e5e5] rounded-xl font-sans text-sm text-[#555] cursor-pointer bg-white">
                ← Back to Edit
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-3 bg-black text-white rounded-xl font-sans text-sm font-semibold cursor-pointer">
                Confirm & Approve USDC →
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className={`space-y-6 ${isBusy || step === "done" || step === "review" ? "opacity-50 pointer-events-none" : ""}`}>

          <div>
            <label className="font-sans text-sm font-semibold text-[#333] uppercase tracking-widest block mb-2">
              Amount (USDC)
            </label>
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
              className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-xl px-4 py-3 font-mono text-base text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors" />
          </div>

          {/* Partial orders toggle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="font-sans text-sm font-semibold text-[#333] uppercase tracking-widest block">
                  Allow Partial Orders
                </label>
                <p className="font-sans text-xs text-[#999] mt-0.5">
                  Let buyers purchase less than the full amount
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setPartialAllowed((p) => !p); setMinOrderAmount(""); }}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer border-0 shrink-0 p-0 ${
                  partialAllowed ? "bg-[#7b3fe4]" : "bg-[#e5e5e5]"
                }`}
              >
                <span className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white shadow transition-all ${
                  partialAllowed ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            {partialAllowed && (
              <div>
                <label className="font-sans text-sm font-semibold text-[#333] uppercase tracking-widest block mb-2">
                  Minimum Order (USDC)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder={`e.g. ${amount ? Math.floor(parseFloat(amount) * 0.1) || 10 : 10}`}
                  className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-xl px-4 py-3 font-mono text-base text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors"
                />
                {minOrderAmount && amount && (
                  <p className="font-sans text-xs text-[#7b3fe4] mt-1.5">
                    Buyers can purchase between {minOrderAmount} and {amount} USDC
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="font-sans text-sm font-semibold text-[#333] uppercase tracking-widest block mb-2">
              Price per USDC (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-base text-[#999]">₹</span>
              <input type="number" min="1" step="0.01" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder="e.g. 95.00"
                className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-xl pl-8 pr-4 py-3 font-mono text-base text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors" />
            </div>
            {totalInr && (
              <p className="font-sans text-sm text-[#7b3fe4] mt-2">
                Total value: ₹{parseFloat(totalInr).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Network — detected from MetaMask */}
          <div>
            <label className="font-sans text-sm font-semibold text-[#333] uppercase tracking-widest block mb-2">
              Network
            </label>
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
              chainOk ? "bg-[#f0fdf4] border-[#bbf7d0]" : "bg-[#fff7ed] border-[#fed7aa]"
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${chainOk ? "bg-[#22c55e]" : "bg-[#f97316]"}`} />
              <div>
                <p className="font-sans text-sm font-semibold text-[#111]">
                  {activeChainName ?? (account ? "Detecting…" : "Not connected")}
                </p>
                <p className={`font-sans text-xs mt-0.5 ${chainOk ? "text-[#16a34a]" : "text-[#9a3412]"}`}>
                  {chainOk
                    ? `✓ Correct network — orders post to ${sellChainLabel}`
                    : `Switch to ${sellChainLabel} in MetaMask to continue`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="font-sans text-sm font-semibold text-[#333] uppercase tracking-widest block mb-2">
              Accepted Payment Methods
            </label>
            <div className="flex gap-2">
              {(["UPI", "IMPS", "NEFT"] as PaymentMethod[])
                .filter((m) => m !== "UPI" || !!profilePayment?.upiId)
                .map((method) => (
                  <button key={method} type="button" onClick={() => togglePayment(method)}
                    className={`py-2 px-5 rounded-full border-[1.5px] font-sans text-sm font-medium cursor-pointer transition-colors ${
                      paymentMethods.includes(method)
                        ? "border-[#7b3fe4] bg-[#7b3fe4] text-white"
                        : "border-[#e5e5e5] bg-white text-[#555]"
                    }`}>
                    {method}
                  </button>
                ))}
            </div>
          </div>

          {/* Payment details — read-only from profile */}
          <div className="bg-[#f8f8f8] border border-[#e8e8e8] rounded-xl px-5 py-4 space-y-3">
            <p className="font-sans text-xs font-semibold text-[#999] uppercase tracking-widest">Your Payment Details</p>
            {profilePayment?.bankAccount ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-sans text-xs text-[#aaa] uppercase tracking-widest mb-1">Bank Account</p>
                  <p className="font-mono text-sm font-semibold text-[#111]">{profilePayment.bankAccount}</p>
                </div>
                <div>
                  <p className="font-sans text-xs text-[#aaa] uppercase tracking-widest mb-1">IFSC</p>
                  <p className="font-mono text-sm font-semibold text-[#111]">{profilePayment.ifscCode}</p>
                </div>
                {profilePayment.upiId && (
                  <div className="col-span-2 mt-2 pt-3 border-t border-[#e8e8e8] flex items-center justify-between">
                    <div>
                      <p className="font-sans text-xs text-[#aaa] uppercase tracking-widest mb-1">UPI ID</p>
                      <p className="font-mono text-sm font-semibold text-[#111]">{profilePayment.upiId}</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-[#e5e5e5] shrink-0 shadow-sm ml-4">
                      <QRCodeSVG 
                        value={`upi://pay?pa=${profilePayment.upiId}&cu=INR`} 
                        size={96} 
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-sans text-sm text-[#dc2626]">
                No payment details on file. Complete the bank statement step in{" "}
                <Link href="/onboarding/bank-statement" className="underline">onboarding</Link>.
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-xl px-4 py-3">
              <p className="font-sans text-sm text-[#dc2626]">{errorMsg}</p>
            </div>
          )}

          {!chainOk && activeChainName && (
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-[#ea580c] shrink-0 mt-0.5">⚠</span>
              <p className="font-sans text-sm text-[#9a3412] leading-relaxed">
                Your wallet is on <strong>{activeChainName}</strong>. Switch to <strong>{sellChainLabel}</strong> in MetaMask to post this order.
              </p>
            </div>
          )}
          <button type="button"
            onClick={() => {
              const err = validate();
              if (err) { setErrorMsg(err); return; }
              setErrorMsg("");
              setStep("review");
            }}
            disabled={!walletOk || !chainOk || isBusy || step === "done"}
            className="w-full py-4 bg-black text-white rounded-xl font-condensed text-2xl tracking-[1px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
            {isBusy
              ? step === "approving" ? "Approving USDC…" : step === "creating" ? "Creating Order…" : "Saving…"
              : "Review Order →"}
          </button>

          <p className="font-sans text-sm text-[#999] text-center leading-relaxed">
            Your USDC moves to the escrow contract on submission. You release it after confirming INR payment.
          </p>
        </div>
      </div>
    </div>
  );
}
