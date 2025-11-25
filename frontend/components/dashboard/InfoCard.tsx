"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { DASHBOARD_THEME as THEME } from "./theme";

type InfoCardProps = {
  icon: LucideIcon;
  title: string;
  value?: string;
  subtext?: string;
  className?: string;
};

export function InfoCard({ icon: Icon, title, value, subtext, className = "" }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${THEME.cardBg} ${THEME.borderGlow} rounded-xl p-6 flex flex-col justify-between h-full hover:shadow-[0_0_25px_rgba(255,180,0,0.25)] transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-full bg-[#ffb400]/10 ${THEME.gold}`}>
          <Icon className="w-6 h-6" />
        </div>
        {value && <div className={`${THEME.fontHead} text-2xl ${THEME.gold}`}>{value}</div>}
      </div>
      <div>
        <h3 className={`${THEME.fontHead} text-lg ${THEME.textMain} mb-1`}>{title}</h3>
        {subtext && <p className={`${THEME.fontBody} text-sm ${THEME.textSecondary}`}>{subtext}</p>}
      </div>
    </motion.div>
  );
}
