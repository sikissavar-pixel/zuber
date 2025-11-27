"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, User, Phone, ChevronRight } from "lucide-react";
import type { Reservation } from "@/hooks/useReservations";
import { StatusBadge } from "./StatusBadge";
import { PulsingDot } from "../ui/PulsingDot";

interface LiveFeedCardProps {
  reservation: Reservation;
  onAccept: (id: number) => void;
  index?: number;
}

export function LiveFeedCard({ reservation: r, onAccept, index = 0 }: LiveFeedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      layout
      className="group relative"
    >
      {/* Timeline connector */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#ffb400]/50 via-[#ffb400]/20 to-transparent" />
      
      {/* Card */}
      <div className="
        relative ml-12 
        bg-gradient-to-br from-[#0d0d0d]/95 via-[#111]/90 to-[#0a0a0a]/95
        border border-[#ffb400]/25
        rounded-2xl p-5
        backdrop-blur-xl
        hover:border-[#ffb400]/50
        hover:shadow-[0_0_30px_rgba(255,180,0,0.15)]
        transition-all duration-500
      ">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ffb400]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Timeline dot */}
        <div className="absolute -left-[2.85rem] top-6">
          <PulsingDot color="gold" size="lg" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <StatusBadge status="new" />
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#888]" />
              <span className="font-cinzel text-lg text-[#f5f5f5]">
                {r.guest_name || "Misafir"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#666]">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(r.pickup_time || r.created_at).toLocaleString("tr-TR")}</span>
          </div>
        </div>

        {/* Route */}
        <div className="relative z-10 space-y-3 mb-5">
          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-3 h-3 rounded-full bg-[#ffb400] shadow-[0_0_10px_rgba(255,180,0,0.5)]" />
            </div>
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide mb-0.5">Alış Noktası</p>
              <p className="text-[#f5f5f5] font-medium">{r.pickup_location}</p>
            </div>
          </div>

          {/* Route line */}
          <div className="ml-1.5 w-px h-4 bg-gradient-to-b from-[#ffb400] to-[#ffb400]/30" />

          {/* Dropoff */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-[#ffb400] bg-transparent" />
            </div>
            <div>
              <p className="text-xs text-[#666] uppercase tracking-wide mb-0.5">Varış Noktası</p>
              <p className="text-[#f5f5f5] font-medium">{r.dropoff_location}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#ffb400]/10">
          {/* Price (if available) */}
          {r.total_amount && (
            <div className="flex items-center gap-2">
              <span className="text-[#888] text-sm">Tahmini:</span>
              <span className="font-cinzel text-xl text-[#ffcc33] font-bold">
                {typeof r.total_amount === 'string' ? r.total_amount : `${r.total_amount}₺`}
              </span>
            </div>
          )}

          {/* Accept button */}
          <motion.button
            onClick={() => onAccept(r.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              relative overflow-hidden
              bg-gradient-to-r from-[#ffb400] to-[#ffcc33]
              hover:from-[#ffcc33] hover:to-[#ffd966]
              text-black font-bold py-3 px-6 rounded-xl
              shadow-[0_0_20px_rgba(255,180,0,0.3)]
              hover:shadow-[0_0_30px_rgba(255,180,0,0.5)]
              transition-all duration-300
              flex items-center gap-2
            "
          >
            <span>Kabul Et</span>
            <ChevronRight className="w-4 h-4" />
            
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#ffb400]/10 to-transparent rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#ffb400]/5 to-transparent rounded-bl-2xl" />
      </div>
    </motion.div>
  );
}

