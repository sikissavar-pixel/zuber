"use client";

import React, { useEffect, useMemo, useState, memo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  CalendarDays,
  MessageSquare,
  Wallet,
  QrCode,
  Star,
  Lock,
  LogOut,
  Signal,
  Menu,
  X,
  ChevronRight,
  Zap,
  User,
} from "lucide-react";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicApply = pathname?.startsWith("/driver/apply");
  const content = <Inner>{children}</Inner>;
  if (isPublicApply) return content;
  return <ProtectedRoute allowedRoles={["driver"]}>{content}</ProtectedRoute>;
}

const NAV_LINKS: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  pulse?: boolean;
}> = [
  { href: "/driver/dashboard", label: "Dashboard", icon: Home },
  { href: "/driver/reservations", label: "Rezervasyonlar", icon: CalendarDays },
  { href: "/driver/earnings", label: "Cüzdanım", icon: Wallet },
  { href: "/driver/chat", label: "Sohbetler", icon: MessageSquare, badge: "2", pulse: true },
  { href: "/driver/profile", label: "Profilim", icon: User },
  { href: "/driver/security", label: "Güvenlik", icon: Lock },
  { href: "/driver/feedback", label: "Yorumlarım", icon: Star },
  { href: "/driver/qr-verification", label: "QR Onay", icon: QrCode },
];

