"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  href: string;
  badge?: string | number;
  badgeColor?: "gold" | "green" | "red" | "blue";
  delay?: number;
}

const badgeColors = {
  gold: "bg-[#ffb400]/20 text-[#ffb400] border-[#ffb400]/30",
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  red: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  badge,
  badgeColor = "gold",
  delay = 0,
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
    >
      <Link href={href} className="block group">
        <div className="
          relative overflow-hidden rounded-xl p-4
          bg-gradient-to-br from-[#0a0a0a]/90 to-[#111]/80
          border border-[#ffb400]/20
          backdrop-blur-sm
          hover:border-[#ffb400]/40
          hover:shadow-[0_0_25px_rgba(255,180,0,0.15)]
          transition-all duration-300
        ">
          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ffb400]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 flex items-center gap-4">
            {/* Icon */}
            <div className="
              flex-shrink-0 p-2.5 rounded-lg
              bg-gradient-to-br from-[#ffb400]/15 to-[#ffb400]/5
              border border-[#ffb400]/20
              text-[#ffb400]
              group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,180,0,0.2)]
              transition-all duration-300
            ">
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-cinzel text-sm text-[#f5f5f5] truncate">{title}</h4>
                {badge !== undefined && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${badgeColors[badgeColor]}`}>
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-[#666] truncate mt-0.5">{description}</p>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="
              w-5 h-5 text-[#ffb400]/50
              group-hover:text-[#ffb400] group-hover:translate-x-1
              transition-all duration-300
            " />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

