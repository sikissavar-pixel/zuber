"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Power, LogOut, CalendarDays, Wallet, MessageSquare, 
  QrCode, ChevronUp, X, Zap
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface FloatingActionBarProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  onOpenChat: () => void;
  unreadMessages?: number;
}

export function FloatingActionBar({ 
  isOnline, 
  onToggleOnline, 
  onOpenChat,
  unreadMessages = 0 
}: FloatingActionBarProps) {
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    { icon: CalendarDays, label: "Rezervasyonlar", href: "/driver/reservations" },
    { icon: Wallet, label: "Gelirlerim", href: "/driver/earnings" },
    { icon: QrCode, label: "QR Onay", href: "/driver/qr-verification" },
  ];

  const handleLogout = useCallback(() => {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      logout();
    }
  }, [logout]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Expanded Menu */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Menu */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="
                absolute bottom-full left-0 right-0 mb-2 mx-4
                bg-gradient-to-br from-[#0d0d0d] to-[#111]
                border border-[#ffb400]/20
                rounded-2xl overflow-hidden
                shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
              "
            >
              {/* Quick Actions */}
              <div className="p-4 space-y-2">
                <p className="text-xs text-[#666] uppercase tracking-wider mb-3 px-2">Hızlı Erişim</p>
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={action.href}
                      onClick={() => setIsExpanded(false)}
                      className="
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        bg-[#0a0a0a] border border-[#ffb400]/10
                        hover:border-[#ffb400]/30 hover:bg-[#ffb400]/5
                        transition-all
                      "
                    >
                      <div className="
                        p-2 rounded-lg
                        bg-[#ffb400]/10 text-[#ffb400]
                      ">
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-[#f5f5f5]">{action.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#ffb400]/20 to-transparent" />

              {/* Logout */}
              <div className="p-4">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleLogout}
                  className="
                    w-full flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-rose-500/10 border border-rose-500/20
                    text-rose-400 text-sm font-medium
                    hover:bg-rose-500/20 hover:border-rose-500/30
                    transition-all
                  "
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Bar */}
      <div className="
        relative px-4 py-3 pb-[env(safe-area-inset-bottom,12px)]
        bg-gradient-to-t from-[#0a0a0a] via-[#0d0d0d] to-[#0d0d0d]/95
        border-t border-[#ffb400]/10
        backdrop-blur-xl
      ">
        {/* Top accent line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#ffb400]/20 to-transparent" />

        <div className="flex items-center justify-around">
          {/* Online Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleOnline}
            className="flex flex-col items-center gap-1"
            aria-label={isOnline ? "Çevrimdışı ol" : "Çevrimiçi ol"}
          >
            <div className={`
              relative p-3 rounded-xl transition-all duration-300
              ${isOnline 
                ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                : "bg-[#1a1a1a] text-[#666]"
              }
            `}>
              <Power className="w-5 h-5" />
              {isOnline && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-emerald-500/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <span className={`text-[10px] ${isOnline ? "text-emerald-400" : "text-[#666]"}`}>
              {isOnline ? "Aktif" : "Pasif"}
            </span>
          </motion.button>

          {/* Chat */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenChat}
            className="relative flex flex-col items-center gap-1"
            aria-label="Sohbeti aç"
          >
            <div className="p-3 rounded-xl bg-[#1a1a1a] text-[#ffb400]">
              <MessageSquare className="w-5 h-5" />
            </div>
            {unreadMessages > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="
                  absolute -top-1 right-1
                  w-4 h-4 rounded-full
                  bg-rose-500 text-white text-[10px] font-bold
                  flex items-center justify-center
                "
              >
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </motion.span>
            )}
            <span className="text-[10px] text-[#888]">Sohbet</span>
          </motion.button>

          {/* Center Action (Expand) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative -mt-6"
            aria-label={isExpanded ? "Menüyü kapat" : "Menüyü aç"}
          >
            <div className="
              p-4 rounded-2xl
              bg-gradient-to-br from-[#ffb400] to-[#e6a300]
              shadow-[0_0_30px_rgba(255,180,0,0.4)]
            ">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isExpanded ? (
                  <X className="w-6 h-6 text-black" />
                ) : (
                  <ChevronUp className="w-6 h-6 text-black" />
                )}
              </motion.div>
            </div>
            {/* Pulse */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-[#ffb400]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* Reservations */}
          <Link href="/driver/reservations" className="flex flex-col items-center gap-1">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-[#1a1a1a] text-[#ffb400]"
            >
              <CalendarDays className="w-5 h-5" />
            </motion.div>
            <span className="text-[10px] text-[#888]">Rezervasyon</span>
          </Link>

          {/* QR */}
          <Link href="/driver/qr-verification" className="flex flex-col items-center gap-1">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-[#1a1a1a] text-[#ffb400]"
            >
              <QrCode className="w-5 h-5" />
            </motion.div>
            <span className="text-[10px] text-[#888]">QR Onay</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