const NavItemRow = memo(function NavItemRow({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: (typeof NAV_LINKS)[number];
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className="block outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc33]/70 rounded-xl"
    >
      <motion.div
        whileHover={{ x: collapsed ? 0 : 6 }}
        whileTap={{ scale: 0.97 }}
        className={`relative flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-xl transition-all duration-300 group ${
          active
            ? "bg-gradient-to-r from-[#ffcc33]/20 via-[#ffb400]/10 to-transparent border border-[#ffb400]/40 shadow-[0_0_20px_rgba(255,180,0,0.25)]"
            : "border border-transparent hover:border-[#ffb400]/25 hover:bg-[#120a00]/60"
        }`}
      >
        {active && !collapsed && (
          <motion.div
            layoutId="driver-nav-glow"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ffcc33]/30 to-transparent blur-2xl -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
        <div
          className={`relative p-2 rounded-lg transition-all duration-300 ${
            active
              ? "bg-[#ffcc33]/30 text-[#050301] shadow-[0_0_18px_rgba(255,204,51,0.35)]"
              : "bg-[#151515]/85 text-[#cfcfcf] group-hover:text-[#ffcc33] group-hover:bg-[#ffcc33]/10"
          }`}
        >
          {item.pulse && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-400 animate-ping" aria-hidden="true" />
          )}
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <span
          className={`font-inter text-sm tracking-wide transition-all duration-200 ${
            collapsed ? "w-0 opacity-0" : "opacity-100 w-auto text-[#f7f1de]"
          } ${active ? "font-semibold text-[#050301]" : "text-[#d5d5d5]"}`}
          aria-hidden={collapsed}
        >
          {item.label}
        </span>
        {!!item.badge && !collapsed && (
          <span className="ml-auto text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-[#ffcc33]/40 text-[#ffcc33]">
            {item.badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
});
NavItemRow.displayName = "NavItemRow";

function Inner({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [time, setTime] = useState<string>("");
  const [online] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setTime(
      new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    const id = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const navItems = useMemo(() => NAV_LINKS, []);

  return (
    <div className="min-h-screen bg-[#010101] text-white font-inter flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-lg z-40 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -20 }}
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-72 ${collapsed ? "lg:w-24" : "lg:w-72"} flex flex-col bg-[#050505]/95 backdrop-blur-2xl border-r border-[#ffcc33]/20 shadow-[18px_0_60px_rgba(0,0,0,0.55)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform`}
        role="navigation"
        aria-label="Zuber sürücü menüsü"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffcc33/10,transparent_60%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-[#ffcc33]/40 via-transparent to-transparent" />

        <div className={`relative z-10 border-b border-[#ffcc33]/20 ${collapsed ? "p-4" : "p-6"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"}`}>
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#ffcc33] to-[#ff8c00] shadow-[0_0_18px_rgba(255,204,51,0.4)]">
                <Zap className="w-4 h-4 text-black" />
              </div>
              {!collapsed && (
                <div>
                  <p className="font-cinzel text-lg tracking-[0.4em] text-white uppercase">Zuber</p>
                  <p className="font-cinzel text-lg text-[#ffcc33]">VIP Partner</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCollapsed((prev) => !prev)}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg border border-[#ffcc33]/30 text-[#ffcc33] hover:bg-[#ffcc33]/10"
                aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#ffcc33]/15 text-[#c7c7c7]"
                aria-label="Menüyü kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {!collapsed && (
            <p className="text-[11px] text-[#b7964d] mt-4 tracking-[0.5em] uppercase">Driver Command</p>
          )}
        </div>

        <nav
          id="driver-sidebar-nav"
          className={`${collapsed ? "p-3" : "p-5"} flex-1 space-y-3 overflow-y-auto relative z-10`}
        >
          {navItems.map((item) => (
            <NavItemRow
              key={item.href}
              item={item}
              active={
                pathname === item.href ||
                (item.href !== "/driver/dashboard" && pathname?.startsWith(item.href))
              }
              collapsed={collapsed}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        <div className={`relative z-10 border-t border-[#ffcc33]/20 ${collapsed ? "p-3" : "p-4"}`}>
          <div
            className={`flex items-center gap-3 rounded-xl border border-[#ffcc33]/25 bg-[#090909]/80 transition-all ${
              collapsed ? "justify-center p-2" : "px-4 py-3 mb-3 shadow-[0_0_25px_rgba(255,204,51,0.12)]"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffcc33]/40 to-[#ffb400]/15 flex items-center justify-center border border-[#ffcc33]/40">
              <span className="font-cinzel text-[#050301] text-sm">{user?.full_name?.charAt(0) || "S"}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{user?.full_name || "Sürücü"}</p>
                <p className="text-xs text-[#b4974d] tracking-[0.4em] uppercase">VIP Driver</p>
              </div>
            )}
          </div>
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-rose-500/10 border border-rose-500/40 text-rose-100 hover:text-white hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] transition-all duration-300 ${
              collapsed ? "py-2" : "py-3"
            }`}
            aria-label="Çıkış"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm font-semibold tracking-wide">Çıkış Yap</span>}
          </motion.button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-30 px-4 lg:px-6 py-3 bg-[#020202]/90 backdrop-blur-xl border-b border-[#ffcc33]/15">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#ffcc33]/15 text-[#cfcfcf]"
              aria-controls="driver-sidebar-nav"
              aria-expanded={sidebarOpen}
              aria-label="Menüyü aç"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c0c0c]/90 border border-[#ffcc33]/20">
                <Signal className="w-4 h-4 text-[#ffcc33]" />
                <motion.span
                  className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-rose-500"}`}
                  animate={online ? { scale: [1, 1.2, 1], opacity: [1, 0.6, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-[#bbb]">{online ? "Çevrimiçi" : "Çevrimdışı"}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c0c0c] border border-[#ffcc33]/20">
                <span className="text-xs text-[#ffcc33] font-mono">{time}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ffcc33]/20 to-[#ffb400]/10 border border-[#ffcc33]/30 flex items-center justify-center lg:hidden">
              <span className="text-xs text-[#ffcc33]">{user?.full_name?.charAt(0) || "S"}</span>
            </div>
          </div>
        </header>
        <div className="h-px bg-gradient-to-r from-transparent via-[#ffcc33]/25 to-transparent" />
        <div className="flex-1 pb-6 lg:pb-0">{children}</div>
      </main>
    </div>
  );
}
