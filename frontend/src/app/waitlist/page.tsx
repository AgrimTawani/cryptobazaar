"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Check, ShieldCheck, Zap } from "lucide-react";
import { MoveToTopButton } from "@/components/MoveToTopButton";

const BENEFITS = [
  {
    no: "No. 1",
    icon: Zap,
    title: (
      <>
        ZERO TRANSACTION <em className="font-playfair italic lowercase font-normal">fee</em>
      </>
    ),
    body: "Members pay no transaction fee on any trade. Buy or sell USDT and USDC against INR — the price you see is the price you settle.",
  },
  {
    no: "No. 2",
    icon: ShieldCheck,
    title: (
      <>
        MEMBERSHIP BENEFIT <em className="font-playfair italic lowercase font-normal">fund</em>
      </>
    ),
    body: "Members get access to the Membership Benefit Fund — a pooled remedy fund that backs our screening and stands behind verified trades.",
  },
];

type Status = "idle" | "loading" | "success" | "error";

export default function Waitlist() {
  const { isSignedIn, user } = useUser();
  const prefersReduced = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  // Sticky-nav shrink-to-pill, mirroring the landing page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Social proof — current number of people in line.
  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setCount(typeof d.count === "number" ? d.count : 0))
      .catch(() => setCount(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "waitlist-page" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setAlreadyJoined(Boolean(data.alreadyJoined));
      if (typeof data.count === "number") setCount(data.count);
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  const fade = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  return (
    <div suppressHydrationWarning>
      {/* ── NAV ── */}
      <nav
        className={`fixed z-[101] inset-x-0 mx-auto flex items-center justify-between h-[64px] transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          scrolled || mobileMenuOpen
            ? "top-4 w-[calc(100%-32px)] max-w-[960px] rounded-full px-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-black/5"
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
          <Link href="/#how" className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors duration-200">
            How It Works
          </Link>
          <Link href="/#faq" className="font-condensed text-[1.1rem] tracking-[0.05em] text-[#555] hover:text-black transition-colors duration-200">
            FAQ
          </Link>
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
              <span className="font-condensed text-base tracking-[1px] text-white">Dashboard</span>
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
          aria-expanded={mobileMenuOpen}
        >
          <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-[2px] bg-black transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
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
            <Link href="/#how" onClick={() => setMobileMenuOpen(false)} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              How It Works
            </Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="font-condensed text-[1.6rem] tracking-[2px] text-black">
              FAQ
            </Link>
            <div className="mt-4">
              {isSignedIn ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn-login font-condensed">
                  Dashboard
                </Link>
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

      {/* ── HERO / EMAIL CAPTURE ── */}
      <section className="shader-hero">
        <div className="hero-spotlight" />
        <div className="shader-hero-content">
          <motion.p
            {...fade}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-sans text-[0.72rem] md:text-[0.75rem] font-bold text-black/60 tracking-[4px] uppercase mb-5"
          >
            Membership — Launching Soon
          </motion.p>

          <motion.h1
            {...fade}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="shader-title !whitespace-normal"
          >
            JOIN THE{" "}
            <span className="shader-title-accent">waitlist</span>
          </motion.h1>

          <motion.p
            {...fade}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="shader-subtitle font-manrope !font-medium !text-[0.95rem] md:!text-[1.15rem] tracking-wide"
          >
            Be first in line when membership opens — zero-fee trading and the Membership
            Benefit Fund. Drop your email and we&apos;ll reach out the moment it goes live.
          </motion.p>

          {/* Form / success */}
          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="w-full max-w-[520px] mx-auto"
          >
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={prefersReduced ? undefined : { opacity: 0, scale: 0.96 }}
                  animate={prefersReduced ? undefined : { opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-6 py-8"
                  role="status"
                  aria-live="polite"
                >
                  <span className="flex items-center justify-center w-14 h-14 rounded-full bg-lime">
                    <Check className="w-7 h-7 text-black" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <h2 className="font-condensed text-[1.8rem] tracking-[0.02em] text-black uppercase leading-none">
                    {alreadyJoined ? "You're already in" : "You're on the list"}
                  </h2>
                  <p className="font-sans text-[0.9rem] text-[#555] leading-[1.6] text-center max-w-[380px]">
                    {alreadyJoined
                      ? "This email was already on the waitlist — no need to sign up twice. We'll be in touch."
                      : "Thanks for joining. We'll email you the moment membership opens — keep an eye on your inbox."}
                  </p>
                  <Link href="/marketplace" className="cta-secondary mt-1">
                    Explore the Marketplace
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={prefersReduced ? undefined : { opacity: 0 }}
                  animate={prefersReduced ? undefined : { opacity: 1 }}
                  exit={prefersReduced ? undefined : { opacity: 0 }}
                  noValidate
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label htmlFor="waitlist-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="you@email.com"
                      aria-invalid={status === "error"}
                      aria-describedby={status === "error" ? "waitlist-error" : undefined}
                      disabled={status === "loading"}
                      className="flex-1 min-h-[52px] px-6 rounded-full bg-white border border-black/15 font-sans text-[1rem] text-black placeholder:text-black/35 outline-none transition-colors focus-visible:border-black focus-visible:ring-2 focus-visible:ring-black/70 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="shrink-0 inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded-full border border-black bg-black text-white font-condensed text-[1.2rem] tracking-[0.05em] whitespace-nowrap transition-all duration-300 hover:bg-lime hover:text-black hover:border-lime hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-black disabled:hover:text-white disabled:hover:border-black"
                    >
                      {status === "loading" ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin-fast" aria-hidden="true" />
                          Joining
                        </>
                      ) : (
                        <>
                          Join
                          <ArrowRight className="w-[18px] h-[18px]" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>

                  <div id="waitlist-error" aria-live="polite" className="min-h-[20px] mt-3">
                    {status === "error" && (
                      <p className="font-sans text-[0.82rem] text-[#e53e3e] text-center sm:text-left">
                        {message}
                      </p>
                    )}
                  </div>

                  <p className="font-sans text-[0.75rem] text-black/40 mt-1 text-center sm:text-left">
                    No spam. One email when membership opens — that&apos;s it.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Social proof */}
            <AnimatePresence>
              {count !== null && count > 0 && (
                <motion.p
                  initial={prefersReduced ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-sans text-[0.8rem] text-black/55 mt-6 tracking-wide"
                >
                  <span className="font-condensed text-black text-[1.05rem] tabular-nums align-[-1px]">
                    {count.toLocaleString("en-IN")}
                  </span>{" "}
                  {count === 1 ? "trader is" : "traders are"} already in line
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT MEMBERS GET ── */}
      <section className="bg-black py-16 md:py-[100px] px-5 md:px-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-12">
            <p className="font-sans text-[0.75rem] font-medium text-lime tracking-[4px] uppercase mb-4">
              Why Join
            </p>
            <h2 className="font-condensed text-[clamp(2.8rem,6vw,5rem)] text-white leading-none tracking-[1px]">
              WHAT MEMBERS <em className="font-playfair italic lowercase">get</em>.
            </h2>
            <p className="font-sans text-[0.9rem] text-white/40 mt-4 leading-[1.7] max-w-[460px]">
              Two things we&apos;re building toward. Membership changes what trading here costs
              you — and what stands behind every trade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {BENEFITS.map((card) => (
              <motion.div
                key={card.no}
                initial={prefersReduced ? undefined : { opacity: 0, y: 16 }}
                whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="group relative overflow-hidden bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 flex flex-col gap-4 transition-all duration-200 ease-out hover:-translate-y-1.5 hover:bg-white/[0.05] hover:shadow-[0_12px_30px_-10px_rgba(212,255,0,0.25),0_0_20px_-5px_rgba(212,255,0,0.15)]"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-lime/[0.1] border border-lime/[0.2]">
                  <card.icon className="w-5 h-5 text-lime" aria-hidden="true" />
                </span>
                <span className="font-playfair italic text-[0.85rem] text-white/40">{card.no}</span>
                <h3 className="font-condensed text-[1.55rem] tracking-[0.5px] text-white leading-tight">
                  {card.title}
                </h3>
                <p className="font-sans text-[0.84rem] text-white/55 leading-[1.75]">{card.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer — matches landing copy */}
          <div className="border border-dashed border-white/15 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full border border-white/25 flex items-center justify-center font-sans text-[0.65rem] font-bold text-white/50 mt-0.5">
              !
            </span>
            <p className="font-sans text-[0.8rem] text-white/45 leading-[1.65]">
              <strong className="text-white">The Membership Benefit Fund is not an insurance policy.</strong>{" "}
              It is not issued or backed by an insurer, and it does not guarantee compensation.
              Payouts are discretionary and subject to the fund&apos;s terms.
            </p>
          </div>

          <p className="font-sans text-[0.82rem] text-white/40 mt-8">
            Already trading?{" "}
            <Link href="/marketplace" className="text-lime underline underline-offset-2 hover:text-white transition-colors">
              Head to the marketplace <ArrowRight className="inline-block w-4 h-4 ml-0.5 align-[-2px]" />
            </Link>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-white/[0.06]">
        <div className="pt-10 md:pt-14 px-5 md:px-10 pb-10 max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between gap-10 mb-12">
            <div className="md:max-w-[360px]">
              <div className="nav-logo text-white mb-3">CRYPTOBAZAAR</div>
              <p className="font-sans text-[0.78rem] text-white/30 leading-[1.7] mb-5">
                The only gated P2P stablecoin exchange for India. Every member verified. Every
                trade held in escrow.
              </p>
              <a
                href="mailto:support@cryptobazaar.co.in"
                className="inline-flex items-center gap-[10px] py-[12px] px-6 bg-lime text-black rounded-[10px] font-condensed text-[1rem] tracking-[1px] no-underline"
              >
                support@cryptobazaar.co.in
              </a>
            </div>

            <div>
              <p className="font-sans text-[0.65rem] text-white/25 tracking-[2px] uppercase mb-4">Platform</p>
              <Link href="/marketplace" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px] hover:text-white/70 transition-colors">
                Marketplace
              </Link>
              <Link href="/#how" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px] hover:text-white/70 transition-colors">
                How It Works
              </Link>
              <Link href="/#faq" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px] hover:text-white/70 transition-colors">
                FAQ
              </Link>
            </div>

            <div>
              <p className="font-sans text-[0.65rem] text-white/25 tracking-[2px] uppercase mb-4">Legal</p>
              <Link href="/articles?topic=terms" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px] hover:text-white/70 transition-colors">
                Terms of Use
              </Link>
              <Link href="/articles?topic=privacy" className="block font-sans text-[0.82rem] text-white/[0.45] mb-[10px] hover:text-white/70 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

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
