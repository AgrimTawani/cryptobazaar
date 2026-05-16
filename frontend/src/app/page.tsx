"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";

const FAQS = [
  {
    q: "What is CryptoBazaar?",
    a: "CryptoBazaar is a peer-to-peer (P2P) exchange where verified Indian traders buy and sell USDT and USDC directly with each other using INR. Unlike centralised exchanges, we never hold your crypto — it stays locked in a smart contract on the blockchain until the trade completes.",
  },
  {
    q: "Why do I need to go through verification?",
    a: "Indian P2P traders face a serious risk: if someone pays you with money linked to a crime, your bank account can be frozen by police — even if you had no idea. By verifying every member's identity, income, and intent, we keep dirty money off the platform. If everyone is clean, the risk of a wrongful freeze drops dramatically.",
  },
  {
    q: "What happens during the 3-step verification?",
    a: "Step 1 — Identity check: Aadhaar + PAN + a quick liveness selfie. Takes under 5 minutes. Step 2 — Bank statement review: Upload 6 months of statements. Our system checks for red flags. Step 3 — AI Questionnaire: 10 questions online, about 5 minutes, to understand your trading background. Once all three pass, you're a Verified Member.",
  },
  {
    q: "How does the escrow work?",
    a: "When a trade starts, the seller's crypto is locked into a smart contract on the blockchain — a self-executing program that no one, including CryptoBazaar, can override. The buyer sends INR directly to the seller's bank. Once the seller confirms receipt, the smart contract automatically releases the crypto to the buyer. Nobody at CryptoBazaar ever touches your funds.",
  },
  {
    q: "What is the Member Protection Fund?",
    a: "Our vetting is designed to keep tainted funds off the platform entirely. If our screening process fails to identify a counterparty risk and your bank account is frozen as a direct result of that failure, you may apply to the Member Protection Fund as a service remedy. The fund is built from 0.75% of every completed trade and held in a separate on-chain contract — CryptoBazaar cannot spend it without multisig approval.",
  },
  {
    q: "Is the Member Protection Fund guaranteed?",
    a: "No. Payouts are subject to fund availability, eligibility verification, and documented proof of the freeze. The fund is a voluntary member benefit, not an insurance product or financial guarantee. We are transparent about this — it is designed to help, not to promise.",
  },
  {
    q: "What if the seller doesn't confirm after I've paid?",
    a: "If the seller doesn't respond within 15 minutes of you clicking 'I have paid', the trade automatically escalates to dispute resolution. Our team reviews bank statements from both parties (not screenshots — actual bank data). If your payment is confirmed, the crypto is released to you. The seller cannot simply ignore the trade to stall.",
  },
  {
    q: "Which cryptos and chains are supported?",
    a: "USDT on Polygon, Solana, and Tron (TRC-20 — the most common for Indian traders). USDC on Polygon and Solana. More assets coming soon.",
  },
  {
    q: "Can I use the platform without a subscription?",
    a: "You can browse live listings without a subscription. To buy or sell, you need an active membership plan. Plans start at ₹200/month.",
  },
  {
    q: "How do I know CryptoBazaar won't run away with my crypto?",
    a: "We can't — it's technically impossible. Your crypto is locked in a smart contract on a public blockchain, not in our wallets or bank accounts. Every transaction is on-chain and auditable by anyone. CryptoBazaar has zero custody of your funds during a trade.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up with Google. Takes 10 seconds. No email or password to manage.",
  },
  {
    step: "02",
    title: "Verify your identity",
    desc: "Complete a quick Aadhaar + PAN + liveness check. This is mandatory — it's how we keep bad actors out.",
  },
  {
    step: "03",
    title: "Submit your bank statement",
    desc: "Upload 6 months of statements. Our ML system reviews them for red flags. Your data is discarded after review — we never store it.",
  },
  {
    step: "04",
    title: "Complete the AI Questionnaire",
    desc: "Answer 10 short questions about your trading background. Scored by AI. Takes about 5 minutes.",
  },
  {
    step: "05",
    title: "Connect your wallet & pick a plan",
    desc: "Connect your crypto wallet (MetaMask, Phantom, etc.) and choose a membership tier that fits your monthly volume.",
  },
  {
    step: "06",
    title: "Trade with full escrow protection",
    desc: "List or browse trades. Crypto is locked in a smart contract from the moment a trade starts. INR is sent bank-to-bank. Release is automatic on confirmation. Nobody holds your funds but the code.",
  },
];

