"use client";

import { useEffect, useState } from "react";
import {
  useActiveAccount,
  useSendTransaction,
  ConnectButton,
} from "thirdweb/react";
import {
  getContract,
  prepareContractCall,
  readContract,
  defineChain,
} from "thirdweb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { thirdwebClient } from "@/lib/thirdweb";
import { txUrl } from "@/lib/explorer";

const amoyChain = defineChain(80002);
const ESCROW_ADDR = (process.env.NEXT_PUBLIC_ESCROW_POLYGON_ADDRESS ??
  "") as `0x${string}`;
const USDC_ADDR = (process.env.NEXT_PUBLIC_AMOY_USDC_ADDRESS ??
  "") as `0x${string}`;

const escrowContract = getContract({
  client: thirdwebClient,
  chain: amoyChain,
  address: ESCROW_ADDR,
});
const usdcContract = getContract({
  client: thirdwebClient,
  chain: amoyChain,
  address: USDC_ADDR,
});

type Step = "form" | "approving" | "creating" | "saving" | "done" | "error";
type PaymentMethod = "UPI" | "IMPS" | "NEFT";

const STEPS: { key: Step; label: string }[] = [
  { key: "approving", label: "Approving USDC" },
  { key: "creating", label: "Creating order" },
  { key: "saving", label: "Saving" },
  { key: "done", label: "Done!" },
];
const STEP_ORDER = STEPS.map((s) => s.key);

