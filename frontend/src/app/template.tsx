"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Neon Green Curtain Transition.
          Travels fully off-screen and fades at the end so the skewed trailing
          diagonal edge never lingers on tall/narrow mobile viewports. */}
      <motion.div
        initial={{ x: "-160vw", skewX: -45, opacity: 1 }}
        animate={{ x: "260vw", skewX: -45, opacity: [1, 1, 1, 0] }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-[-50vh] left-0 w-[160vw] h-[200vh] bg-lime z-[99999] pointer-events-none shadow-[0_0_50px_rgba(212,255,0,0.5)]"
      />

      {/* Page Content Fade In */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
