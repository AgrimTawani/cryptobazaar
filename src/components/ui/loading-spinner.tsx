"use client";

import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500 mx-auto"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full border-t-red-500 mx-auto"
            style={{ animationDelay: "0.5s" }}
          ></motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-gray-600 font-medium"
        >
          Loading CryptoBazar...
        </motion.p>
      </motion.div>
    </div>
  );
}
