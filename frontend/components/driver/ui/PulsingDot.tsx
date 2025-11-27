"use client";

import { motion } from "framer-motion";

interface PulsingDotProps {
  color?: "gold" | "green" | "red" | "blue" | "amber";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colors = {
  gold: {
    bg: "bg-[#ffb400]",
    glow: "rgba(255, 180, 0, 0.6)",
    ring: "ring-[#ffb400]/30",
  },
  green: {
    bg: "bg-emerald-500",
    glow: "rgba(16, 185, 129, 0.6)",
    ring: "ring-emerald-500/30",
  },
  red: {
    bg: "bg-rose-500",
    glow: "rgba(244, 63, 94, 0.6)",
    ring: "ring-rose-500/30",
  },
  blue: {
    bg: "bg-blue-500",
    glow: "rgba(59, 130, 246, 0.6)",
    ring: "ring-blue-500/30",
  },
  amber: {
    bg: "bg-amber-500",
    glow: "rgba(245, 158, 11, 0.6)",
    ring: "ring-amber-500/30",
  },
};

const sizes = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function PulsingDot({ color = "gold", size = "md", className = "" }: PulsingDotProps) {
  const c = colors[color];
  const s = sizes[size];

  return (
    <span className={`relative flex ${className}`}>
      <motion.span
        className={`absolute inline-flex h-full w-full rounded-full ${c.bg} opacity-75`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.75, 0, 0.75],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ boxShadow: `0 0 10px ${c.glow}` }}
      />
      <span 
        className={`relative inline-flex rounded-full ${s} ${c.bg}`}
        style={{ boxShadow: `0 0 8px ${c.glow}` }}
      />
    </span>
  );
}

