"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    desc: "Your account has been suspended. Contact support@cryptobazaar.in.",
  },
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Placeholder — will be replaced with real DB data
  const userStatus: keyof typeof STATUS_CONFIG = "LOGIN_DONE";
  const statusConfig = STATUS_CONFIG[userStatus];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #D4FF00", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Top bar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: "var(--condensed)", fontSize: "1rem", letterSpacing: "3px", color: "#000", textDecoration: "none" }}>
          CRYPTOBAZAAR
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/marketplace" style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "#555", textDecoration: "none" }}>
            Marketplace
          </Link>
          <button
            onClick={handleSignOut}
            style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "#888", background: "none", border: "1px solid #e5e5e5", borderRadius: "999px", padding: "6px 16px", cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Profile card */}
        <div style={{ background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: "20px", padding: "32px", display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.fullName ?? ""}
              width={72}
              height={72}
              style={{ borderRadius: "50%", flexShrink: 0, border: "3px solid #f0f0f0" }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "var(--condensed)", fontSize: "2rem", letterSpacing: "0.5px", lineHeight: 1, marginBottom: "4px" }}>
              {user?.fullName ?? "Welcome"}
            </h1>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: "#888", marginBottom: "12px" }}>
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: statusConfig.bg, borderRadius: "999px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusConfig.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", fontWeight: 600, color: statusConfig.color }}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Action based on status */}
          {userStatus !== "VERIFIED" && userStatus !== "SUSPENDED" && (
            <Link
              href="/onboarding"
              style={{ padding: "12px 24px", background: "#000", color: "#fff", borderRadius: "10px", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "1px", textDecoration: "none", flexShrink: 0 }}
            >
              {userStatus === "LOGIN_DONE" ? "Start Verification →" : "Continue →"}
            </Link>
          )}
        </div>

        {/* Status description */}
        <div style={{ background: statusConfig.bg, border: `1.5px solid ${statusConfig.color}22`, borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: statusConfig.color, lineHeight: 1.6 }}>
            {statusConfig.desc}
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Trades", value: "0" },
            { label: "Trade Volume", value: "₹0" },
            { label: "Member Rating", value: "—" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: "14px", padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--condensed)", fontSize: "2rem", letterSpacing: "0.5px", marginBottom: "4px" }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "#999", textTransform: "uppercase", letterSpacing: "1px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Verification checklist */}
        <div style={{ background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: "20px", padding: "28px 32px", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "var(--condensed)", fontSize: "1.4rem", letterSpacing: "0.5px", marginBottom: "20px" }}>
            Verification Status
          </h2>
          {[
            { label: "Google Login", done: true },
            { label: "KYC — Identity Verification", done: false },
            { label: "Bank Statement Review", done: false },
            { label: "AI Interview", done: false },
            { label: "Wallet Connection", done: false },
          ].map((step) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: step.done ? "#D4FF00" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700 }}>
                {step.done ? "✓" : ""}
              </div>
              <span style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: step.done ? "#000" : "#999" }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: "20px", padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--condensed)", fontSize: "1.4rem", letterSpacing: "0.5px" }}>
              Recent Activity
            </h2>
            <Link href="/marketplace" style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "#888", textDecoration: "none" }}>
              View marketplace →
            </Link>
          </div>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: "#bbb" }}>
              No trades yet. Complete verification to start trading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
