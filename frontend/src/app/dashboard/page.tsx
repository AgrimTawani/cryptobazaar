"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EnableNotifications } from "@/components/EnableNotifications";

interface ActivityRow {
  id: string;
  role: "seller" | "buyer";
  action: string;
  amount: string;
  asset: string;
  totalValueInr: string;
  status: string;
  statusLabel: string;
  counterpartyName: string | null;
  updatedAt: string;
}

interface DashboardStats {
  totalTrades: number;
  totalVolumeInr: number;
  activity: ActivityRow[];
  avgSellerRating: number | null;
  sellerRatingCount: number;
}

interface OnboardingStatus {
  userStatus: string;
  memberNumber: number | null;
  walletAddress: string | null;
  walletChain: string | null;
  kyc: string;
  edd: string;
  interview: string;
  upiId?: string | null;
  bankAccount?: string | null;
  ifscCode?: string | null;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<OnboardingStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Forms for adding payment details
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [upiInput, setUpiInput] = useState("");
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankAccInput, setBankAccInput] = useState("");
  const [ifscInput, setIfscInput] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchDashboardData = () => {
    Promise.all([
      fetch("/api/onboarding/status").then((r) => r.json()).catch(() => null),
      fetch("/api/dashboard/stats").then((r) => r.json()).catch(() => null),
    ]).then(([statusData, statsData]) => {
      if (statusData) setDbStatus(statusData);
      if (statsData) setStats(statsData);
      setIsLoadingDb(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddPaymentDetail = async (type: "upi" | "bank") => {
    if (type === "upi" && !upiInput) return;
    if (type === "bank" && (!bankAccInput || !ifscInput)) return;

    setIsSubmittingPayment(true);
    try {
      const payload = type === "upi" 
        ? { upiId: upiInput } 
        : { bankAccount: bankAccInput, ifscCode: ifscInput };
        
      const res = await fetch("/api/dashboard/payment-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (type === "upi") setShowAddUpi(false);
        if (type === "bank") setShowAddBank(false);
        fetchDashboardData(); // Refresh data
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add payment detail");
      }
    } catch (e) {
      alert("Error adding payment detail");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const userStatus = dbStatus?.userStatus ?? "LOGIN_DONE";
  const isVerified = userStatus === "VERIFIED";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded || isLoadingDb) return <LoadingSpinner />;

  const activityBadge = (status: string) => {
    if (status === "COMPLETED") return "bg-[#f0fdf4] text-[#166534]";
    if (status === "CANCELLED" || status === "EXPIRED") return "bg-[#f5f5f5] text-[#888]";
    if (status === "DISPUTED") return "bg-[#fef2f2] text-[#991b1b]";
    return "bg-[#eff6ff] text-[#1e40af]";
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-white border-b border-[#f2f2f2] px-5 md:px-10 h-[64px] flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="nav-logo no-underline text-black">CRYPTOBAZAAR</Link>
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="font-sans text-sm text-[#555] no-underline">Marketplace</Link>
          <button onClick={handleSignOut}
            className="font-sans text-sm text-[#888] bg-transparent border border-[#e5e5e5] rounded-full py-1.5 px-4 cursor-pointer">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto py-6 px-4 md:px-6">

        <div className="mb-4">
          <EnableNotifications variant="banner" />
        </div>

        {/* Profile card */}
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          {user?.imageUrl && (
            <Image src={user.imageUrl} alt={user.fullName ? `${user.fullName}'s avatar` : "User avatar"} width={56} height={56}
              className="rounded-full shrink-0 border-2 border-[#f0f0f0]" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-condensed text-[1.8rem] tracking-[0.5px] leading-none">
                {user?.fullName ?? "Welcome"}
              </h1>
              {dbStatus?.memberNumber && (
                <span className="font-sans text-sm text-[#ccc]">· #{dbStatus.memberNumber}</span>
              )}
              {isVerified && (
                <span className="font-sans text-xs font-bold bg-lime text-black px-2 py-0.5 rounded-[3px] tracking-tight">
                  ✓ VERIFIED
                </span>
              )}
            </div>
            <p className="font-sans text-sm text-[#888]">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          {isVerified ? (
            <Link href="/marketplace"
              className="py-2.5 px-5 bg-black text-white rounded-[10px] font-condensed text-lg tracking-[1px] no-underline shrink-0">
              Marketplace →
            </Link>
          ) : (
            <Link href="/onboarding"
              className="py-2.5 px-5 bg-black text-white rounded-[10px] font-condensed text-lg tracking-[1px] no-underline shrink-0">
              {userStatus === "LOGIN_DONE" ? "Start Verification →" : "Continue →"}
            </Link>
          )}
        </div>

        {/* Three-column Dashboard Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-stretch">
          {/* Card 1: Stats (Vertical) */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 flex flex-col justify-between gap-4">
            {[
              { label: "Total Trades", value: stats ? String(stats.totalTrades) : "—" },
              { label: "Trade Volume", value: stats ? `₹${stats.totalVolumeInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—" },
              {
                label: "Rating",
                value: stats?.avgSellerRating != null
                  ? `★ ${stats.avgSellerRating.toFixed(1)} (${stats.sellerRatingCount})`
                  : "—",
              },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-condensed text-[2.2rem] tracking-[0.5px] mb-1 leading-none">{s.value}</div>
                <div className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Card 2: Wallet Details */}
          <div className="h-full">
            {dbStatus?.walletAddress ? (
              <WalletBalanceCard walletAddress={dbStatus.walletAddress} className="h-full flex flex-col justify-between" />
            ) : (
              <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 h-full flex flex-col justify-center items-center text-center">
                 <p className="font-sans text-sm text-[#888]">No wallet connected</p>
                 <Link href="/onboarding/wallet" className="mt-2 font-sans text-sm font-semibold text-[#7b3fe4] no-underline">Connect Wallet →</Link>
              </div>
            )}
          </div>

          {/* Card 3: Payment Details */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 flex flex-col h-full">
            <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold mb-4">Payment Details</p>
            <div className="flex flex-col gap-6 flex-1 justify-center">
              {/* UPI Section */}
              <div>
                {dbStatus?.upiId ? (
                  <div className="flex gap-4 items-center">
                    <div>
                      <p className="font-sans text-xs text-[#888] mb-0.5">UPI ID</p>
                      <p className="font-sans text-sm font-medium text-[#111] break-all">{dbStatus.upiId}</p>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-[#e5e5e5] shrink-0 ml-auto">
                      <QRCodeSVG 
                        value={`upi://pay?pa=${dbStatus.upiId}&cu=INR`} 
                        size={56} 
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                  </div>
                ) : (
                  showAddUpi ? (
                    <div className="flex flex-col gap-2">
                      <p className="font-sans text-xs text-[#888]">Add UPI ID</p>
                      <input 
                        type="text" 
                        placeholder="Enter UPI ID" 
                        value={upiInput} 
                        onChange={e => setUpiInput(e.target.value)}
                        className="font-sans text-sm p-2 border border-[#ccc] rounded-md focus:outline-none focus:border-black"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAddPaymentDetail("upi")} disabled={isSubmittingPayment} className="font-sans text-xs bg-black text-white px-3 py-1.5 rounded-md cursor-pointer disabled:opacity-50">Save</button>
                        <button onClick={() => setShowAddUpi(false)} className="font-sans text-xs bg-transparent text-[#888] px-3 py-1.5 cursor-pointer border-0">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddUpi(true)} className="font-sans text-sm text-[#7b3fe4] font-medium border-0 bg-transparent cursor-pointer p-0 underline hover:text-[#5e2db8]">+ Add UPI ID</button>
                  )
                )}
              </div>

              {/* Bank Section */}
              <div>
                {dbStatus?.bankAccount ? (
                  <div>
                    <p className="font-sans text-xs text-[#888] mb-0.5">Bank Account</p>
                    <p className="font-sans text-sm font-medium text-[#111]">{dbStatus.bankAccount}</p>
                    {dbStatus.ifscCode && <p className="font-sans text-xs text-[#666] mt-0.5">IFSC: {dbStatus.ifscCode}</p>}
                  </div>
                ) : (
                  showAddBank ? (
                    <div className="flex flex-col gap-2">
                      <p className="font-sans text-xs text-[#888]">Add Bank Account</p>
                      <input 
                        type="text" 
                        placeholder="Account Number" 
                        value={bankAccInput} 
                        onChange={e => setBankAccInput(e.target.value)}
                        className="font-sans text-sm p-2 border border-[#ccc] rounded-md focus:outline-none focus:border-black"
                      />
                      <input 
                        type="text" 
                        placeholder="IFSC Code" 
                        value={ifscInput} 
                        onChange={e => setIfscInput(e.target.value.toUpperCase())}
                        className="font-sans text-sm p-2 border border-[#ccc] rounded-md focus:outline-none focus:border-black uppercase"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAddPaymentDetail("bank")} disabled={isSubmittingPayment} className="font-sans text-xs bg-black text-white px-3 py-1.5 rounded-md cursor-pointer disabled:opacity-50">Save</button>
                        <button onClick={() => setShowAddBank(false)} className="font-sans text-xs bg-transparent text-[#888] px-3 py-1.5 cursor-pointer border-0">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddBank(true)} className="font-sans text-sm text-[#7b3fe4] font-medium border-0 bg-transparent cursor-pointer p-0 underline hover:text-[#5e2db8]">+ Add Bank Account</button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Checklist + Activity */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3">

          <div className="flex flex-col gap-3">
            <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
              <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold mb-4">Verification</p>
            {[
              { label: "Google Login",       done: true },
              { label: "KYC — Identity",     done: dbStatus?.kyc === "PASSED" },
              { label: "Bank Statement",     done: dbStatus?.edd === "PASSED" },
              { label: "AI Questionnaire",   done: dbStatus?.interview === "PASSED" },
              { label: "Wallet Connection",  done: !!dbStatus?.walletAddress },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3 py-2.5 border-b border-[#f5f5f5] last:border-b-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  step.done ? "bg-lime" : "bg-[#f2f2f2]"
                }`}>
                  {step.done ? "✓" : ""}
                </div>
                <span className={`font-sans text-sm ${step.done ? "text-black" : "text-[#bbb]"}`}>
                  {step.label}
                </span>
              </div>
            ))}
            {!isVerified && (
              <Link href="/onboarding"
                className="mt-4 block text-center font-sans text-sm font-semibold text-black bg-lime py-2 rounded-lg no-underline">
                Continue verification →
              </Link>
            )}
            </div>
          </div>

          <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="font-sans text-xs text-[#999] uppercase tracking-widest font-semibold">Recent Activity</p>
              <Link href="/marketplace" className="font-sans text-sm text-[#888] no-underline">View marketplace →</Link>
            </div>
            {!stats || stats.activity.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-sans text-sm text-[#bbb]">No trades yet. Complete verification to start trading.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#f5f5f5]">
                {stats.activity.map((row) => (
                  <Link key={row.id} href={`/marketplace/${row.id}`}
                    className="flex items-center justify-between py-3 no-underline hover:bg-[#fafafa] -mx-2 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-sans text-sm font-semibold text-[#111]">
                        {row.action} {parseFloat(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {row.asset}
                      </p>
                      <p className="font-sans text-xs text-[#888] mt-0.5">
                        {row.counterpartyName ? `${row.role === "seller" ? "Buyer" : "Seller"}: ${row.counterpartyName} · ` : ""}
                        ₹{parseFloat(row.totalValueInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${activityBadge(row.status)}`}>
                      {row.statusLabel}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
