"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, User, MapPin, Clock, Star, Car } from "lucide-react";

interface VIPCallData {
  id: number;
  guestName: string;
  pickup: string;
  dropoff: string;
  time: string;
  estimatedAmount?: string;
  isVIP?: boolean;
  rating?: number;
}

interface VIPCallModalProps {
  isOpen: boolean;
  callData: VIPCallData | null;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}

export function VIPCallModal({ isOpen, callData, onAccept, onDecline }: VIPCallModalProps) {
  // Vibration effect on open
  useEffect(() => {
    if (isOpen && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }, [isOpen]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !callData) return;
      if (e.key === "Enter") onAccept(callData.id);
      if (e.key === "Escape") onDecline(callData.id);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, callData, onAccept, onDecline]);

  if (!callData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          role="alertdialog"
          aria-label="VIP Transfer Çağrısı"
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 50% 50%, rgba(255,180,0,0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(255,180,0,0.25) 0%, transparent 60%)",
                "radial-gradient(circle at 50% 50%, rgba(255,180,0,0.15) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Pulsing border effect */}
          <motion.div
            className="absolute inset-4 lg:inset-auto lg:w-[500px] lg:h-auto rounded-3xl pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 0 2px rgba(255,180,0,0.3), 0 0 30px rgba(255,180,0,0.2)",
                "0 0 0 4px rgba(255,180,0,0.5), 0 0 60px rgba(255,180,0,0.4)",
                "0 0 0 2px rgba(255,180,0,0.3), 0 0 30px rgba(255,180,0,0.2)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="
              relative w-full max-w-md
              bg-gradient-to-br from-[#0d0d0d] via-[#111] to-[#0a0a0a]
              border border-[#ffb400]/30
              rounded-3xl overflow-hidden
              shadow-[0_0_60px_rgba(0,0,0,0.8)]
            "
          >
            {/* VIP Badge */}
            {callData.isVIP && (
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="
                    px-3 py-1 rounded-full
                    bg-gradient-to-r from-[#ffb400] to-[#ffd700]
                    text-black text-xs font-bold uppercase tracking-wider
                    shadow-[0_0_20px_rgba(255,180,0,0.5)]
                  "
                >
                  ⭐ VIP
                </motion.div>
              </div>
            )}

            {/* Header */}
            <div className="p-6 text-center border-b border-[#ffb400]/10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="
                  w-20 h-20 mx-auto mb-4 rounded-full
                  bg-gradient-to-br from-[#ffb400]/20 to-[#ffb400]/5
                  border-2 border-[#ffb400]/30
                  flex items-center justify-center
                  shadow-[0_0_40px_rgba(255,180,0,0.3)]
                "
              >
                <Car className="w-10 h-10 text-[#ffb400]" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-cinzel text-2xl text-[#ffcc33] mb-2"
              >
                Yeni Transfer Çağrısı
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 text-[#888]"
              >
                <User className="w-4 h-4" />
                <span className="font-medium text-[#f5f5f5]">{callData.guestName}</span>
                {callData.rating && (
                  <span className="flex items-center gap-1 text-[#ffb400]">
                    <Star className="w-3 h-3 fill-current" />
                    {callData.rating}
                  </span>
                )}
              </motion.div>
            </div>

            {/* Route Details */}
            <div className="p-6 space-y-4">
              {/* Pickup */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="mt-1 w-3 h-3 rounded-full bg-[#ffb400] shadow-[0_0_10px_rgba(255,180,0,0.5)]" />
                <div>
                  <p className="text-xs text-[#666] uppercase tracking-wide mb-0.5">Alış</p>
                  <p className="text-[#f5f5f5] font-medium">{callData.pickup}</p>
                </div>
              </motion.div>

              {/* Route line */}
              <div className="ml-1.5 w-px h-6 bg-gradient-to-b from-[#ffb400] to-[#ffb400]/30" />

              {/* Dropoff */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start gap-3"
              >
                <div className="mt-1 w-3 h-3 rounded-full border-2 border-[#ffb400]" />
                <div>
                  <p className="text-xs text-[#666] uppercase tracking-wide mb-0.5">Varış</p>
                  <p className="text-[#f5f5f5] font-medium">{callData.dropoff}</p>
                </div>
              </motion.div>

              {/* Info row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between pt-4 border-t border-[#ffb400]/10"
              >
                <div className="flex items-center gap-2 text-sm text-[#888]">
                  <Clock className="w-4 h-4" />
                  <span>{callData.time}</span>
                </div>
                {callData.estimatedAmount && (
                  <div className="font-cinzel text-xl text-[#ffcc33] font-bold">
                    {callData.estimatedAmount}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              {/* Decline */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDecline(callData.id)}
                className="
                  flex-1 py-4 rounded-xl
                  bg-gradient-to-br from-rose-500/20 to-rose-500/10
                  border border-rose-500/30
                  text-rose-400 font-semibold
                  flex items-center justify-center gap-2
                  hover:border-rose-500/50
                  hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]
                  transition-all
                "
                aria-label="Çağrıyı reddet"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Reddet</span>
              </motion.button>

              {/* Accept */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAccept(callData.id)}
                className="
                  flex-1 py-4 rounded-xl
                  bg-gradient-to-br from-[#ffb400] to-[#e6a300]
                  text-black font-bold
                  flex items-center justify-center gap-2
                  shadow-[0_0_30px_rgba(255,180,0,0.4)]
                  hover:shadow-[0_0_40px_rgba(255,180,0,0.6)]
                  transition-all
                "
                aria-label="Çağrıyı kabul et"
              >
                <Phone className="w-5 h-5" />
                <span>Kabul Et</span>
              </motion.button>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#ffb400]/10 to-transparent rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#ffb400]/10 to-transparent rounded-br-3xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

