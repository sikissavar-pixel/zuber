"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Bell, CalendarDays, FilePlus, Home, Lock, LogOut, Menu, MessageSquare, Shield, Wallet, X } from "lucide-react";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicApply = pathname?.startsWith("/partner/apply");
  const content = <Shell>{children}</Shell>;
  if (isPublicApply) {
    return content;
  }
  return (
    <ProtectedRoute allowedRoles={["partner"]}>{content}</ProtectedRoute>
  );
}

const NAV_ITEMS = [
  { href: "/partner/dashboard", label: "Dashboard", icon: Home },
  { href: "/partner/bookings", label: "Rezervasyonlarım", icon: CalendarDays },
  { href: "/partner/bookings/new", label: "Yeni Rezervasyon", icon: FilePlus },
  { href: "/partner/wallet", label: "Cüzdanım", icon: Wallet },
  { href: "/partner/chats", label: "Sohbetler", icon: MessageSquare },
  { href: "/partner/profile", label: "Profilim", icon: Shield },
  { href: "/partner/security", label: "Güvenlik", icon: Lock },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("tr-TR"));

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString("tr-TR")), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-600/15 via-black to-black text-white font-inter">
      <div className="flex min-h-screen">
        <Sidebar pathname={pathname} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {mobileOpen && (
          <button
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          ></button>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-yellow-500/30 bg-black/60 px-4 py-2 text-sm text-yellow-100 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-2 text-yellow-300 transition hover:bg-yellow-500/20 md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Menüyü aç"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="text-xs uppercase tracking-[0.4em] text-yellow-300/80">Partner Panel</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden flex-col text-right text-xs text-yellow-200/70 md:flex">
                <span className="font-semibold text-yellow-100">{user?.full_name || "Partner"}</span>
                <span>{time}</span>
              </div>
              <button
                onClick={() => {
                  try {
                    logout?.();
                  } finally {
                    window.location.href = "/login";
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-200 transition hover:bg-yellow-500/20"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </button>
            </div>
          </div>
          <div className="mb-4 h-1 rounded-xl bg-gradient-to-r from-yellow-700/20 to-transparent" />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ pathname, mobileOpen, onClose }: { pathname: string | null; mobileOpen: boolean; onClose: () => void }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-yellow-500/30 bg-black/85 px-4 py-6 text-yellow-100 shadow-[0_0_35px_rgba(255,204,51,0.15)] transition-transform duration-300 md:static md:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-500/70">Zuber</p>
          <p className="text-2xl font-semibold text-yellow-300">Partner</p>
        </div>
        <button className="md:hidden" onClick={onClose} aria-label="Menüyü kapat">
          <X className="h-5 w-5 text-yellow-200" />
        </button>
      </div>
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/partner/bookings/new" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-all ${
                  active
                    ? "border-yellow-500/60 bg-yellow-500/15 text-yellow-200 shadow-[0_0_18px_rgba(255,204,51,0.2)]"
                    : "border-yellow-500/10 bg-black/40 text-yellow-100 hover:border-yellow-500/40 hover:bg-yellow-500/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6">
        <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-4 text-xs text-yellow-200/70">
          <div className="flex items-center gap-2 font-semibold text-yellow-100">
            <Bell className="h-4 w-4" />
            Canlı Durum
          </div>
          <p className="mt-2 leading-relaxed text-yellow-200/60">
            Rezervasyonlar, sürücüler ve finansal metrikler gerçek zamanlı olarak güncellenir.
          </p>
        </div>
      </div>
    </aside>
  );
}
