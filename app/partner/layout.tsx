"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicApply = pathname?.startsWith("/partner/apply");
  const content = <Shell>{children}</Shell>;
  if (isPublicApply) {
    // Allow public access to the partner apply page without auth
    return content;
  }
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      {content}
    </ProtectedRoute>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setOpen(false);
  }, []);
  const pathname = usePathname();
  const items = [
    { href: "/partner/dashboard", label: "Dashboard" },
    { href: "/partner/bookings", label: "Rezervasyonlarım" },
    { href: "/partner/bookings/new", label: "Yeni Rezervasyon" },
    { href: "/partner/wallet", label: "Cüzdanım" },
    { href: "/partner/chats", label: "Sohbetler" },
    { href: "/partner/profile", label: "Profilim" },
    { href: "/partner/security", label: "Şifre & Güvenlik" },
  ];

  return (
    <div className="min-h-screen text-[var(--text-secondary)] vip-radial">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${open ? "w-64" : "w-16"} sticky top-0 h-screen bg-gradient-to-b from-[var(--panel)] via-black to-[var(--panel)] backdrop-blur border-r border-[var(--border)] transition-all duration-300 shadow-glow`}>
          <div className="flex items-center justify-between px-4 h-14 border-b border-yellow-500/30">
            <div className="font-semibold text-[var(--gold)] text-sm">{open ? "Zuber Partner Portal" : "ZP"}</div>
            <button onClick={() => setOpen((o) => !o)} className="text-[var(--gold-soft)] hover:text-[var(--gold)] transition">{open ? "⟨" : "⟩"}</button>
          </div>
          <nav className="py-3">
            {items.map((it) => {
              const active = pathname === it.href || (it.href !== "/partner/bookings/new" && pathname?.startsWith(it.href));
              return (
                <Link key={it.href} href={it.href}>
                  <div className={`mx-2 my-1 ${open ? "px-3" : "px-1"} py-2 rounded-xl cursor-pointer transition group ${active ? "bg-black/40 shadow-glow" : "hover:bg-black/30"}`}>
                    <span className={`text-sm ${active ? "text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold)] to-[var(--gold-soft)] underline decoration-[var(--gold-soft)] underline-offset-4" : "text-[var(--text-secondary)]"}`}>{open ? it.label : it.label[0]}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-h-screen">
          {/* Top bar */}
          <div className="fixed left-0 right-0 ml-[var(--sidebar-width,16rem)] h-14 flex items-center justify-end px-6 bg-gradient-to-b from-black/50 to-transparent" style={{ pointerEvents: "none" }}>
            <div className="flex items-center gap-3" style={{ pointerEvents: "auto" }}>
              <UserBar />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-6 pt-20 pb-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function UserBar() {
  // lazy import to avoid circular deps if any
  const Auth = require("@/hooks/useAuth");
  const { user, logout } = Auth.useAuth?.() || { user: null, logout: () => {} };
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div className="relative flex items-center gap-3 text-[var(--text-secondary)] font-semibold">
      <button
        onClick={() => setMenuOpen((v: boolean) => !v)}
        className="text-sm hover:text-[var(--gold)] transition"
      >
        {user?.full_name || user?.username || "Partner"}
      </button>
      <button
        onClick={() => { try { logout?.(); } catch {} window.location.href = "/login"; }}
        className="px-3 py-1 rounded-xl bg-gradient-to-b from-[var(--gold)] to-[var(--gold-soft)] text-black font-semibold hover:shadow-glow-strong transition"
      >
        Çıkış
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[var(--border)] bg-neutral-950/70 backdrop-blur-md shadow-glow">
          <div className="py-2">
            <Link href="/partner/wallet" className="block px-3 py-2 text-[var(--text-secondary)] hover:bg-black/30">Cüzdanım</Link>
            <Link href="/partner/profile" className="block px-3 py-2 text-[var(--text-secondary)] hover:bg-black/30">Profilim</Link>
            <Link href="/partner/security" className="block px-3 py-2 text-[var(--text-secondary)] hover:bg-black/30">Şifre & Güvenlik</Link>
            <button onClick={() => { try { logout?.(); } catch {} window.location.href = "/login"; }} className="w-full text-left px-3 py-2 text-[var(--text-secondary)] hover:bg-black/30">Çıkış</button>
          </div>
        </div>
      )}
    </div>
  );
}