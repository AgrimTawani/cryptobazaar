"use client";

import { useState, useEffect } from "react";
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
    a: "Step 1 — Identity check: Aadhaar + PAN + a quick liveness selfie via Didit. Takes under 5 minutes. Step 2 — Bank statement review: Upload 6 months of statements. Our system checks for red flags. Step 3 — Short interview: 10 questions online, about 5 minutes, to understand your trading background. Once all three pass, you're a Verified Member.",
  },
  {
    q: "How does the escrow work?",
    a: "When a trade starts, the seller's crypto is locked into a smart contract on the blockchain — a self-executing program that no one, including CryptoBazaar, can override. The buyer sends INR directly to the seller's bank. Once the seller confirms receipt, the smart contract automatically releases the crypto to the buyer. Nobody at CryptoBazaar ever touches your funds.",
  },
  {
    q: "What is the Member Protection Fund?",
    a: "Even with all verifications, there is a small chance that money entering your bank account was linked to a crime after it left our platform. If your bank account gets frozen because of a CryptoBazaar trade, the Member Protection Fund may reimburse you for the disruption. The fund is built from 0.75% of every completed trade and held in a separate on-chain contract — CryptoBazaar cannot spend it without multisig approval.",
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
    desc: "Complete a quick Aadhaar + PAN + liveness check via Didit. This is mandatory — it's how we keep bad actors out.",
  },
  {
    step: "03",
    title: "Submit your bank statement",
    desc: "Upload 6 months of statements. Our ML system reviews them for red flags. Your data is discarded after review — we never store it.",
  },
  {
    step: "04",
    title: "Complete the interview",
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
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
      {/* ── NAV ── */}
      <nav
        className="nav"
        style={{
          background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid #f0f0f0" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Link href="/" className="nav-logo" style={{ textDecoration: "none", color: "#000" }}>
          CRYPTOBAZAAR
        </Link>
        <div className="nav-links">
          <Link href="/marketplace" style={{ fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "0.05em", color: "var(--text-sub)" }}>
            Marketplace
          </Link>
          <button onClick={() => scrollTo("how")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "0.05em", color: "var(--text-sub)" }}>
            How It Works
          </button>
          <button onClick={() => scrollTo("pricing")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "0.05em", color: "var(--text-sub)" }}>
            Pricing
          </button>
          <button onClick={() => scrollTo("faq")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "0.05em", color: "var(--text-sub)" }}>
            FAQ
          </button>
        </div>
        <div className="nav-right">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", padding: "6px 18px 6px 6px", border: "1.5px solid #000", borderRadius: "999px", background: "#000" }}
            >
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={user.firstName ?? ""}
                  width={28}
                  height={28}
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              )}
              <span style={{ fontFamily: "var(--condensed)", fontSize: "1rem", letterSpacing: "1px", color: "#fff" }}>
                Dashboard
              </span>
            </Link>
          ) : (
            <Link href="/login" className="btn-login">Login</Link>
          )}
        </div>
      </nav>

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
            <span style={{ opacity: showCursor ? 1 : 0, fontWeight: 300 }}>|</span>
            <br />
            P2P BAZAAR
          </motion.h1>

          <motion.p
            className="shader-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            Trade USDT and USDC against INR without the risk of bank account freezes.
            <br />Every user verified. Every member protected.
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
      <section id="how" style={{ background: "#000", padding: "100px 40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "#D4FF00", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
            How It Works
          </p>
          <h2 style={{ fontFamily: "var(--condensed)", fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "#fff", lineHeight: 1, letterSpacing: "1px", marginBottom: "20px" }}>
            TRADE P2P.<br />
            <span style={{ color: "#D4FF00" }}>THE RIGHT WAY.</span>
          </h2>
          <p style={{ fontFamily: "var(--sans)", fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "520px", lineHeight: 1.7, marginBottom: "64px" }}>
            CryptoBazaar is not just another P2P app. Every member is vetted, every trade is protected by a smart contract, and there is a Member Protection Fund for when things go wrong.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{
                  display: "flex",
                  gap: "32px",
                  padding: "32px 0",
                  borderBottom: i < HOW_IT_WORKS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flexShrink: 0, fontFamily: "var(--condensed)", fontSize: "3rem", color: "#D4FF00", lineHeight: 1, width: "72px" }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--condensed)", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: "0.925rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "560px" }}>
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
            style={{
              marginTop: "64px",
              background: "rgba(212,255,0,0.06)",
              border: "1px solid rgba(212,255,0,0.2)",
              borderRadius: "16px",
              padding: "36px 40px",
            }}
          >
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.7rem", color: "#D4FF00", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
              Member Protection Fund
            </p>
            <h3 style={{ fontFamily: "var(--condensed)", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.5px", marginBottom: "12px" }}>
              What happens if your bank account gets frozen?
            </h3>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: "600px", marginBottom: "24px" }}>
              Sometimes, even after every precaution, a bank will freeze an account linked to a transaction it deems suspicious. If that happens because of a CryptoBazaar trade, you can apply for a disbursement from our Member Protection Fund — built from 0.75% of every completed trade on the platform.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {[
                { tier: "Emergency", amount: "Up to ₹10,000", time: "Within 24 hours", desc: "Bank freeze notice + complaint number" },
                { tier: "Standard", amount: "Up to ₹1,00,000", time: "Within 7 days", desc: "Above + proof of legal representation" },
                { tier: "Full", amount: "Up to ₹5,00,000", time: "Within 30 days", desc: "Above + account unfrozen / NOC issued" },
              ].map((t) => (
                <div key={t.tier} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "20px" }}>
                  <div style={{ fontFamily: "var(--condensed)", fontSize: "1rem", color: "#D4FF00", letterSpacing: "1px", marginBottom: "6px" }}>{t.tier}</div>
                  <div style={{ fontFamily: "var(--condensed)", fontSize: "1.4rem", color: "#fff", marginBottom: "4px" }}>{t.amount}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>{t.time}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginTop: "20px", lineHeight: 1.6 }}>
              * Disbursements are subject to fund availability and eligibility verification. The Member Protection Fund is a voluntary member benefit, not an insurance product. Payouts are not guaranteed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: "#fff", padding: "100px 40px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "#999", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
            Membership Plans
          </p>
          <h2 style={{ fontFamily: "var(--condensed)", fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "#000", lineHeight: 1, letterSpacing: "1px", marginBottom: "16px" }}>
            SIMPLE PRICING.
          </h2>
          <p style={{ fontFamily: "var(--sans)", fontSize: "1rem", color: "#666", maxWidth: "480px", lineHeight: 1.7, marginBottom: "56px" }}>
            Pick a plan based on how much you trade per month. Every plan includes full escrow protection and Member Protection Fund contribution on every trade.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {TIERS.map((tier) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                style={{
                  border: tier.highlight ? "2px solid #000" : "1.5px solid #e5e5e5",
                  borderRadius: "16px",
                  padding: "32px 28px",
                  background: tier.highlight ? "#000" : "#fff",
                  position: "relative",
                }}
              >
                {tier.highlight && (
                  <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#D4FF00", borderRadius: "999px", padding: "3px 16px", fontFamily: "var(--sans)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "2px", color: tier.highlight ? "#D4FF00" : "#999", marginBottom: "12px" }}>
                  {tier.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: "var(--condensed)", fontSize: "3rem", color: tier.highlight ? "#fff" : "#000", lineHeight: 1, marginBottom: "4px" }}>
                  {tier.price}
                </div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "0.8rem", color: tier.highlight ? "rgba(255,255,255,0.4)" : "#999", marginBottom: "8px" }}>
                  per month
                </div>
                <div style={{ background: tier.highlight ? "rgba(212,255,0,0.1)" : "#f5f5f5", borderRadius: "8px", padding: "10px 14px", marginBottom: "24px" }}>
                  <span style={{ fontFamily: "var(--condensed)", fontSize: "1.3rem", color: tier.highlight ? "#D4FF00" : "#000" }}>{tier.cap}</span>
                  <span style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: tier.highlight ? "rgba(255,255,255,0.4)" : "#888", marginLeft: "6px" }}>{tier.capLabel}</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontFamily: "var(--sans)", fontSize: "0.82rem", color: tier.highlight ? "rgba(255,255,255,0.65)" : "#555", lineHeight: 1.5 }}>
                      <span style={{ color: "#D4FF00", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    background: tier.highlight ? "#D4FF00" : "#000",
                    color: tier.highlight ? "#000" : "#fff",
                    fontFamily: "var(--condensed)",
                    fontSize: "1.1rem",
                    letterSpacing: "1px",
                    textDecoration: "none",
                  }}
                >
                  Get Started →
                </Link>
              </motion.div>
            ))}
          </div>

          <p style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "#bbb", marginTop: "32px", textAlign: "center", lineHeight: 1.7 }}>
            Membership fees are currently collected via manual UPI transfer to our registered business account.
            You will receive payment instructions after completing verification.
            All plans are month-to-month. No automatic renewals without explicit confirmation.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: "#fafafa", padding: "100px 40px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "#999", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
            Frequently Asked Questions
          </p>
          <h2 style={{ fontFamily: "var(--condensed)", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", color: "#000", lineHeight: 1, letterSpacing: "1px", marginBottom: "56px" }}>
            GOT QUESTIONS?
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{ borderBottom: "1px solid #e5e5e5" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "22px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "16px",
                  }}
                >
                  <span style={{ fontFamily: "var(--condensed)", fontSize: "1.2rem", letterSpacing: "0.5px", color: "#000", lineHeight: 1.2 }}>
                    {faq.q}
                  </span>
                  <span style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: openFaq === i ? "#000" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--sans)", fontSize: "1rem", color: openFaq === i ? "#fff" : "#000", transition: "all 0.2s" }}>
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
                      <p style={{ fontFamily: "var(--sans)", fontSize: "0.9rem", color: "#555", lineHeight: 1.75, paddingBottom: "22px", maxWidth: "600px" }}>
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
      <section id="terms" style={{ background: "#fff", padding: "80px 40px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "#999", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px" }}>
            Terms of Use
          </p>
          <h2 style={{ fontFamily: "var(--condensed)", fontSize: "clamp(2.4rem, 5vw, 4rem)", color: "#000", lineHeight: 1, letterSpacing: "1px", marginBottom: "16px" }}>
            THE KEY POINTS.
          </h2>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.9rem", color: "#888", marginBottom: "40px", lineHeight: 1.6 }}>
            Here are the things that matter most. Read the full terms before trading.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
            {[
              { icon: "🇮🇳", title: "Indian residents only", body: "You must be 18+ and a resident of India. You must trade on your own behalf, not as an agent for someone else." },
              { icon: "🔒", title: "Verification is mandatory and recurring", body: "All 3 layers must be completed and renewed every 6 months. Providing false information during verification may result in a criminal complaint." },
              { icon: "⛓️", title: "We never hold your crypto", body: "Your crypto is locked in a smart contract — not our wallets. CryptoBazaar cannot access it. The code controls release, not us." },
              { icon: "🛡️", title: "The Member Protection Fund is NOT insurance", body: "It is a voluntary member benefit. Payouts are discretionary and subject to fund availability. No amount is guaranteed. It is not a regulated financial product." },
              { icon: "⚖️", title: "Fraud has serious consequences", body: "Submitting forged bank statements or fabricated freeze notices results in permanent suspension and may be reported to law enforcement. All users are Aadhaar-linked." },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px", background: "#fafafa", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "0.5px", marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "#666", lineHeight: 1.6 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/terms"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 28px", background: "#000", color: "#fff", borderRadius: "10px", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "1px", textDecoration: "none" }}
          >
            Read Full Terms of Use →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#000" }}>
        {/* Contact bar */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "48px 40px" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <p style={{ fontFamily: "var(--condensed)", fontSize: "2rem", color: "#fff", letterSpacing: "1px", marginBottom: "6px" }}>
                HAVE A QUESTION?
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                We&apos;re a small team. We read every message.
              </p>
            </div>
            <a
              href="mailto:support@cryptobazaar.in"
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 28px", background: "#D4FF00", color: "#000", borderRadius: "10px", fontFamily: "var(--condensed)", fontSize: "1.1rem", letterSpacing: "1px", textDecoration: "none" }}
            >
              ✉ support@cryptobazaar.in
            </a>
          </div>
        </div>

        {/* Main footer grid */}
        <div style={{ padding: "56px 40px 40px", maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "48px" }}>
            {/* Brand */}
            <div>
              <div style={{ fontFamily: "var(--condensed)", fontSize: "1.4rem", letterSpacing: "3px", color: "#fff", marginBottom: "12px" }}>
                CRYPTOBAZAAR
              </div>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.7, marginBottom: "20px" }}>
                The only gated P2P stablecoin exchange for India. Every member verified. Every trade protected.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { label: "General", email: "support@cryptobazaar.in" },
                  { label: "Disputes", email: "disputes@cryptobazaar.in" },
                  { label: "Legal", email: "legal@cryptobazaar.in" },
                ].map((c) => (
                  <div key={c.label} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--sans)", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", letterSpacing: "1px", textTransform: "uppercase", width: "50px" }}>{c.label}</span>
                    <a href={`mailto:${c.email}`} style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{c.email}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Platform</p>
              {[
                { label: "How It Works", id: "how" },
                { label: "Pricing", id: "pricing" },
                { label: "FAQ", id: "faq" },
              ].map((l) => (
                <button key={l.label} onClick={() => scrollTo(l.id)} style={{ display: "block", fontFamily: "var(--sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", marginBottom: "10px", padding: 0, textAlign: "left" }}>
                  {l.label}
                </button>
              ))}
              <Link href="/login" style={{ display: "block", fontFamily: "var(--sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>
                Sign Up
              </Link>
            </div>

            {/* Legal links */}
            <div>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Legal</p>
              <Link href="/terms" style={{ display: "block", fontFamily: "var(--sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", marginBottom: "10px" }}>
                Terms of Use
              </Link>
              <button onClick={() => scrollTo("terms")} style={{ display: "block", fontFamily: "var(--sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", marginBottom: "10px", padding: 0, textAlign: "left" }}>
                Key Points
              </button>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.25)", marginBottom: "10px" }}>Privacy Policy</p>
            </div>

            {/* Contact */}
            <div>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>Contact Us</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href="mailto:support@cryptobazaar.in" style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                  ✉ support@cryptobazaar.in
                </a>
                <p style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
                  Response time:<br />within 24 hours
                </p>
                <div style={{ marginTop: "4px", padding: "10px 14px", background: "rgba(212,255,0,0.07)", border: "1px solid rgba(212,255,0,0.15)", borderRadius: "8px" }}>
                  <p style={{ fontFamily: "var(--sans)", fontSize: "0.7rem", color: "rgba(212,255,0,0.7)", lineHeight: 1.5 }}>
                    Udyam Registered<br />Indian Business
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)" }}>
              © 2026 CryptoBazaar. All rights reserved.
            </p>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", maxWidth: "560px", lineHeight: 1.6, textAlign: "right" }}>
              The Member Protection Fund is a voluntary member benefit — not an insurance product and not regulated as such. Payouts are subject to fund availability and eligibility verification. No guarantee of any amount is made or implied.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
