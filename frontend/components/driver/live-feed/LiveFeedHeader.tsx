"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { PulsingDot } from "../ui/PulsingDot";

interface LiveFeedHeaderProps {
  title?: string;
  count?: number;
}

export function LiveFeedHeader({ title = "Canlı Rezervasyon Akışı", count }: LiveFeedHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex items-center justify-center gap-4 py-6"
    >
      {/* Left decorative line */}
      <div className="hidden sm:block h-px flex-1 max-w-32 bg-gradient-to-r from-transparent via-[#ffb400]/30 to-[#ffb400]/50" />

      {/* Center content */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffb400]/10 border border-[#ffb400]/20"
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(255,180,0,0)",
              "0 0 0 8px rgba(255,180,0,0.1)",
              "0 0 0 0 rgba(255,180,0,0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <PulsingDot color="green" size="sm" />
          <span className="text-xs font-medium text-[#ffb400] uppercase tracking-wider">Canlı</span>
        </motion.div>

        {/* Title */}
        <h2 className="font-cinzel text-xl md:text-2xl text-[#f5f5f5] flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#ffb400]/70" />
          {title}
        </h2>

        {/* Count badge */}
        {count !== undefined && count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="
              px-2.5 py-1 rounded-full text-xs font-bold
              bg-[#ffb400]/20 text-[#ffcc33] border border-[#ffb400]/30
            "
          >
            {count}
          </motion.span>
        )}
      </div>

      {/* Right decorative line */}
      <div className="hidden sm:block h-px flex-1 max-w-32 bg-gradient-to-l from-transparent via-[#ffb400]/30 to-[#ffb400]/50" />

      {/* Decorative dots */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:flex gap-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-[#ffb400]/30"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex gap-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-[#ffb400]/30"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

