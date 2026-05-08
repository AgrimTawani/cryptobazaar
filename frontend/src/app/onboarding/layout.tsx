import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--condensed)",
            fontSize: "1rem",
            letterSpacing: "3px",
            color: "#000",
            textDecoration: "none",
          }}
        >
          CRYPTOBAZAAR
        </Link>
        <span
          style={{
            fontFamily: "var(--sans)",
            fontSize: "0.78rem",
            color: "#999",
            letterSpacing: "0.5px",
          }}
        >
          Secure Onboarding
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 24px 80px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
