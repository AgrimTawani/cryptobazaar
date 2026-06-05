"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MoveToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-[99] flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-black border border-lime text-lime font-condensed text-[1.15rem] tracking-wider uppercase transition-all duration-300 hover:bg-lime hover:text-black hover:shadow-[0_8px_24px_rgba(212,255,0,0.35)] active:scale-95"
          aria-label="Scroll to top"
        >
          <span className="font-sans font-black text-[1.15rem]">⬆</span>
          <span>MOVE TO TOP</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
