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
    <div className="min-h-screen text-gold-soft font-inter flex" style={{ background: "radial-gradient(ellipse at top left, rgba(241,196,15,0.15) 0%, transparent 60%)", backgroundColor: "#000" }}>
      {/* Sidebar */}
      <aside className="w-72 p-4 border-r border-[var(--border)] bg-gradient-to-b from-[var(--panel)] via-black to-[var(--panel)] backdrop-blur-sm">
        <div className="mb-6">
          <div className="text-2xl font-bold text-gold drop-shadow-glow">Zuber Driver</div>
          <div className="text-sm text-gold-muted">Istanbul Edition</div>
        </div>
        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all duration-300 ${active ? "border-[var(--border)] shadow-glow" : "border-[var(--border)]/60"} hover:shadow-glow`}>
                  <Icon className={`w-5 h-5 ${active ? "text-gold" : "text-gold-muted"}`} />
                  <span className={`${active ? "gold-underline bg-clip-text text-transparent bg-gradient-to-r from-gold to-gold-soft" : "text-gold-soft"}`}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="mt-6 w-full flex items-center gap-3 px-3 py-2 rounded-2xl shadow-glowStrong bg-gradient-to-r from-gold to-gold-soft text-black uppercase tracking-wide">
          <LogOut className="w-5 h-5" />
          <span>Çıkış</span>
        </button>
        <div className="mt-4 text-xs text-gold-muted">Hoş geldin, {user?.full_name || "Sürücü"}</div>
      </aside>
      {/* Content */}
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between px-4 py-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-gold-soft">
            <Signal className={`w-4 h-4 ${online ? "text-green-400" : "text-red-400"}`} />
            <span>{online ? "Çevrimiçi" : "Çevrimdışı"}</span>
          </div>
          <div className="text-sm font-mono text-gold-soft">{time}</div>
        </div>
        {children}
      </main>
    </div>
  );
}