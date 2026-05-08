import Link from "next/link";
import "../globals.css";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="nav" style={{ position: 'absolute', background: 'transparent' }}>
        <Link href="/" className="nav-logo">CRYPTOBAZAAR</Link>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Secure Onboarding
        </div>
      </nav>
      <div className="signup-bg">
        {children}
      </div>
    </>
  );
}
