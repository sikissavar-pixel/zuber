"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { GlassCard } from "../ui/GlassCard";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PremiumStatCardProps {
  icon: LucideIcon;
  title: string;
  value?: string | number;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "premium" | "success" | "warning" | "danger";
  delay?: number;
  onClick?: () => void;
  className?: string;
}

const iconVariants = {
  default: "from-[#ffb400]/20 to-[#ffcc33]/10 border-[#ffb400]/30 text-[#ffb400]",
  premium: "from-[#ffcc33]/25 to-[#ffd966]/15 border-[#ffcc33]/40 text-[#ffcc33]",
  success: "from-emerald-500/20 to-emerald-400/10 border-emerald-500/30 text-emerald-400",
  warning: "from-amber-500/20 to-amber-400/10 border-amber-500/30 text-amber-400",
  danger: "from-rose-500/20 to-rose-400/10 border-rose-500/30 text-rose-400",
};

const trendColors = {
  up: "text-emerald-400",
  down: "text-rose-400",
  neutral: "text-gray-400",
};

const TrendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function PremiumStatCard({
  icon: Icon,
  title,
  value,
  numericValue,
  prefix = "",
  suffix = "",
  subtext,
  trend,
  trendValue,
  variant = "default",
  delay = 0,
  onClick,
  className = "",
}: PremiumStatCardProps) {
  const TrendIconComponent = trend ? TrendIcon[trend] : null;

  return (
    <GlassCard
      variant={variant}
      className={`group ${onClick ? "cursor-pointer" : ""} ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, rgba(255, 180, 0, 0.1) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`
              p-3.5 rounded-xl bg-gradient-to-br ${iconVariants[variant]}
              border shadow-lg
            `}
            style={{
              boxShadow: variant === "default" || variant === "premium" 
                ? "0 0 20px rgba(255, 180, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
                : undefined,
            }}
          >
            <Icon className="w-6 h-6" strokeWidth={1.5} />
          </motion.div>

          {/* Trend indicator */}
          {trend && trendValue && TrendIconComponent && (
            <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
              <TrendIconComponent className="w-4 h-4" />
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {numericValue !== undefined ? (
            <AnimatedCounter
              value={numericValue}
              prefix={prefix}
              suffix={suffix}
              className="font-cinzel text-3xl md:text-4xl font-bold text-[#ffcc33] drop-shadow-[0_0_10px_rgba(255,204,51,0.3)]"
            />
          ) : value ? (
            <motion.span 
              className="font-cinzel text-3xl md:text-4xl font-bold text-[#ffcc33] drop-shadow-[0_0_10px_rgba(255,204,51,0.3)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay * 0.1 + 0.3 }}
            >
              {value}
            </motion.span>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="font-cinzel text-base md:text-lg text-[#f5f5f5] tracking-wide mb-1">
          {title}
        </h3>

        {/* Subtext */}
        {subtext && (
          <p className="font-inter text-sm text-[#888] leading-relaxed">
            {subtext}
          </p>
        )}

        {/* Bottom accent line */}
        <motion.div 
          className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#ffb400]/20 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: delay * 0.1 + 0.5, duration: 0.8 }}
        />
      </div>
    </GlassCard>
  );
}

