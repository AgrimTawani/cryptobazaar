"use client";

import { useState, useEffect, useRef } from "react";
import { MoveToTopButton } from "@/components/MoveToTopButton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";


const FAQS = [
  {
    q: "What is CryptoBazaar?",
    a: "CryptoBazaar is a peer-to-peer (P2P) exchange where verified Indian traders buy and sell USDT and USDC directly with each other using INR. Unlike centralised exchanges, we never hold your crypto - it stays locked in a smart contract on the blockchain until the trade completes.",
  },
  {
    q: "Why do I need to go through verification?",
    a: "Indian P2P traders face a serious risk: if someone pays you with money linked to a crime, your bank account can be frozen by police - even if you had no idea. By verifying every member's identity, income, and intent, we keep dirty money off the platform. If everyone is clean, the risk of a wrongful freeze drops dramatically.",
  },
  {
    q: "What happens during the 3-step verification?",
    a: "Step 1 - Identity check: Aadhaar + PAN + a quick liveness selfie. Takes under 5 minutes.\nStep 2 - Bank statement review: Upload 6 months of statements. Our system checks for red flags.\nStep 3 - AI Questionnaire: 10 questions online, about 5 minutes, to understand your trading background.\nOnce all three pass, you're a Verified Member.",
  },
  {
    q: "How does the escrow work?",
    a: "When a trade starts, the seller's crypto is locked into a smart contract on the blockchain - a self-executing program that no one, including CryptoBazaar, can override. The buyer sends INR directly to the seller's bank. Once the seller confirms receipt, the smart contract automatically releases the crypto to the buyer. Nobody at CryptoBazaar ever touches your funds.",
  },
  {
    q: "What if the seller doesn't confirm after I've paid?",
    a: "If the seller doesn't respond within 15 minutes of you clicking 'I have paid', the trade automatically escalates to dispute resolution. Our team reviews bank statements from both parties (not screenshots - actual bank data). If your payment is confirmed, the crypto is released to you. The seller cannot simply ignore the trade to stall.",
  },
  {
    q: "Which cryptos and chains are supported?",
    a: "USDT on Polygon, Solana, and Tron (TRC-20 - the most common for Indian traders). USDC on Polygon and Solana. More assets coming soon.",
  },
  {
    q: "How do I know CryptoBazaar won't run away with my crypto?",
    a: "We can't - it's technically impossible. Your crypto is locked in a smart contract on a public blockchain, not in our wallets or bank accounts. Every transaction is on-chain and auditable by anyone. CryptoBazaar has zero custody of your funds during a trade.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up with Google in ten seconds. No email or password to manage.",
    pill: "Google Sign-In",
  },
  {
    step: "02",
    title: "Verify your identity",
    desc: "Quick Aadhaar + PAN + liveness check. Mandatory — it keeps bad actors out.",
    pill: "Aadhaar + PAN",
  },
  {
    step: "03",
    title: "Submit bank statement",
    desc: "Upload 6 months of statements. ML reviews for red flags, then discards the data — never stored.",
    pill: "Discarded After Review",
  },
  {
    step: "04",
    title: "Pass the AI screen",
    desc: "Ten short questions on your trading background, scored by AI. Takes about five minutes.",
    pill: "AI-Scored",
  },
  {
    step: "05",
    title: "Connect wallet & plan",
    desc: "Link MetaMask, Phantom or any compatible wallet and pick a membership tier for your monthly volume.",
    pill: "Self-Custody",
  },
  {
    step: "06",
    title: "Trade with full escrow",
    desc: "Crypto locks in a smart contract at trade start. INR moves bank-to-bank. Release is automatic. The code holds your funds — not us.",
    pill: "Smart Contract Escrow",
  },
];



type PlatformStats = { verifiedMembers: number; totalTrades: number; totalVolumeInr: number };

function formatVolume(inr: number) {
  if (inr >= 1_00_00_000) return `₹${(inr / 1_00_00_000).toFixed(1)} Cr`;
  if (inr >= 1_00_000) return `₹${(inr / 1_00_000).toFixed(1)} L`;
  if (inr === 0) return "₹0";
  return `₹${inr.toLocaleString("en-IN")}`;
}

