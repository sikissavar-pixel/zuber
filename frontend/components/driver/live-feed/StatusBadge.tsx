"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, Car, AlertCircle, Loader2 } from "lucide-react";

type Status = "new" | "pending" | "assigned" | "accepted" | "on_route" | "completed" | "cancelled";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  animated?: boolean;
}

const statusConfig: Record<Status, {
  label: string;
  icon: typeof Clock;
  bg: string;
  text: string;
  border: string;
  glow: string;
}> = {
  new: {
    label: "YENİ",
    icon: AlertCircle,
    bg: "bg-gradient-to-r from-[#ffb400]/25 to-[#ffcc33]/15",
    text: "text-[#ffcc33]",
    border: "border-[#ffb400]/40",
    glow: "shadow-[0_0_15px_rgba(255,180,0,0.3)]",
  },
  pending: {
    label: "BEKLEMEDE",
    icon: Clock,
    bg: "bg-gradient-to-r from-amber-500/20 to-amber-400/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
  },
  assigned: {
    label: "ATANDI",
    icon: Car,
    bg: "bg-gradient-to-r from-blue-500/20 to-blue-400/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
  },
  accepted: {
    label: "KABUL EDİLDİ",
    icon: CheckCircle,
    bg: "bg-gradient-to-r from-emerald-500/20 to-emerald-400/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  },
  on_route: {
    label: "YOLDA",
    icon: Car,
    bg: "bg-gradient-to-r from-cyan-500/20 to-cyan-400/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]",
  },
  completed: {
    label: "TAMAMLANDI",
    icon: CheckCircle,
    bg: "bg-gradient-to-r from-green-500/20 to-green-400/10",
    text: "text-green-400",
    border: "border-green-500/30",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.2)]",
  },
  cancelled: {
    label: "İPTAL",
    icon: AlertCircle,
    bg: "bg-gradient-to-r from-rose-500/20 to-rose-400/10",
    text: "text-rose-400",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]",
  },
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export function StatusBadge({ 
  status, 
  size = "md", 
  showIcon = true,
  animated = true 
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const badge = (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider
        ${sizes[size]}
        ${config.bg}
        ${config.text}
        ${config.border}
        ${config.glow}
        border
      `}
    >
      {showIcon && (
        status === "new" && animated ? (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon className={iconSizes[size]} />
          </motion.span>
        ) : (
          <Icon className={iconSizes[size]} />
        )
      )}
      {config.label}
    </span>
  );

  if (animated && status === "new") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

