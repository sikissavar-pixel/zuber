"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "premium" | "highlight" | "success" | "warning" | "danger";
  glowIntensity?: "none" | "subtle" | "medium" | "strong";
  hoverEffect?: boolean;
  children: React.ReactNode;
}

const variants = {
  default: {
    bg: "bg-gradient-to-br from-[#0a0a0a]/95 via-[#111]/90 to-[#0a0a0a]/95",
    border: "border-[#ffb400]/20",
    glow: "rgba(255, 180, 0, 0.1)",
  },
  premium: {
    bg: "bg-gradient-to-br from-[#0d0d0d]/98 via-[#1a1a0a]/95 to-[#0d0d0d]/98",
    border: "border-[#ffcc33]/30",
    glow: "rgba(255, 204, 51, 0.15)",
  },
  highlight: {
    bg: "bg-gradient-to-br from-[#0f0f00]/95 via-[#1a1500]/90 to-[#0f0f00]/95",
    border: "border-[#ffb400]/40",
    glow: "rgba(255, 180, 0, 0.2)",
  },
  success: {
    bg: "bg-gradient-to-br from-[#0a0f0a]/95 via-[#0f1a0f]/90 to-[#0a0f0a]/95",
    border: "border-emerald-500/30",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  warning: {
    bg: "bg-gradient-to-br from-[#0f0d0a]/95 via-[#1a150a]/90 to-[#0f0d0a]/95",
    border: "border-amber-500/30",
    glow: "rgba(245, 158, 11, 0.15)",
  },
  danger: {
    bg: "bg-gradient-to-br from-[#0f0a0a]/95 via-[#1a0f0f]/90 to-[#0f0a0a]/95",
    border: "border-rose-500/30",
    glow: "rgba(244, 63, 94, 0.15)",
  },
};

const glowIntensities = {
  none: "0",
  subtle: "10px",
  medium: "20px",
  strong: "35px",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = "default", glowIntensity = "medium", hoverEffect = true, className = "", children, ...props }, ref) => {
    const v = variants[variant];
    const glow = glowIntensities[glowIntensity];

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={hoverEffect ? { 
          scale: 1.02, 
          y: -2,
          transition: { duration: 0.2 } 
        } : undefined}
        className={`
          relative overflow-hidden rounded-2xl p-6
          ${v.bg}
          border ${v.border}
          backdrop-blur-xl backdrop-saturate-150
          ${className}
        `}
        style={{
          boxShadow: `0 0 ${glow} ${v.glow}, 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
        {...props}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#ffb400]/40 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

