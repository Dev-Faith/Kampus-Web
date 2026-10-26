"use client";

import React from "react";
import { motion } from "motion/react";

interface ScrollDividerProps {
  label?: string;
  coordinates?: string;
  className?: string;
}

export function ScrollDivider({
  label = "KAMPUS ARCHITECTURAL PROTOCOL",
  coordinates = "9°35'12\"N 6°32'48\"E",
  className = "",
}: ScrollDividerProps) {
  return (
    <div className={`relative w-full py-8 sm:py-12 flex items-center justify-between text-[10px] tracking-[0.2em] font-mono uppercase text-slate-400 dark:text-[#586B61] select-none ${className}`}>
      {/* Left Hairline with animated expansion */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 h-px bg-slate-200 dark:bg-[#22352B]"
      />

      {/* Center Metadata Indicator */}
      <div className="px-4 sm:px-6 flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        <span className="font-semibold text-slate-700 dark:text-[#93A89D]">{label}</span>
        <span className="hidden sm:inline text-slate-300 dark:text-[#22352B]">/</span>
        <span className="hidden sm:inline text-slate-500 dark:text-[#586B61]">{coordinates}</span>
      </div>

      {/* Right Hairline with animated expansion */}
      <motion.div
        initial={{ scaleX: 0, originX: 1 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 h-px bg-slate-200 dark:bg-[#22352B]"
      />
    </div>
  );
}