export default function SellPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    chain: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    "UPI",
  ]);
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.walletAddress && d.walletChain) {
          setWalletInfo({ address: d.walletAddress, chain: d.walletChain });
        }
      })
      .catch(() => {});
  }, []);

  const totalInr =
    amount && pricePerUnit
      ? (parseFloat(amount) * parseFloat(pricePerUnit)).toFixed(2)
      : null;

  const togglePayment = (method: PaymentMethod) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const validate = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      return "Enter a valid amount.";
    if (
      !pricePerUnit ||
      isNaN(parseFloat(pricePerUnit)) ||
      parseFloat(pricePerUnit) <= 0
    )
      return "Enter a valid price.";
    if (paymentMethods.length === 0)
      return "Select at least one payment method.";
    if (paymentMethods.includes("UPI") && !upiId.trim())
      return "Enter your UPI ID.";
    if (
      (paymentMethods.includes("IMPS") || paymentMethods.includes("NEFT")) &&
      (!bankAccount.trim() || !ifsc.trim())
    )
      return "Enter your bank account number and IFSC code.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg("");

    try {
      const amountRaw = BigInt(Math.round(parseFloat(amount) * 1e6));
      const priceRaw = BigInt(Math.round(parseFloat(pricePerUnit) * 100));

      // Step 1: Approve USDC spend
      setStep("approving");
      await sendTx(
        prepareContractCall({
          contract: usdcContract,
          method: "function approve(address spender, uint256 amount)",
          params: [ESCROW_ADDR, amountRaw],
        })
      );

      // Read nextOrderId right after approve confirms — minimises race window
      const nextId = await readContract({
        contract: escrowContract,
        method: "function nextOrderId() view returns (uint256)",
        params: [],
      });

      // Step 2: Create order on-chain
      setStep("creating");
      const { transactionHash } = await sendTx(
        prepareContractCall({
          contract: escrowContract,
          method:
            "function createOrder(address token, uint128 amount, uint96 priceInr)",
          params: [USDC_ADDR, amountRaw, priceRaw],
        })
      );
      setTxHash(transactionHash);

      // Step 3: Save to DB
      setStep("saving");
      const orderId = `${ESCROW_ADDR.toLowerCase()}_${nextId.toString()}`;
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          chain: "POLYGON",
          asset: "USDC",
          amount: parseFloat(amount),
          pricePerUnit: parseFloat(pricePerUnit),
          escrowTxHash: transactionHash,
          escrowContractAddress: ESCROW_ADDR,
          paymentMethods,
          sellerUpiId: upiId || null,
          sellerBankAccount: bankAccount || null,
          sellerIfsc: ifsc || null,
        }),
      });

      setStep("done");
      setTimeout(() => router.push("/marketplace"), 1500);
    } catch (e: unknown) {
      console.error(e);
      setErrorMsg(
        e instanceof Error ? e.message : "Transaction failed. Please try again."
      );
      setStep("error");
    }
  };

  const isBusy =
    step === "approving" || step === "creating" || step === "saving";
  const needsBank =
    paymentMethods.includes("IMPS") || paymentMethods.includes("NEFT");

  if (walletInfo && walletInfo.chain !== "POLYGON") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="font-condensed text-2xl mb-2">
          Only available on Polygon
        </h2>
        <p className="font-sans text-sm text-[#666] max-w-xs leading-[1.6]">
          Your registered wallet is on {walletInfo.chain}. Escrow sell orders
          are currently only supported on Polygon. Support for {walletInfo.chain}{" "}
          is coming soon.
        </p>
        <Link
          href="/marketplace"
          className="mt-6 font-sans text-sm text-[#7b3fe4] underline"
        >
          ← Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-[#f0f0f0] px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <Link
          href="/"
          className="font-condensed text-base tracking-[3px] text-black no-underline"
        >
          CRYPTOBAZAAR
        </Link>
        <Link
          href="/marketplace"
          className="font-sans text-[0.82rem] text-[#888] no-underline"
        >
          ← Back to marketplace
        </Link>
      </header>

      <div className="max-w-[560px] mx-auto py-12 px-6">
        <h1 className="font-condensed text-[2.4rem] tracking-[1px] mb-1">
          SELL USDC
        </h1>
        <p className="font-sans text-[0.85rem] text-[#888] mb-8">
          Tokens are held in escrow until you confirm the buyer&apos;s INR
          payment.
        </p>

        {/* Wallet connection */}
        {!account && (
          <div className="bg-[#f5f0ff] border border-[#c4b5fd] rounded-[14px] p-5 mb-6">
            <p className="font-sans text-sm text-[#5b21b6] mb-3">
              Connect your wallet to sign the transaction.
            </p>
            <ConnectButton client={thirdwebClient} />
          </div>
        )}

        {account &&
          walletInfo &&
          account.address.toLowerCase() !==
            walletInfo.address.toLowerCase() && (
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-[14px] p-5 mb-6">
              <p className="font-sans text-sm text-[#9a3412]">
                ⚠️ Connected wallet{" "}
                <strong>{account.address.slice(0, 8)}…</strong> doesn&apos;t
                match your registered wallet{" "}
                <strong>{walletInfo?.address.slice(0, 8)}…</strong>. Please
                switch accounts in MetaMask.
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
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-bold ${
                      done
                        ? "bg-[#22c55e] text-white"
                        : active
                        ? "bg-[#7b3fe4] text-white animate-pulse"
                        : "bg-[#e5e5e5] text-[#999]"
                    }`}
                  >
                    {done ? "✓" : "·"}
                  </div>
                  <span
                    className={`font-sans text-[0.72rem] ${
                      active
                        ? "text-[#7b3fe4] font-semibold"
                        : "text-[#999]"
                    }`}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="text-[#ddd] text-sm">→</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === "done" && (
          <div className="bg-[#f0fdf4] border border-[#86efac] rounded-[14px] p-5 mb-6">
            <p className="font-condensed text-2xl text-[#166534] mb-1 text-center">
              Order Created!
            </p>
            {txHash && (
              <div className="mt-3 pt-3 border-t border-[#86efac]">
                <p className="font-sans text-[0.7rem] text-[#166534] uppercase tracking-[1px] mb-1">
                  Transaction
                </p>
                <a
                  href={txUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.72rem] text-[#15803d] underline break-all"
                >
                  {txHash.slice(0, 18)}…{txHash.slice(-10)} ↗
                </a>
              </div>
            )}
            <p className="font-sans text-sm text-[#15803d] mt-3 text-center">
              Redirecting to marketplace…
            </p>
          </div>
        )}

        {/* Form */}
        <div
          className={`space-y-5 ${
            isBusy || step === "done" ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {/* Amount */}
          <div>
            <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-[6px]">
              Amount (USDC)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
              className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-[10px] px-4 py-3 font-mono text-[1rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors"
            />
          </div>

          {/* Price per unit */}
          <div>
            <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-[6px]">
              Price per USDC (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-[1rem] text-[#999]">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder="e.g. 95.00"
                className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-[10px] pl-8 pr-4 py-3 font-mono text-[1rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors"
              />
            </div>
            {totalInr && (
              <p className="font-sans text-[0.78rem] text-[#7b3fe4] mt-[6px]">
                Total value: ₹
                {parseFloat(totalInr).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          {/* Payment methods */}
          <div>
            <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-[6px]">
              Accepted Payment Methods
            </label>
            <div className="flex gap-2">
              {(["UPI", "IMPS", "NEFT"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => togglePayment(method)}
                  className={`py-[7px] px-[18px] rounded-full border-[1.5px] border-solid font-sans text-[0.8rem] font-medium cursor-pointer ${
                    paymentMethods.includes(method)
                      ? "border-[#7b3fe4] bg-[#7b3fe4] text-white"
                      : "border-[#e5e5e5] bg-white text-[#555]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* UPI ID */}
          {paymentMethods.includes("UPI") && (
            <div>
              <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-[6px]">
                Your UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@upi"
                className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-[10px] px-4 py-3 font-mono text-[0.9rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors"
              />
            </div>
          )}

          {/* Bank details */}
          {needsBank && (
            <div className="space-y-3">
              <div>
                <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-[6px]">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 123456789012"
                  className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-[10px] px-4 py-3 font-mono text-[0.9rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors"
                />
              </div>
              <div>
                <label className="font-sans text-[0.78rem] font-semibold text-[#333] uppercase tracking-[0.8px] block mb-[6px]">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="w-full border-[1.5px] border-[#e5e5e5] bg-white rounded-[10px] px-4 py-3 font-mono text-[0.9rem] text-[#111] focus:outline-none focus:border-[#7b3fe4] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-[10px] px-4 py-3">
              <p className="font-sans text-sm text-[#dc2626]">{errorMsg}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!account || isBusy || step === "done"}
            className="w-full py-4 bg-black text-white rounded-[12px] font-condensed text-[1.2rem] tracking-[1px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isBusy
              ? step === "approving"
                ? "Approving USDC…"
                : step === "creating"
                ? "Creating Order…"
                : "Saving…"
              : "Create Order →"}
          </button>

          <p className="font-sans text-[0.78rem] text-[#999] text-center leading-[1.6]">
            Your USDC moves to the escrow contract on submission. You release it
            after confirming INR payment.
          </p>
        </div>
      </div>
    </div>
  );
}
