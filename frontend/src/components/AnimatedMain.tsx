"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedMainProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedMain({ children, className }: AnimatedMainProps) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}