const TIERS = [
  {
    name: "Starter",
    price: "₹200",
    cap: "₹5,00,000",
    capLabel: "monthly trade cap",
    highlight: false,
    features: [
      "Smart contract escrow on every trade",
      "0.75% Member Protection Fund contribution",
      "Verified Member badge",
      "Order book access",
      "Dispute resolution support",
    ],
    cta: "Get Started",
  },
  {
    name: "Trader",
    price: "₹500",
    cap: "₹20,00,000",
    capLabel: "monthly trade cap",
    highlight: true,
    features: [
      "Everything in Starter",
      "4× the monthly trade volume",
      "Priority dispute resolution",
      "Multi-chain trading (Polygon, Solana, Tron)",
      "Trade history export",
    ],
    cta: "Most Popular",
  },
  {
    name: "Pro",
    price: "₹1,000",
    cap: "Unlimited",
    capLabel: "monthly trade volume",
    highlight: false,
    features: [
      "Everything in Trader",
      "No trade volume cap",
      "Dedicated support agent",
      "Early access to new features",
      "API access (coming soon)",
    ],
    cta: "Go Pro",
  },
];

export default function Home() {
  const words = ["secure", "protected", "trusted"];
  const [currentWord, setCurrentWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [navHidden, setNavHidden] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isSignedIn, user } = useUser();

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
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
    }
    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, loopNum]);

  // Navbar: hide on scroll-down, show on scroll-up or at top
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y < 40) {
        setNavHidden(false);
      } else if (y > lastScrollY.current + 5) {
        setNavHidden(true);
      } else if (y < lastScrollY.current - 5) {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Navbar: reveal when mouse is near the top of the viewport
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const nearTop = e.clientY < 120;
      setNavHovered(nearTop);
    };
    document.addEventListener("pointermove", onPointerMove);
    return () => document.removeEventListener("pointermove", onPointerMove);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const stats = [
    { value: "3-Layer", label: "Verification" },
    { value: "0.75%", label: "Fund Contribution" },
    { value: "₹5L", label: "Max Benefit" },
    { value: "0", label: "Custody" },
  ];

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
        className="fixed top-0 left-0 right-0 z-[101] flex items-center justify-between h-[64px] px-5 md:px-10 transition-transform duration-300 ease-out"
        style={{
          transform: navHidden && !navHovered && !mobileMenuOpen ? "translateY(-100%)" : "translateY(0)",
          background: scrolled || mobileMenuOpen ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: scrolled || mobileMenuOpen ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid #f0f0f0" : "none",
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
          <button onClick={() => scrollTo("pricing")} className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors duration-200">
            Pricing
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
                <img
                  src={user.imageUrl}
                  alt={user.firstName ?? ""}
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
            <Link href="/login" className="btn-login font-condensed">Login</Link>
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
            className="fixed inset-0 top-[64px] z-[100] bg-white flex flex-col items-center pt-10 gap-6 md:hidden"
          >
            <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              Marketplace
            </Link>
            <button onClick={() => { scrollTo("how"); setMobileMenuOpen(false); }} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              How It Works
            </button>
            <button onClick={() => { scrollTo("pricing"); setMobileMenuOpen(false); }} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              Pricing
            </button>
            <button onClick={() => { scrollTo("faq"); setMobileMenuOpen(false); }} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              FAQ
            </button>
            <div className="mt-4">
              {isSignedIn ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-login font-condensed">Dashboard</Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-login font-condensed">Login</Link>
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
            India's most rigorously vetted P2P exchange for USDT and USDC against INR.
            <br className="hidden md:block" />Every member verified. Every trade held in escrow.
          </motion.p>

          <motion.div
            className="shader-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/login" className="cta-primary">Login</Link>
            <button onClick={() => scrollTo("how")} className="cta-secondary">How It Works</button>
          </motion.div>

          <motion.div
            className="shader-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {stats.map((s) => (
              <div key={s.label} className="shader-stat">
                <div className="shader-stat-value">{s.value}</div>
                <div className="shader-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-black py-16 md:py-[100px] px-5 md:px-10">
        <div className="max-w-[900px] mx-auto">
          <p className="font-sans text-[1.1rem] font-medium text-lime tracking-[4px] uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-condensed text-[clamp(2.8rem,6vw,5rem)] text-white leading-none tracking-[1px] mb-5">
            TRADE P2P.<br />
            <span className="text-lime">THE RIGHT WAY.</span>
          </h2>
          <p className="font-sans text-base text-white/50 max-w-[520px] leading-[1.7] mb-12">
            CryptoBazaar is not just another P2P app. Every member is vetted, every trade is protected by a smart contract, and there is a service remedy fund for when our vetting fails.
          </p>

          <div className="flex flex-col">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`flex gap-4 md:gap-5 py-5 items-start md:items-center ${
                  i < HOW_IT_WORKS.length - 1 ? "border-b border-white/[0.08]" : ""
                }`}
              >
                <div className="shrink-0 font-condensed text-3xl md:text-5xl text-lime leading-none w-[48px] md:w-[72px]">
                  {item.step}
                </div>
                <div>
                  <div className="font-condensed text-[1.3rem] md:text-[1.8rem] text-white tracking-[0.5px] mb-1 md:mb-2">
                    {item.title}
                  </div>
                  <div className="font-sans text-[0.9rem] md:text-[1.1rem] text-white/70 leading-[1.6] max-w-[600px]">
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Member Protection Fund callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 md:mt-16 bg-lime/[0.06] border border-lime/20 rounded-2xl py-7 px-5 md:py-9 md:px-10"
          >
            <p className="font-sans text-[0.7rem] text-lime tracking-[2px] uppercase mb-3">
              Member Protection Fund
            </p>
            <h3 className="font-condensed text-[1.8rem] text-white tracking-[0.5px] mb-3">
              What happens if our vetting fails you?
            </h3>
            <p className="font-sans text-[0.9rem] text-white/[0.55] leading-[1.7] max-w-[600px] mb-6">
              CryptoBazaar's verification process is the product. If our screening fails to catch a bad actor and your bank account is frozen as a direct result of that failure on our platform, you can apply for a service remedy disbursement from the Member Protection Fund — built from 0.75% of every completed trade and held on-chain.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {[
                { tier: "Emergency", amount: "Up to ₹10,000", time: "Within 24 hours", desc: "Bank freeze notice + complaint number" },
                { tier: "Standard", amount: "Up to ₹1,00,000", time: "Within 7 days", desc: "Above + proof of legal representation" },
                { tier: "Full", amount: "Up to ₹5,00,000", time: "Within 30 days", desc: "Above + account unfrozen / NOC issued" },
              ].map((t) => (
                <div key={t.tier} className="bg-white/[0.04] rounded-[10px] p-5">
                  <div className="font-condensed text-base text-lime tracking-[1px] mb-[6px]">{t.tier}</div>
                  <div className="font-condensed text-[1.4rem] text-white mb-1">{t.amount}</div>
                  <div className="font-sans text-[0.72rem] text-white/40 mb-2">{t.time}</div>
                  <div className="font-sans text-[0.75rem] text-white/[0.35] leading-[1.5]">{t.desc}</div>
                </div>
              ))}
            </div>
            <p className="font-sans text-[0.7rem] text-white/25 mt-5 leading-[1.6]">
              * Disbursements are a service remedy for CryptoBazaar's vetting failure — not a payment for an external risk event. Subject to eligibility verification and fund availability. Not an insurance product. Payouts are not guaranteed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white py-16 md:py-[100px] px-5 md:px-10">
        <div className="max-w-[960px] mx-auto">
          <p className="font-sans text-[0.75rem] text-[#999] tracking-[3px] uppercase mb-4">
            Membership Plans
          </p>
          <h2 className="font-condensed text-[clamp(2.8rem,6vw,5rem)] text-black leading-none tracking-[1px] mb-4">
            SIMPLE PRICING.
          </h2>
          <p className="font-sans text-base text-[#666] max-w-[480px] leading-[1.7] mb-14">
            Pick a plan based on how much you trade per month. Every plan includes full escrow protection and Member Protection Fund contribution on every trade.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5">
            {TIERS.map((tier) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="group rounded-2xl py-8 px-7 h-full relative border-[1.5px] border-solid border-[#e5e5e5] bg-white hover:bg-black hover:border-black hover:scale-[1.03] transition-all duration-300">
                  {tier.highlight && (
                    <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-lime rounded-full py-[3px] px-4 font-sans text-[0.68rem] font-bold tracking-[1px] uppercase whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  <div className="font-condensed text-[1.1rem] tracking-[2px] mb-3 text-[#999] group-hover:text-lime transition-colors duration-300">
                    {tier.name.toUpperCase()}
                  </div>
                  <div className="font-condensed text-5xl leading-none mb-1 text-black group-hover:text-white transition-colors duration-300">
                    {tier.price}
                  </div>
                  <div className="font-sans text-[0.8rem] mb-2 text-[#999] group-hover:text-white/40 transition-colors duration-300">
                    per month
                  </div>
                  <div className="rounded-lg py-[10px] px-[14px] mb-6 bg-[#f5f5f5] group-hover:bg-lime/10 transition-colors duration-300">
                    <span className="font-condensed text-[1.3rem] text-black group-hover:text-lime transition-colors duration-300">{tier.cap}</span>
                    <span className="font-sans text-[0.75rem] ml-[6px] text-[#888] group-hover:text-white/40 transition-colors duration-300">{tier.capLabel}</span>
                  </div>
                  <ul className="list-none flex flex-col gap-[10px] mb-7">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 font-sans text-[0.82rem] leading-[1.5] text-[#555] group-hover:text-white/[0.65] transition-colors duration-300">
                        <span className="text-lime shrink-0 mt-[1px]">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="block text-center py-3 rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline bg-black text-white group-hover:bg-lime group-hover:text-black transition-colors duration-300"
                  >
                    Get Started →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="font-sans text-[0.78rem] text-[#bbb] mt-8 text-center leading-[1.7]">
            Membership fees are currently collected via manual UPI transfer to our registered business account.
            You will receive payment instructions after completing verification.
            All plans are month-to-month. No automatic renewals without explicit confirmation.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#fafafa] py-16 md:py-[100px] px-5 md:px-10">
        <div className="max-w-[720px] mx-auto">
          <p className="font-sans text-[0.75rem] text-[#999] tracking-[3px] uppercase mb-4">
            Frequently Asked Questions
          </p>
          <h2 className="font-condensed text-[clamp(2.8rem,6vw,4.5rem)] text-black leading-none tracking-[1px] mb-14">
            GOT QUESTIONS?
          </h2>

          <div className="flex flex-col">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="border-b border-[#e5e5e5]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center py-[22px] bg-transparent border-0 cursor-pointer text-left gap-4"
                >
                  <span className="font-condensed text-[1.2rem] tracking-[0.5px] text-black leading-[1.2]">
                    {faq.q}
                  </span>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-sans text-base transition-all duration-200 ${
                      openFaq === i ? "bg-black text-white" : "bg-[#f0f0f0] text-black"
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
                      <p className="font-sans text-[0.9rem] text-[#555] leading-[1.75] pb-[22px] max-w-[600px]">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
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
            THE KEY POINTS.
          </h2>
          <p className="font-sans text-[0.9rem] text-[#888] mb-10 leading-[1.6]">
            Here are the things that matter most. Read the full terms before trading.
          </p>

          <div className="flex flex-col gap-4 mb-10">
            {[
              { title: "Indian residents only", body: "You must be 18+ and a resident of India. You must trade on your own behalf, not as an agent for someone else." },
              { title: "Verification is mandatory and recurring", body: "All 3 layers must be completed and renewed every 6 months. Providing false information during verification may result in a criminal complaint." },
              { title: "We never hold your crypto", body: "Your crypto is locked in a smart contract — not our wallets. CryptoBazaar cannot access it. The code controls release, not us." },
              { title: "The Member Protection Fund is NOT insurance", body: "It is a voluntary member benefit. Payouts are discretionary and subject to fund availability. No amount is guaranteed. It is not a regulated financial product." },
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

          <Link
            href="/terms"
            className="inline-flex items-center gap-2 py-[13px] px-7 bg-black text-white rounded-[10px] font-condensed text-[1.1rem] tracking-[1px] no-underline"
          >
            Read Full Terms of Use →
          </Link>
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
              ✉ support@cryptobazaar.co.in
            </a>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="pt-10 md:pt-14 px-5 md:px-10 pb-10 max-w-[960px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="font-condensed text-[1.4rem] tracking-[3px] text-white mb-3">
                CRYPTOBAZAAR
              </div>
              <p className="font-sans text-[0.78rem] text-white/30 leading-[1.7] mb-5">
                The only gated P2P stablecoin exchange for India. Every member verified. Every trade held in escrow.
              </p>
              <div className="flex flex-col gap-[6px]">
                {[
                  { label: "General", email: "support@cryptobazaar.co.in" },
                  { label: "Disputes", email: "disputes@cryptobazaar.co.in" },
                  { label: "Legal", email: "legal@cryptobazaar.co.in" },
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
                { label: "Pricing", id: "pricing" },
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
              <Link href="/terms" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px]">
                Terms of Use
              </Link>
              <button onClick={() => scrollTo("terms")} className="block font-sans text-[0.82rem] text-white/[0.45] bg-transparent border-0 cursor-pointer mb-[10px] p-0 text-left">
                Key Points
              </button>
              <p className="font-sans text-[0.82rem] text-white/25 mb-[10px]">Privacy Policy</p>
            </div>

            {/* Contact */}
            <div>
              <p className="font-sans text-[0.65rem] text-white/25 tracking-[2px] uppercase mb-4">Contact Us</p>
              <div className="flex flex-col gap-3">
                <a href="mailto:support@cryptobazaar.co.in" className="font-sans text-[0.78rem] text-white/[0.45] no-underline">
                  ✉ support@cryptobazaar.co.in
                </a>
                <p className="font-sans text-[0.75rem] text-white/25 leading-[1.5]">
                  Response time:<br />within 24 hours
                </p>
                <div className="mt-1 py-[10px] px-[14px] bg-lime/[0.07] border border-lime/[0.15] rounded-lg">
                  <p className="font-sans text-[0.7rem] text-lime/70 leading-[1.5]">
                    Udyam Registered<br />Indian Business
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-col md:flex-row justify-between gap-4">
            <p className="font-sans text-[0.7rem] text-white/[0.18]">
              © 2026 CryptoBazaar. All rights reserved.
            </p>
            <p className="font-sans text-[0.7rem] text-white/[0.18] max-w-[560px] leading-[1.6] md:text-right">
              The Member Protection Fund is a service remedy for CryptoBazaar's screening failures — not an insurance product and not regulated as such. Disbursements require documented proof that the freeze was caused by a failure in our vetting process. Subject to fund availability. No amount is guaranteed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
