"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
}

interface OnboardingStatus {
  userStatus: string;
  memberNumber: number | null;
  walletAddress: string | null;
  walletChain: string | null;
  kyc: string;
  edd: string;
  interview: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<OnboardingStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/onboarding/status").then((r) => r.json()).catch(() => null),
      fetch("/api/dashboard/stats").then((r) => r.json()).catch(() => null),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]).then(([statusData, statsData]) => {
      if (statusData) setDbStatus(statusData);
      if (statsData) setStats(statsData);
      setIsLoadingDb(false);
    });
  }, []);

  const userStatus = dbStatus?.userStatus ?? "LOGIN_DONE";
  const isVerified = userStatus === "VERIFIED";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded || isLoadingDb) {
    return <LoadingSpinner />;
  }

  const activityStatusStyle = (status: string) => {
    if (status === "COMPLETED") return "bg-[#f0fdf4] text-[#166534]";
    if (status === "CANCELLED" || status === "EXPIRED") return "bg-[#f5f5f5] text-[#888]";
    if (status === "DISPUTED") return "bg-[#fef2f2] text-[#991b1b]";
    return "bg-[#eff6ff] text-[#1e40af]";
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#ebebeb] px-5 md:px-10 h-[52px] flex items-center justify-between">
        <Link href="/" className="nav-logo no-underline text-black">
          CRYPTOBAZAAR
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="font-sans text-[0.78rem] text-[#666] no-underline">
            Marketplace
          </Link>
          <button
            onClick={handleSignOut}
            className="font-sans text-[0.76rem] text-[#888] bg-transparent border border-[#e8e8e8] rounded-full py-[5px] px-[14px] cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto py-3 md:py-5 px-4 md:px-5">

        {/* Profile card */}
        <div className="bg-white border border-[#e8e8e8] rounded-[12px] p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 mb-3">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.fullName ?? ""}
              width={46}
              height={46}
              className="rounded-full shrink-0 border-2 border-[#f0f0f0]"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-[6px] flex-wrap mb-[2px]">
              <h1 className="font-condensed text-[1.45rem] tracking-[0.5px] leading-none">
                {user?.fullName ?? "Welcome"}
              </h1>
              {/* Member number — subtle muted inline text, not a badge */}
              {dbStatus?.memberNumber && (
                <span className="font-sans text-[0.68rem] text-[#ccc]">
                  · #{dbStatus.memberNumber}
                </span>
              )}
              {/* Verified chip — lime, inline with name */}
              {isVerified && (
                <span className="font-sans text-[0.6rem] font-bold bg-lime text-black px-[6px] py-[1px] rounded-[3px] tracking-[0.3px]">
                  ✓ VERIFIED
                </span>
              )}
            </div>
            <p className="font-sans text-[0.74rem] text-[#999]">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {isVerified ? (
            <Link
              href="/marketplace"
              className="py-[7px] px-4 bg-black text-white rounded-[8px] font-condensed text-[0.92rem] tracking-[1px] no-underline shrink-0"
            >
              Marketplace →
            </Link>
          ) : (
            <Link
              href="/onboarding"
              className="py-[7px] px-4 bg-black text-white rounded-[8px] font-condensed text-[0.92rem] tracking-[1px] no-underline shrink-0"
            >
              {userStatus === "LOGIN_DONE" ? "Start Verification →" : "Continue →"}
            </Link>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[6px] mb-3">
          {[
            { label: "Trades", value: stats ? String(stats.totalTrades) : "—" },
            {
              label: "Volume",
              value: stats
                ? `₹${stats.totalVolumeInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                : "—",
            },
            { label: "Rating", value: "—" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#e8e8e8] rounded-[10px] py-3 px-4">
              <div className="font-condensed text-[1.5rem] tracking-[0.5px] mb-[2px]">
                {stat.value}
              </div>
              <div className="font-sans text-[0.62rem] text-[#aaa] uppercase tracking-[1px] font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Wallet balance card — already has chain + token switcher built in */}
        {dbStatus?.walletAddress && dbStatus?.walletChain && (
          <div className="mb-3">
            <WalletBalanceCard
              walletAddress={dbStatus.walletAddress}
              walletChain={dbStatus.walletChain}
            />
          </div>
        )}

        {/* Two-column: verification checklist + recent activity */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-[6px]">

          {/* Verification checklist */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] py-3 px-4">
            <p className="font-sans text-[0.62rem] text-[#aaa] uppercase tracking-[1px] font-semibold mb-[10px]">
              Verification
            </p>
            {[
              { label: "Google Login",                done: true },
              { label: "KYC — Identity",              done: dbStatus?.kyc === "PASSED" },
              { label: "Bank Statement",              done: dbStatus?.edd === "PASSED" },
              { label: "AI Questionnaire",            done: dbStatus?.interview === "PASSED" },
              { label: "Wallet Connection",           done: !!dbStatus?.walletAddress },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-[8px] py-[5px] border-b border-[#f5f5f5] last:border-b-0">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[0.52rem] font-bold ${
                    step.done ? "bg-lime" : "bg-[#f2f2f2]"
                  }`}
                >
                  {step.done ? "✓" : ""}
                </div>
                <span className={`font-sans text-[0.78rem] ${step.done ? "text-black" : "text-[#ccc]"}`}>
                  {step.label}
                </span>
              </div>
            ))}

            {!isVerified && (
              <Link
                href="/onboarding"
                className="mt-3 block text-center font-sans text-[0.75rem] font-semibold text-black bg-lime py-[6px] rounded-[7px] no-underline"
              >
                Continue verification →
              </Link>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] py-3 px-4">
            <div className="flex justify-between items-center mb-[10px]">
              <p className="font-sans text-[0.62rem] text-[#aaa] uppercase tracking-[1px] font-semibold">
                Recent Activity
              </p>
              <Link href="/marketplace" className="font-sans text-[0.73rem] text-[#888] no-underline">
                Marketplace →
              </Link>
            </div>

            {!stats || stats.activity.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-sans text-sm text-[#ccc]">
                  No trades yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#f5f5f5]">
                {stats.activity.map((row) => (
                  <Link
                    key={row.id}
                    href={`/marketplace/${row.id}`}
                    className="flex items-center justify-between py-[7px] no-underline hover:bg-[#fafafa] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-sans text-[0.8rem] font-semibold text-[#111]">
                        {row.action} {parseFloat(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {row.asset}
                      </p>
                      <p className="font-sans text-[0.71rem] text-[#999] mt-[1px]">
                        {row.counterpartyName
                          ? `${row.role === "seller" ? "Buyer" : "Seller"}: ${row.counterpartyName} · `
                          : ""}
                        ₹{parseFloat(row.totalValueInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <span className={`font-sans text-[0.63rem] font-semibold px-[9px] py-[2px] rounded-full whitespace-nowrap ${activityStatusStyle(row.status)}`}>
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
