"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const words = ["secure", "insured", "trusted"];
  const [currentWord, setCurrentWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const i = loopNum % words.length;
    const fullText = words[i];

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentWord(fullText.substring(0, currentWord.length - 1));
      }, 75); // Deleting speed
    } else {
      timer = setTimeout(() => {
        setCurrentWord(fullText.substring(0, currentWord.length + 1));
      }, 150); // Typing speed
    }

    if (!isDeleting && currentWord === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 3500); // Pause at end of word
    } else if (isDeleting && currentWord === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
    }

    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, loopNum]); // Removed words from dependency array to prevent unnecessary re-runs

  const stats = [
    { value: "3-Layer", label: "Verification" },
    { value: "0.75%", label: "Insurance Levy" },
    { value: "₹5L", label: "Max Payout" },
    { value: "0", label: "Custody" },
  ];

  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">CRYPTOBAZAAR</div>
        <div className="nav-links">
          <a href="#pricing">Pricing</a>
          <a href="#how">How It Works</a>
        </div>
        <div className="nav-right">
          <button className="btn-login">Login</button>
          <Link href="/signup/profile" className="btn-signup-nav">Create free account</Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="shader-hero">
        <div className="hero-spotlight"></div>
        <div className="shader-hero-content">
          <motion.h1
            className="shader-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            THE <span className="shader-title-accent">{currentWord}</span><span style={{ opacity: showCursor ? 1 : 0, fontWeight: 300 }}>|</span><br />
            P2P BAZAAR
          </motion.h1>

          <motion.p
            className="shader-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            Trade USDT and USDC against INR without the risk of bank account freezes.
            <br />Every user verified. Every member insured.
          </motion.p>

          <motion.div
            className="shader-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/signup/profile" className="cta-primary">Start for Free</Link>
            <a href="#how" className="cta-secondary">How It Works</a>
          </motion.div>

          <motion.div
            className="shader-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {stats.map((s, i) => (
              <div key={i} className="shader-stat">
                <div className="shader-stat-value">{s.value}</div>
                <div className="shader-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
