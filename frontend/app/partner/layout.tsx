"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Bell, CalendarDays, FilePlus, Home, Lock, LogOut, MessageSquare, Shield, Signal, Wallet } from "lucide-react";

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
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString("tr-TR"));
  const [online] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString("tr-TR")), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-600/40 via-yellow-900/10 to-black text-yellow-400 font-inter flex">
      <aside className="w-72 p-4 border-r border-yellow-500/30 bg-black/80 backdrop-blur-sm flex flex-col">
        <div className="mb-6">
          <div className="text-2xl tracking-wide text-yellow-200">Zuber Partner</div>
          <div className="text-sm text-gray-400">Istanbul Edition</div>
        </div>
        <nav className="space-y-2 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-300 ${
                  active ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-200" : "bg-black/60 border-yellow-500/30 text-yellow-100 hover:border-yellow-500/50"
                } hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-4 text-xs text-yellow-200/70">
          <div className="flex items-center gap-2 font-semibold text-yellow-100">
            <Bell className="h-4 w-4" />
            Canlı Durum
          </div>
          <p className="mt-2 leading-relaxed text-yellow-200/60">
            Rezervasyonlar, sürücüler ve finansal metrikler gerçek zamanlı olarak güncellenir.
          </p>
        </div>
        <button
          onClick={() => logout?.()}
          className="mt-4 w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300 text-yellow-100"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış</span>
        </button>
        <div className="mt-2 text-xs text-gray-400">Hoş geldin, {user?.full_name || "Partner"}</div>
      </aside>
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between px-4 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Signal className={`w-4 h-4 ${online ? "text-green-400" : "text-red-400"}`} />
            <span>{online ? "Çevrimiçi" : "Çevrimdışı"}</span>
          </div>
          <div className="text-sm text-gray-300">{time}</div>
        </div>
        <div className="h-1 rounded-xl bg-gradient-to-r from-yellow-700/20 to-transparent mb-4" />
        {children}
      </main>
    </div>
  );
}
