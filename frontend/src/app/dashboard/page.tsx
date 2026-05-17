"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletBalanceCard } from "@/components/WalletBalanceCard";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  LOGIN_DONE: {
    label: "Onboarding Pending",
    color: "#92400e",
    bg: "#fffbeb",
    desc: "You've signed in. Complete verification to start trading.",
  },
  ONBOARDING_PENDING: {
    label: "Verification In Progress",
    color: "#1e40af",
    bg: "#eff6ff",
    desc: "You're in the middle of verification. Pick up where you left off.",
  },
  WALLET_PENDING: {
    label: "Wallet Connection Pending",
    color: "#6b21a8",
    bg: "#faf5ff",
    desc: "Verification passed. Connect your wallet to start trading.",
  },
  VERIFICATION_PENDING: {
    label: "Screening In Progress",
    color: "#0f766e",
    bg: "#f0fdfa",
    desc: "Your wallet is being screened. This usually takes a few minutes.",
  },
  VERIFIED: {
    label: "Verified Member",
    color: "#166534",
    bg: "#f0fdf4",
    desc: "You're fully verified. You can trade on the marketplace.",
  },
  REJECTED: {
    label: "Verification Rejected",
    color: "#991b1b",
    bg: "#fef2f2",
    desc: "One or more verification steps failed. Check your onboarding page.",
  },
  SUSPENDED: {
    label: "Account Suspended",
    color: "#1f2937",
    bg: "#f9fafb",
    desc: "Your account has been suspended. Contact support@cryptobazaar.co.in.",
  },
};

interface OnboardingStatus {
  userStatus: string;
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

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((d: OnboardingStatus) => setDbStatus(d))
      .catch(() => null);
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d: DashboardStats) => setStats(d))
      .catch(() => null);
  }, []);

  const userStatus = (dbStatus?.userStatus ?? "LOGIN_DONE") as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[userStatus] ?? STATUS_CONFIG["LOGIN_DONE"];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-[3px] border-lime border-t-transparent rounded-full animate-spin-fast" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#f0f0f0] px-5 md:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="nav-logo no-underline text-black">
          CRYPTOBAZAAR
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="font-sans text-[0.82rem] text-[#555] no-underline">
            Marketplace
          </Link>
          <button
            onClick={handleSignOut}
            className="font-sans text-[0.82rem] text-[#888] bg-transparent border border-[#e5e5e5] rounded-full py-[6px] px-4 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-[900px] mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Profile card */}
        <div className="bg-white border-[1.5px] border-solid border-[#e5e5e5] rounded-[20px] p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 mb-6">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.fullName ?? ""}
              width={72}
              height={72}
              className="rounded-full shrink-0 border-[3px] border-[#f0f0f0]"
            />
          )}
          <div className="flex-1">
            <h1 className="font-condensed text-[2rem] tracking-[0.5px] leading-none mb-1">
              {user?.fullName ?? "Welcome"}
            </h1>
            <p className="font-sans text-sm text-[#888] mb-3">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <div
              className="inline-flex items-center gap-2 py-[6px] px-[14px] rounded-full"
              style={{ background: statusConfig.bg }}
            >
              <span
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ background: statusConfig.color }}
              />
              <span
                className="font-sans text-[0.78rem] font-semibold"
                style={{ color: statusConfig.color }}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Action based on status */}
          {userStatus !== "VERIFIED" && userStatus !== "SUSPENDED" && (
            <Link
              href="/onboarding"
              className="py-3 px-6 bg-black text-white rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline shrink-0"
            >
              {userStatus === "LOGIN_DONE" ? "Start Verification →" : "Continue →"}
            </Link>
          )}
        </div>

        {/* Status description */}
        <div
          className="rounded-xl py-4 px-5 mb-6"
          style={{
            background: statusConfig.bg,
            border: `1.5px solid ${statusConfig.color}22`,
          }}
        >
          <p
            className="font-sans text-sm leading-[1.6]"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.desc}
          </p>
        </div>

        {/* Wallet balance widget */}
        {dbStatus?.walletAddress && dbStatus?.walletChain && (
          <div className="mb-6">
            <WalletBalanceCard
              walletAddress={dbStatus.walletAddress}
              walletChain={dbStatus.walletChain}
            />
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Trades",
              value: stats ? String(stats.totalTrades) : "—",
            },
            {
              label: "Trade Volume",
              value: stats
                ? `₹${stats.totalVolumeInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                : "—",
            },
            { label: "Member Rating", value: "—" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border-[1.5px] border-solid border-[#e5e5e5] rounded-[14px] py-5 px-6">
              <div className="font-condensed text-[2rem] tracking-[0.5px] mb-1">
                {stat.value}
              </div>
              <div className="font-sans text-[0.75rem] text-[#999] uppercase tracking-[1px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Verification checklist */}
        <div className="bg-white border-[1.5px] border-solid border-[#e5e5e5] rounded-[20px] py-6 px-5 md:py-7 md:px-8 mb-6">
          <h2 className="font-condensed text-[1.4rem] tracking-[0.5px] mb-5">
            Verification Status
          </h2>
          {[
            { label: "Google Login", done: true },
            { label: "KYC — Identity Verification", done: dbStatus?.kyc === "PASSED" },
            { label: "Bank Statement Review", done: dbStatus?.edd === "PASSED" },
            { label: "AI Questionnaire", done: dbStatus?.interview === "PASSED" },
            { label: "Wallet Connection", done: !!dbStatus?.walletAddress },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-3 py-3 border-b border-[#f5f5f5]">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[0.75rem] font-bold ${
                  step.done ? "bg-lime" : "bg-[#f0f0f0]"
                }`}
              >
                {step.done ? "✓" : ""}
              </div>
              <span
                className={`font-sans text-sm ${step.done ? "text-black" : "text-[#999]"}`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white border-[1.5px] border-solid border-[#e5e5e5] rounded-[20px] py-6 px-5 md:py-7 md:px-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-condensed text-[1.4rem] tracking-[0.5px]">
              Recent Activity
            </h2>
            <Link href="/marketplace" className="font-sans text-[0.78rem] text-[#888] no-underline">
              View marketplace →
            </Link>
          </div>
          {!stats || stats.activity.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-sans text-sm text-[#bbb]">
                No trades yet. Complete verification to start trading.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#f5f5f5]">
              {stats.activity.map((row) => (
                <Link
                  key={row.id}
                  href={`/marketplace/${row.id}`}
                  className="flex items-center justify-between py-4 no-underline hover:bg-[#fafafa] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-sans text-[0.85rem] font-semibold text-[#111]">
                      {row.action} {parseFloat(row.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} {row.asset}
                    </p>
                    <p className="font-sans text-[0.75rem] text-[#888] mt-[2px]">
                      {row.counterpartyName
                        ? `${row.role === "seller" ? "Buyer" : "Seller"}: ${row.counterpartyName} · `
                        : ""}
                      ₹{parseFloat(row.totalValueInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-sans text-[0.7rem] font-semibold px-3 py-[4px] rounded-full ${
                        row.status === "COMPLETED"
                          ? "bg-[#f0fdf4] text-[#166534]"
                          : row.status === "CANCELLED" || row.status === "EXPIRED"
                          ? "bg-[#f5f5f5] text-[#888]"
                          : row.status === "DISPUTED"
                          ? "bg-[#fef2f2] text-[#991b1b]"
                          : "bg-[#eff6ff] text-[#1e40af]"
                      }`}
                    >
                      {row.statusLabel}
                    </span>
                    <span className="font-sans text-[0.75rem] text-[#ccc]">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
