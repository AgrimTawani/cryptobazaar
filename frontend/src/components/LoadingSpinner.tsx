"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  "Not your keys, not your coins. - Andreas Antonopoulos",
  "If you don't believe me or don't get it, I don't have time to try to convince you, sorry. - Satoshi Nakamoto",
  "Bitcoin is a swarm of cyber hornets serving the goddess of wisdom. - Michael Saylor",
  "Stay humble, stack sats. - Matt Odell",
  "Vires in numeris. (Strength in numbers)",
  "We have elected to put our money and faith in a mathematical framework that is free of politics and human error. - Tyler Winklevoss",
];

export function LoadingSpinner() {
  // Lazy initialiser avoids hydration mismatch without a setState-in-effect
  const [quote] = useState<string>(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );

  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      {/* Black Loading Spinner */}
      <div className="w-12 h-12 border-[4px] border-[#e5e5e5] border-t-black rounded-full animate-spin-fast mb-8" />
      
      {/* Crypto Quote */}
      <div className="h-[80px] flex items-center justify-center max-w-[600px]">
        <AnimatePresence mode="wait">
          {quote && (
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="font-condensed text-2xl md:text-3xl tracking-[1px] text-[#444] leading-[1.3]"
            >
              &ldquo;{quote}&rdquo;
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
