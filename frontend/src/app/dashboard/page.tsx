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
    if (status === "COMPLETED") return "bg-lime text-black border border-lime/20";
    if (status === "CANCELLED" || status === "EXPIRED") return "bg-[#f5f5f5] text-[#888] border border-[#e5e5e5]";
    if (status === "DISPUTED") return "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]";
    return "bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]";
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-[#f0f0f0] px-5 md:px-10 h-[64px] flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="nav-logo no-underline text-black">CRYPTOBAZAAR</Link>
        <div className="flex items-center gap-6">
          <Link href="/marketplace" className="font-condensed text-[1.2rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors no-underline uppercase hidden md:block">Marketplace</Link>
          <button onClick={handleSignOut}
            className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors bg-transparent border border-[#e5e5e5] hover:border-black rounded-full py-1.5 px-5 cursor-pointer uppercase">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto py-8 px-5 md:px-8">

        <div className="mb-6">
          <EnableNotifications variant="banner" />
        </div>

        {/* Profile card */}
        <div className="bg-white border border-[#f0f0f0] rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {user?.imageUrl && (
            <Image src={user.imageUrl} alt={user.fullName ? `${user.fullName}'s avatar` : "User avatar"} width={80} height={80}
              className="rounded-full shrink-0 border border-[#e5e5e5]" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-condensed text-[2.5rem] tracking-[1px] leading-none uppercase m-0">
                {user?.fullName ?? "Welcome"}
              </h1>
              {dbStatus?.memberNumber && (
                <span className="font-sans text-sm text-[#999] font-medium mt-1">· #{dbStatus.memberNumber}</span>
              )}
              {isVerified && (
                <span className="font-sans text-[0.65rem] font-bold bg-lime text-black px-2.5 py-1 rounded-full tracking-[1px] uppercase mt-1">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="font-sans text-[0.95rem] text-[#666] m-0">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
          {isVerified ? (
            <Link href="/marketplace"
              className="font-condensed text-[1.2rem] tracking-[0.05em] uppercase py-3.5 px-8 bg-black text-white rounded-full border border-black hover:bg-lime hover:text-black hover:border-lime transition-all duration-300 shadow-sm shrink-0 no-underline text-center w-full md:w-auto mt-2 md:mt-0">
              Marketplace →
            </Link>
          ) : (
            <Link href="/onboarding"
              className="font-condensed text-[1.2rem] tracking-[0.05em] uppercase py-3.5 px-8 bg-black text-white rounded-full border border-black hover:bg-lime hover:text-black hover:border-lime transition-all duration-300 shadow-sm shrink-0 no-underline text-center w-full md:w-auto mt-2 md:mt-0">
              {userStatus === "LOGIN_DONE" ? "Start Verification →" : "Continue →"}
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div key={s.label} className="bg-white border border-[#f0f0f0] rounded-[20px] py-8 px-6 flex flex-col items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-1">
              <div className="font-condensed text-[3.5rem] text-black leading-none tracking-wide mb-3">{s.value}</div>
              <div className="font-sans text-[0.7rem] font-bold text-black/60 tracking-[2px] uppercase text-center">{s.label}</div>
            </div>
          ))}
        </div>

        {dbStatus?.walletAddress && (
          <div className="mb-6">
            <WalletBalanceCard walletAddress={dbStatus.walletAddress} />
          </div>
        )}

        {/* Two-column: checklist + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          <div className="flex flex-col gap-6">
            {/* Verification Checklist */}
            <div className="bg-white border border-[#f0f0f0] rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h2 className="font-condensed text-[1.8rem] tracking-[1px] uppercase mb-5 m-0 text-black">Verification</h2>
              <div className="flex flex-col">
                {[
                  { label: "Google Login",       done: true },
                  { label: "KYC — Identity",     done: dbStatus?.kyc === "PASSED" },
                  { label: "Bank Statement",     done: dbStatus?.edd === "PASSED" },
                  { label: "AI Questionnaire",   done: dbStatus?.interview === "PASSED" },
                  { label: "Wallet Connection",  done: !!dbStatus?.walletAddress },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-4 py-3.5 border-b border-[#f5f5f5] last:border-b-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                      step.done ? "bg-lime text-black" : "bg-[#f2f2f2] text-transparent"
                    }`}>
                      {step.done ? "✓" : ""}
                    </div>
                    <span className={`font-sans text-[0.95rem] font-medium ${step.done ? "text-black" : "text-[#999]"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              {!isVerified && (
                <Link href="/onboarding"
                  className="mt-6 block text-center font-condensed text-[1.2rem] tracking-[1px] uppercase text-black bg-lime py-3.5 rounded-full no-underline hover:bg-[#c2eb00] transition-all shadow-sm">
                  Continue verification →
                </Link>
              )}
            </div>

            {/* Payment Details */}
            {(dbStatus?.upiId || dbStatus?.bankAccount || !dbStatus?.upiId || !dbStatus?.bankAccount) && (
              <div className="bg-white border border-[#f0f0f0] rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <h2 className="font-condensed text-[1.8rem] tracking-[1px] uppercase mb-5 m-0 text-black">Payment Details</h2>
                <div className="flex flex-col gap-6">
                  {/* UPI Section */}
                  <div>
                    {dbStatus?.upiId ? (
                      <div className="flex gap-4 items-center justify-between bg-[#fafafa] border border-[#f0f0f0] p-4 rounded-xl">
                        <div className="overflow-hidden">
                          <p className="font-sans text-[0.7rem] text-[#888] tracking-[1px] uppercase mb-1 m-0">UPI ID</p>
                          <p className="font-condensed text-[1.4rem] tracking-[1px] text-[#111] truncate m-0">{dbStatus.upiId}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-[#e5e5e5] shrink-0 shadow-sm">
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
                        <div className="flex flex-col gap-3 bg-[#fafafa] border border-[#f0f0f0] p-4 rounded-xl">
                          <p className="font-sans text-[0.75rem] text-[#888] tracking-[1px] uppercase m-0">Add UPI ID</p>
                          <input 
                            type="text" 
                            placeholder="Enter UPI ID" 
                            value={upiInput} 
                            onChange={e => setUpiInput(e.target.value)}
                            className="font-sans text-sm p-3 border border-[#ccc] rounded-lg focus:outline-none focus:border-black transition-colors"
                          />
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleAddPaymentDetail("upi")} disabled={isSubmittingPayment} className="font-condensed text-[1rem] tracking-[1px] uppercase bg-black text-white px-5 py-2 rounded-full cursor-pointer disabled:opacity-50 hover:bg-lime hover:text-black transition-colors">Save</button>
                            <button onClick={() => setShowAddUpi(false)} className="font-condensed text-[1rem] tracking-[1px] uppercase bg-transparent text-[#888] hover:text-black px-4 py-2 cursor-pointer border-0 transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddUpi(true)} className="w-full font-condensed text-[1.1rem] tracking-[1px] uppercase text-black bg-white border border-[#e5e5e5] hover:border-black py-3 rounded-xl cursor-pointer transition-colors shadow-sm">+ Add UPI ID</button>
                      )
                    )}
                  </div>

                  {/* Bank Section */}
                  <div>
                    {dbStatus?.bankAccount ? (
                      <div className="bg-[#fafafa] border border-[#f0f0f0] p-4 rounded-xl">
                        <p className="font-sans text-[0.7rem] text-[#888] tracking-[1px] uppercase mb-1 m-0">Bank Account</p>
                        <p className="font-condensed text-[1.4rem] tracking-[1px] text-[#111] mb-1 m-0">{dbStatus.bankAccount}</p>
                        {dbStatus.ifscCode && <p className="font-sans text-[0.8rem] text-[#666] mt-0.5 m-0">IFSC: {dbStatus.ifscCode}</p>}
                      </div>
                    ) : (
                      showAddBank ? (
                        <div className="flex flex-col gap-3 bg-[#fafafa] border border-[#f0f0f0] p-4 rounded-xl">
                          <p className="font-sans text-[0.75rem] text-[#888] tracking-[1px] uppercase m-0">Add Bank Account</p>
                          <input 
                            type="text" 
                            placeholder="Account Number" 
                            value={bankAccInput} 
                            onChange={e => setBankAccInput(e.target.value)}
                            className="font-sans text-sm p-3 border border-[#ccc] rounded-lg focus:outline-none focus:border-black transition-colors"
                          />
                          <input 
                            type="text" 
                            placeholder="IFSC Code" 
                            value={ifscInput} 
                            onChange={e => setIfscInput(e.target.value.toUpperCase())}
                            className="font-sans text-sm p-3 border border-[#ccc] rounded-lg focus:outline-none focus:border-black transition-colors uppercase"
                          />
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => handleAddPaymentDetail("bank")} disabled={isSubmittingPayment} className="font-condensed text-[1rem] tracking-[1px] uppercase bg-black text-white px-5 py-2 rounded-full cursor-pointer disabled:opacity-50 hover:bg-lime hover:text-black transition-colors">Save</button>
                            <button onClick={() => setShowAddBank(false)} className="font-condensed text-[1rem] tracking-[1px] uppercase bg-transparent text-[#888] hover:text-black px-4 py-2 cursor-pointer border-0 transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddBank(true)} className="w-full font-condensed text-[1.1rem] tracking-[1px] uppercase text-black bg-white border border-[#e5e5e5] hover:border-black py-3 rounded-xl cursor-pointer transition-colors shadow-sm">+ Add Bank Account</button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="bg-white border border-[#f0f0f0] rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] self-start">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-condensed text-[1.8rem] tracking-[1px] uppercase m-0 text-black">Recent Activity</h2>
              <Link href="/marketplace" className="font-condensed text-[1.1rem] tracking-[1px] uppercase text-[#888] hover:text-black transition-colors no-underline">View marketplace →</Link>
            </div>
            {!stats || stats.activity.length === 0 ? (
              <div className="text-center py-12 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
                <p className="font-sans text-[0.95rem] text-[#888] m-0">No trades yet. Complete verification to start trading.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#f5f5f5]">
                {stats.activity.map((row) => (
                  <Link key={row.id} href={`/marketplace/${row.id}`}
                    className="flex items-center justify-between py-4 no-underline hover:bg-[#fafafa] -mx-3 px-3 rounded-xl transition-colors group">
                    <div>
                      <p className="font-condensed text-[1.3rem] tracking-[0.5px] text-[#111] group-hover:text-black mb-0.5 m-0 uppercase">
                        {row.action} {parseFloat(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {row.asset}
                      </p>
                      <p className="font-sans text-[0.85rem] text-[#888] m-0">
                        {row.counterpartyName ? `${row.role === "seller" ? "Buyer" : "Seller"}: ${row.counterpartyName} · ` : ""}
                        <span className="font-medium text-[#555]">₹{parseFloat(row.totalValueInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                      </p>
                    </div>
                    <span className={`font-condensed text-[0.9rem] tracking-[1px] uppercase px-3 py-1.5 rounded-full whitespace-nowrap ${activityBadge(row.status)}`}>
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
