"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, MessageSquare, Wallet, QrCode, Star, Lock, LogOut, Signal } from "lucide-react";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicApply = pathname?.startsWith("/driver/apply");
  const content = <Inner>{children}</Inner>;
  if (isPublicApply) {
    // Allow public access to the driver apply page without auth
    return content;
  }
  return (
    <ProtectedRoute allowedRoles={["driver"]}>
      {content}
    </ProtectedRoute>
  );
}

function Inner({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [online] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);
  const nav = [
    { href: "/driver/dashboard", label: "Dashboard", icon: Home },
    { href: "/driver/reservations", label: "Aktif Rezervasyonlar", icon: CalendarDays },
    { href: "/driver/chat", label: "Sohbetler", icon: MessageSquare },
    { href: "/driver/earnings", label: "Gelirlerim", icon: Wallet },
    { href: "/driver/qr-verification", label: "QR Onay / Sürüş Bitişi", icon: QrCode },
    { href: "/driver/feedback", label: "Yorumlarım", icon: Star },
    { href: "/driver/security", label: "Şifre & Güvenlik", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-600/40 via-yellow-900/10 to-black text-yellow-400 font-inter flex">
      <aside className="w-72 p-4 border-r border-yellow-500/30 bg-black/80 backdrop-blur-sm">
        <div className="mb-6">
          <div className="text-2xl tracking-wide">Zuber Driver</div>
          <div className="text-sm text-gray-400">Istanbul Edition</div>
        </div>
        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-300 ${
                  active ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300" : "bg-black/60 border-yellow-500/30"
                } hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="mt-6 w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış</span>
        </button>
        <div className="mt-4 text-xs text-gray-400">Hoş geldin, {user?.full_name || "Sürücü"}</div>
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