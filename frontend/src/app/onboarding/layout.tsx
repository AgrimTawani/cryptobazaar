import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between py-4 px-5 md:py-5 md:px-10 bg-white border-b border-[#f0f0f0]">
        <Link href="/" className="font-condensed text-base tracking-[3px] text-black no-underline">
          CRYPTOBAZAAR
        </Link>
        <span className="font-sans text-[0.78rem] text-[#999] tracking-[0.5px]">
          Secure Onboarding
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center pt-12 px-6 pb-20">
        {children}
      </main>
    </div>
  );
}
