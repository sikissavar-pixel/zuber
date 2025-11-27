"use client";

import React, { useEffect, useState, memo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, CalendarDays, MessageSquare, Wallet, QrCode, Star, Lock, LogOut, 
  Signal, Menu, X, ChevronRight, Zap
} from "lucide-react";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicApply = pathname?.startsWith("/driver/apply");
  const content = <Inner>{children}</Inner>;
  if (isPublicApply) {
    return content;
  }
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      {content}
    </ProtectedRoute>
  );
}

const NavItem = memo(function NavItem({ 
  item, 
  active, 
  onClick 
}: { 
  item: { href: string; label: string; icon: any }; 
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  
  return (
    <Link href={item.href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-xl
          transition-all duration-300 group
          ${active 
            ? "bg-gradient-to-r from-[#ffb400]/20 to-[#ffb400]/5 border-l-2 border-[#ffb400]" 
            : "hover:bg-[#ffb400]/5 border-l-2 border-transparent"
          }
        `}
      >
        {/* Glow effect for active */}
        {active && (
          <motion.div
            layoutId="activeGlow"
            className="absolute inset-0 rounded-xl bg-[#ffb400]/10 blur-xl -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}

        <div className={`
          p-2 rounded-lg transition-all duration-300
          ${active 
            ? "bg-[#ffb400]/20 text-[#ffcc33] shadow-[0_0_15px_rgba(255,180,0,0.3)]" 
            : "bg-[#111] text-[#888] group-hover:text-[#ffb400] group-hover:bg-[#ffb400]/10"
          }
        `}>
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>

        <span className={`
          font-inter text-sm transition-colors duration-300
          ${active ? "text-[#f5f5f5] font-medium" : "text-[#888] group-hover:text-[#f5f5f5]"}
        `}>
          {item.label}
        </span>

        {active && (
          <ChevronRight className="w-4 h-4 text-[#ffb400] ml-auto" />
        )}
      </motion.div>
    </Link>
  );
});

function Inner({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [time, setTime] = useState<string>("");
  const [online] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const nav = [
    { href: "/driver/dashboard", label: "Dashboard", icon: Home },
    { href: "/driver/reservations", label: "Aktif Rezervasyonlar", icon: CalendarDays },
    { href: "/driver/chat", label: "Sohbetler", icon: MessageSquare },
    { href: "/driver/earnings", label: "Gelirlerim", icon: Wallet },
    { href: "/driver/qr-verification", label: "QR Onay", icon: QrCode },
    { href: "/driver/feedback", label: "Yorumlarım", icon: Star },
    { href: "/driver/security", label: "Güvenlik", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#000] text-white font-inter flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 flex flex-col
        bg-gradient-to-b from-[#0a0a0a] via-[#080808] to-[#050505]
        border-r border-[#ffb400]/10
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Sidebar glow */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-[#ffb400]/20 via-[#ffb400]/5 to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-[#ffb400]/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#ffb400] to-[#ff8c00]">
                  <Zap className="w-4 h-4 text-black" fill="black" />
                </div>
                <span className="font-cinzel text-xl text-[#f5f5f5] tracking-wide">Zuber</span>
                <span className="font-cinzel text-xl text-[#ffb400]">Driver</span>
              </div>
              <p className="text-xs text-[#666] mt-1 tracking-wider">ISTANBUL EDITION</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#ffb400]/10 text-[#888]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={pathname === item.href || (item.href !== "/driver/dashboard" && pathname?.startsWith(item.href))}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-[#ffb400]/10">
          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0d0d0d] border border-[#ffb400]/10 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb400]/30 to-[#ffb400]/10 flex items-center justify-center border border-[#ffb400]/20">
              <span className="font-cinzel text-[#ffcc33] text-sm">
                {user?.full_name?.charAt(0) || "S"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#f5f5f5] font-medium truncate">
                {user?.full_name || "Sürücü"}
              </p>
              <p className="text-xs text-[#666]">Premium Driver</p>
            </div>
          </div>

          {/* Logout button */}
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              bg-gradient-to-r from-rose-500/10 to-rose-500/5
              border border-rose-500/20
              text-rose-400 hover:text-rose-300
              hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]
              transition-all duration-300
            "
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Çıkış Yap</span>
          </motion.button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-4 lg:px-6 py-3 bg-[#000]/80 backdrop-blur-xl border-b border-[#ffb400]/10">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#ffb400]/10 text-[#888]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d0d0d] border border-[#ffb400]/10">
                <motion.div
                  className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-rose-500"}`}
                  animate={online ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-[#888]">{online ? "Çevrimiçi" : "Çevrimdışı"}</span>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d0d0d] border border-[#ffb400]/10">
                <span className="text-xs text-[#ffb400] font-mono">{time}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffb400]/20 to-[#ffb400]/5 border border-[#ffb400]/20 flex items-center justify-center lg:hidden">
                <span className="text-xs text-[#ffcc33]">{user?.full_name?.charAt(0) || "S"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Progress bar decoration */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#ffb400]/30 to-transparent" />

        {/* Page content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