function LotteryCounter({
  value,
  type,
}: {
  value: string | null;
  type: "volume" | "members" | "trades";
}) {
  const [displayValue, setDisplayValue] = useState("—");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value === null) {
      intervalRef.current = setInterval(() => {
        let randStr = "";
        if (type === "volume") {
          const isCr = Math.random() > 0.4;
          if (isCr) {
            randStr = `₹${(Math.random() * 9 + 1).toFixed(1)} Cr`;
          } else {
            randStr = `₹${Math.floor(Math.random() * 90 + 10)} L`;
          }
        } else if (type === "members") {
          randStr = Math.floor(Math.random() * 900 + 100).toString();
        } else if (type === "trades") {
          randStr = Math.floor(Math.random() * 9000 + 1000).toString();
        }
        setDisplayValue(randStr);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Defer to avoid calling setState synchronously inside the effect body
      setTimeout(() => setDisplayValue(value ?? ""), 0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [value, type]);

  return (
    <motion.span
      key={displayValue === value ? "settled" : "rolling"}
      initial={displayValue === value ? { scale: 1.1, filter: "blur(3px)", opacity: 0.7 } : {}}
      animate={displayValue === value ? { scale: 1, filter: "blur(0px)", opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="inline-block tabular-nums"
    >
      {displayValue}
    </motion.span>
  );
}

export default function Home() {
  const words = ["secure", "protected", "trusted"];
  const [currentWord, setCurrentWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const startTime = Date.now();
    fetch("/api/stats")
      .then(r => r.json())
      .then(data => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 1200 - elapsed);
        setTimeout(() => setPlatformStats(data), delay);
      })
      .catch(() => {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 1200 - elapsed);
        setTimeout(() => setPlatformStats({ verifiedMembers: 0, totalTrades: 0, totalVolumeInr: 0 }), delay);
      });
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor((p) => !p), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const i = loopNum % words.length;
    const fullText = words[i];
    if (isDeleting) {
      timer = setTimeout(() => setCurrentWord(fullText.substring(0, currentWord.length - 1)), 75);
    } else {
      timer = setTimeout(() => setCurrentWord(fullText.substring(0, currentWord.length + 1)), 150);
    }
    if (!isDeleting && currentWord === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 3500);
    } else if (isDeleting && currentWord === "") {
      setTimeout(() => {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }, 0);
    }
    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, loopNum]);

  // Navbar handlers
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };


  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "CryptoBazaar",
                "url": "https://cryptobazaar.co.in",
                "logo": "https://cryptobazaar.co.in/icon.png",
                "description": "India's only gated P2P stablecoin exchange. Every member verified, every trade held in escrow."
              },
              {
                "@type": "FAQPage",
                "mainEntity": FAQS.map(faq => ({
                  "@type": "Question",
                  "name": faq.q,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.a
                  }
                }))
              }
            ]
          }),
        }}
      />
      {/* ── NAV ── */}
      <nav
        className={`fixed z-[101] inset-x-0 mx-auto flex items-center justify-between h-[64px] transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${scrolled || mobileMenuOpen
          ? "top-4 w-[calc(100%-32px)] max-w-[960px] rounded-full px-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/10"
          : "top-0 w-full max-w-[100vw] rounded-[0px] px-5 md:px-10 border-transparent shadow-none"
          }`}
        style={{
          background: scrolled || mobileMenuOpen ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0)",
          backdropFilter: scrolled || mobileMenuOpen ? "saturate(180%) blur(20px)" : "saturate(100%) blur(0px)",
          WebkitBackdropFilter: scrolled || mobileMenuOpen ? "saturate(180%) blur(20px)" : "saturate(100%) blur(0px)",
        }}
      >
        <Link href="/" className="nav-logo no-underline text-black">
          CRYPTOBAZAAR
        </Link>
        <div className="nav-links hidden md:flex">
          <Link href="/marketplace" className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors duration-200">
            Marketplace
          </Link>
          <button onClick={() => scrollTo("how")} className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors duration-200">
            How It Works
          </button>

          <button onClick={() => scrollTo("faq")} className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors duration-200">
            FAQ
          </button>
        </div>
        <div className="nav-right hidden md:flex">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-[10px] no-underline pt-[6px] pr-[18px] pb-[6px] pl-[6px] border-[1.5px] border-solid border-black rounded-full bg-black"
            >
              {user?.imageUrl && (
                <Image
                  src={user.imageUrl}
                  alt={user.firstName ? `${user.firstName}'s avatar` : "User avatar"}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              )}
              <span className="font-condensed text-base tracking-[1px] text-white">
                Dashboard
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors duration-200 no-underline">
                Log In
              </Link>
              <Link href="/login" className="btn-login font-condensed">
                Sign Up
              </Link>
            </div>
          )}
        </div>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center pt-[100px] gap-6 md:hidden"
          >
            <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              Marketplace
            </Link>
            <button onClick={() => { scrollTo("how"); setMobileMenuOpen(false); }} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              How It Works
            </button>

            <button onClick={() => { scrollTo("faq"); setMobileMenuOpen(false); }} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              FAQ
            </button>
            <div className="mt-4">
              {isSignedIn ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-login font-condensed">Dashboard</Link>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="font-condensed text-[1.6rem] tracking-[2px] text-black no-underline">
                    Log In
                  </Link>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-login font-condensed">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="shader-hero">
        <div className="hero-spotlight" />
        <div className="shader-hero-content">
          <motion.h1
            className="shader-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            THE{" "}
            <span className="shader-title-accent">{currentWord}</span>
            <span className={`font-light ${showCursor ? "opacity-100" : "opacity-0"}`}>|</span>
            <br />
            P2P BAZAAR
          </motion.h1>

          <motion.p
            className="shader-subtitle font-manrope !font-bold !text-[0.95rem] md:!text-[1.15rem] tracking-wide !max-w-none w-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            India&apos;s most rigorously vetted P2P exchange for USDT and USDC against INR.
            <br className="hidden md:block" />Every member verified. Every trade held in escrow.
          </motion.p>

          <motion.div
            className="shader-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isSignedIn ? (
              <Link href="/dashboard" className="cta-primary">Dashboard</Link>
            ) : (
              <Link href="/login" className="cta-primary">Get Started</Link>
            )}
            <button onClick={() => setShowPreview(true)} className="cta-secondary">Have a Peek</button>
          </motion.div>

          {/* ── Stats ── */}
          <motion.div
            className="flex flex-nowrap justify-center gap-10 mt-10 w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {[
              {
                value: platformStats ? formatVolume(platformStats.totalVolumeInr) : null,
                type: "volume" as const,
                label: "Total Traded",
              },
              {
                value: platformStats ? platformStats.verifiedMembers.toString() : null,
                type: "members" as const,
                label: "Verified Members",
              },
              {
                value: platformStats ? platformStats.totalTrades.toString() : null,
                type: "trades" as const,
                label: "Trades Done",
              },
              {
                value: "0",
                type: null,
                label: "Custody Risk",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.65 + i * 0.07 }}
                className="flex flex-col items-center shrink-0"
              >
                <span className="text-center font-condensed text-[4rem] text-black leading-none tracking-wide [-webkit-text-stroke:1.5px_#000] whitespace-nowrap">
                  {stat.type ? (
                    <LotteryCounter value={stat.value} type={stat.type} />
                  ) : (
                    stat.value
                  )}
                </span>
                <span className="font-sans text-[0.65rem] font-bold text-black/60 tracking-[2px] uppercase mt-2 text-center">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Marketplace preview modal ── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-[1100px] relative"
              style={{ height: "80vh" }}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0]">
                <span className="font-condensed text-lg tracking-[1px]">LIVE MARKETPLACE</span>
                <button onClick={() => setShowPreview(false)}
                  className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center font-sans text-base text-[#555] hover:bg-[#e5e5e5] transition-colors">
                  ✕
                </button>
              </div>
              <iframe
                src="/marketplace"
                className="w-full border-0"
                style={{ height: "calc(80vh - 52px)" }}
                title="Marketplace preview"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-black py-16 md:py-[100px] px-5 md:px-10">
        <div className="max-w-[1100px] mx-auto">

          {/* Section header — two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12 items-end">
            <div>
              <p className="font-sans text-[0.75rem] font-medium text-lime tracking-[4px] uppercase mb-4">
                How It Works
              </p>
              <h2 className="font-condensed text-[clamp(2.8rem,6vw,5rem)] text-white leading-none tracking-[1px]">
                TRADE P2P.<br />
                THE <em className="font-playfair italic lowercase">right</em> WAY.
              </h2>
            </div>
            <p className="font-sans text-base text-white/50 leading-[1.7] md:max-w-[380px] md:self-end">
              Not just another P2P app. Every member vetted, every trade protected by smart contract, a remedy fund backing our screening.
            </p>
          </div>

          {/* 3×2 cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="group relative overflow-hidden bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 flex flex-col gap-3 min-h-[220px] transition-all duration-200 ease-out hover:-translate-y-1.5 hover:bg-white/[0.05] hover:shadow-[0_12px_30px_-10px_rgba(212,255,0,0.25),0_0_20px_-5px_rgba(212,255,0,0.15)]">
                  {/* Watermark number */}
                  <span className="absolute bottom-1 right-3 font-condensed text-[5.5rem] leading-none text-white/[0.05] select-none pointer-events-none transition-colors duration-200 group-hover:text-lime/12">
                    {item.step}
                  </span>

                  <span className="font-sans text-xs text-lime tracking-widest uppercase font-semibold">
                    {item.step}
                  </span>
                  <h3 className="font-condensed text-[1.25rem] text-white uppercase tracking-[0.5px] leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm text-white/60 leading-[1.65] flex-1">
                    {item.desc}
                  </p>
                  <div className="mt-1">
                    <span className="font-sans text-[0.65rem] tracking-widest uppercase bg-lime/[0.08] text-lime/80 border border-lime/[0.18] px-3 py-1.5 rounded-full">
                      {item.pill}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>



      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#fafafa] py-16 md:py-[100px] px-5 md:px-10">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 md:gap-16">

            {/* Left — sticky heading */}
            <div className="md:sticky md:top-[80px] self-start">
              <p className="font-sans text-[0.75rem] text-[#999] tracking-[3px] uppercase mb-4">
                Frequently Asked
              </p>
              <h2 className="font-condensed text-[clamp(2.8rem,5vw,4rem)] text-black leading-none tracking-[1px] mb-5">
                GOT QUESTIONS?
              </h2>
              <p className="font-sans text-sm text-[#666] leading-[1.7] mb-8">
                Straight answers on verification, escrow and custody — the things that decide whether you trust a platform with your money.
              </p>
              <a
                href="mailto:support@cryptobazaar.co.in"
                className="inline-flex items-center gap-2 font-sans text-sm font-semibold bg-black text-white px-5 py-3 rounded-full no-underline"
              >
                <span className="w-2 h-2 rounded-full bg-lime shrink-0" />
                We read every message
              </a>
            </div>

            {/* Right — accordion */}
            <div className="flex flex-col">
              {FAQS.map((faq, i) => (
                <div key={i} className="border-b border-[#e5e5e5]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="faq-toggle w-full flex justify-between items-center py-[22px] bg-transparent border-0 cursor-pointer text-left gap-4"
                  >
                    <span className="font-condensed text-[1.2rem] tracking-[0.5px] text-black leading-[1.2]">
                      {faq.q}
                    </span>
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-sans text-base transition-all duration-200 ${openFaq === i ? "bg-lime text-black" : "bg-[#f0f0f0] text-black"
                        }`}
                    >
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="font-sans text-[0.9rem] text-[#555] leading-[1.75] pb-[22px] whitespace-pre-wrap">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── TERMS SUMMARY ── */}
      <section id="terms" className="bg-white py-16 md:py-20 px-5 md:px-10">
        <div className="max-w-[720px] mx-auto">
          <p className="font-sans text-[0.75rem] text-[#999] tracking-[3px] uppercase mb-4">
            Terms of Use
          </p>
          <h2 className="font-condensed text-[clamp(2.4rem,5vw,4rem)] text-black leading-none tracking-[1px] mb-4">
            THE KEY <em className="font-playfair italic lowercase">points</em>.
          </h2>
          <p className="font-sans text-[0.9rem] text-[#888] mb-10 leading-[1.6]">
            Here are the things that matter most. Read the full terms before trading.
          </p>

          <div className="flex flex-col gap-4 mb-10">
            {[
              { title: "Indian residents only", body: "You must be 18+ and a resident of India. You must trade on your own behalf, not as an agent for someone else." },
              { title: "Verification is mandatory and recurring", body: "All 3 layers must be completed and renewed every 6 months. Providing false information during verification may result in a criminal complaint." },
              { title: "We never hold your crypto", body: "Your crypto is locked in a smart contract - not our wallets. CryptoBazaar cannot access it. The code controls release, not us." },
              { title: "Fraud has serious consequences", body: "Submitting forged bank statements or fabricated freeze notices results in permanent suspension and may be reported to law enforcement. All users are Aadhaar-linked." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start py-5 px-5 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
                <div>
                  <div className="font-condensed text-[1.1rem] tracking-[0.5px] mb-1">{item.title}</div>
                  <div className="font-sans text-[0.82rem] text-[#666] leading-[1.6]">{item.body}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black">
        {/* Contact bar */}
        <div className="border-b border-white/[0.06] py-8 md:py-12 px-5 md:px-10">
          <div className="max-w-[960px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="font-condensed text-[2rem] text-white tracking-[1px] mb-[6px]">
                HAVE A QUESTION?
              </p>
              <p className="font-sans text-sm text-white/40 leading-[1.5]">
                We&apos;re a small team. We read every message.
              </p>
            </div>
            <a
              href="mailto:support@cryptobazaar.co.in"
              className="inline-flex items-center gap-[10px] py-[14px] px-7 bg-lime text-black rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline"
            >
              support@cryptobazaar.co.in
            </a>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="pt-10 md:pt-14 px-5 md:px-10 pb-10 max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between gap-10 mb-12">
            {/* Brand */}
            <div className="md:max-w-[360px]">
              <div className="nav-logo text-white mb-3">
                CRYPTOBAZAAR
              </div>
              <p className="font-sans text-[0.78rem] text-white/30 leading-[1.7] mb-5">
                The only gated P2P stablecoin exchange for India. Every member verified. Every trade held in escrow.
              </p>
              <div className="flex flex-col gap-[6px]">
                {[
                  { label: "General", email: "support@cryptobazaar.co.in" },
                ].map((c) => (
                  <div key={c.label} className="flex gap-2 items-center">
                    <span className="font-sans text-[0.68rem] text-white/25 tracking-[1px] uppercase w-[50px]">{c.label}</span>
                    <a href={`mailto:${c.email}`} className="font-sans text-[0.75rem] text-white/[0.45] no-underline">{c.email}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <p className="font-sans text-[0.65rem] text-white/25 tracking-[2px] uppercase mb-4">Platform</p>
              {[
                { label: "How It Works", id: "how" },
                { label: "FAQ", id: "faq" },
              ].map((l) => (
                <button key={l.label} onClick={() => scrollTo(l.id)} className="block font-sans text-[0.82rem] text-white/[0.45] bg-transparent border-0 cursor-pointer mb-[10px] p-0 text-left">
                  {l.label}
                </button>
              ))}
              <Link href="/login" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px]">
                Sign Up
              </Link>
            </div>

            {/* Legal links */}
            <div>
              <p className="font-sans text-[0.65rem] text-white/25 tracking-[2px] uppercase mb-4">Legal</p>
              <Link href="/articles?topic=terms" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px]">
                Terms of Use
              </Link>
              <Link href="/articles?topic=privacy" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px]">
                Privacy Policy
              </Link>
              <Link href="/articles?topic=mpf-guide" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px]">
                Member Protection Fund
              </Link>
            </div>

            {/* Contact */}
            <div>
              <p className="font-sans text-[0.65rem] text-white/25 tracking-[2px] uppercase mb-4">Contact Us</p>
              <div className="flex flex-col gap-3">
                <a href="mailto:support@cryptobazaar.co.in" className="font-sans text-[0.78rem] text-white/[0.45] no-underline">
                  support@cryptobazaar.co.in
                </a>
                <p className="font-sans text-[0.75rem] text-white/25 leading-[1.5]">
                  Response time:<br />within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row justify-between gap-4">
            <p className="font-sans text-[0.7rem] text-white/[0.18]">
              © 2026 CryptoBazaar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <MoveToTopButton />
    </div>
  );
}
