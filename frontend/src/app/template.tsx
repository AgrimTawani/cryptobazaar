"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Neon Green Curtain Transition */}
      <motion.div
        initial={{ x: "-150vw", skewX: -45 }}
        animate={{ x: "200vw", skewX: -45 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-[-50vh] left-0 w-[150vw] h-[200vh] bg-lime z-[99999] pointer-events-none shadow-[0_0_50px_rgba(212,255,0,0.5)]"
      />

      {/* Page Content Fade In */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
