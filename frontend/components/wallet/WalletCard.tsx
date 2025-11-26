"use client";

import { motion } from "framer-motion";
import { DASHBOARD_THEME as THEME } from "@/components/dashboard/theme";

type WalletCardProps = {
  title: string;
  subtitle: string;
  value: number;
  gradient?: string;
};

export default function WalletCard({ title, subtitle, value, gradient = "from-[#ffcc33]/20 to-transparent" }: WalletCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border border-[#ffcc33]/25 bg-[#0b0b0b]/70 backdrop-blur-xl shadow-[0_0_35px_rgba(255,204,51,0.12)] p-6 relative overflow-hidden`}
    >
      <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${gradient} blur-3xl opacity-40`} />
      <div className="relative space-y-2">
        <p className={`${THEME.fontBody} text-sm uppercase tracking-[0.3em] text-yellow-500/70`}>{title}</p>
        <h3 className={`${THEME.fontHead} text-3xl text-yellow-100`}>
          {value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
        </h3>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>
    </motion.div>
  );
}
