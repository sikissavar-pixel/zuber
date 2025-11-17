"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { Button } from "./ui/Button";
import { useAuth } from "../hooks/useAuth";
import React, { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<{ type: string; text: string; ts: string }[]>([]);
  const [open, setOpen] = useState(false);
  const hasNew = events.length > 0;

  // Partner bölümünde özel layout ve üst bar bulunduğu için global Navbar'ı göstermeyelim
  if (pathname?.startsWith('/partner')) {
    return null;
  }

  useEffect(() => {
    if (!user || user.role !== "partner") return;
    const socket = getSocket();
    const onUpdate = (payload: any) => {
      const text = payload?.status ? `Rezervasyon #${payload.id} → ${payload.status}` : "Rezervasyon güncellendi";
      setEvents((ev) => [{ type: "booking_update", text, ts: new Date().toISOString() }, ...ev].slice(0, 5));
    };
    const onChat = (payload: any) => {
      setEvents((ev) => [{ type: "chat_message", text: `Yeni mesaj: ${payload.message?.slice(0, 40)}` , ts: new Date().toISOString() }, ...ev].slice(0, 5));
    };
    socket.on("booking_update", onUpdate);
    socket.on("chat_message", onChat);
    return () => {
      socket.off("booking_update", onUpdate);
      socket.off("chat_message", onChat);
    };
  }, [user]);
  const links = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/driver/apply", label: "Sürücü Ol" },
    { href: "/partner/apply", label: "Partner Ol" },
  ];
  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-yellow-800/30 bg-black/70 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
          <Link href={pathname?.startsWith('/partner') ? '/partner/dashboard' : '/'} className="font-[var(--font-display)] text-xl text-[var(--gold)]" style={{ textShadow: "0 0 12px rgba(255,213,79,0.25)" }}>
            {pathname?.startsWith('/partner') ? 'Zuber • Partner Paneli' : 'Zuber'}
          </Link>
          <div className="hidden gap-6 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={cn("text-sm gold-underline", pathname === l.href ? "text-[var(--gold)] active" : "text-zinc-300 hover:text-[var(--gold)]")}>{l.label}</Link>
            ))}
            {user?.role === "partner" && (
              <Link href="/partner/dashboard" className={cn("text-sm gold-underline", pathname === "/partner/dashboard" ? "text-[var(--gold)] active" : "text-zinc-300 hover:text-[var(--gold)]")}>Partner Paneli</Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className={cn("text-sm gold-underline", pathname === "/admin" ? "text-[var(--gold)] active" : "text-zinc-300 hover:text-[var(--gold)]")}>Yönetim</Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className={cn("text-sm", user.role === "partner" ? "text-yellow-400" : "text-zinc-400")}>{user.full_name} ({user.role})</span>
                {user.role === "partner" && (
                  <button
                    onClick={() => setOpen(true)}
                    aria-label="Bildirimler"
                    className={cn("relative text-xl", hasNew ? "animate-pulse text-yellow-400" : "text-zinc-300")}
                    title="Bildirimler"
                  >
                    🔔
                    {hasNew && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-500" />}
                  </button>
                )}
                <Button variant="secondary" onClick={logout}>Çıkış</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="secondary">Giriş</Button></Link>
                <Link href="/basvuru"><Button className="btn-shimmer">Başvuru Yap</Button></Link>
              </>
            )}
          </div>
          </div>
        </div>
      </nav>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md mx-auto p-5 rounded-2xl bg-black/80 backdrop-blur border border-yellow-500/40 text-yellow-100 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-yellow-400">Son Olaylar</div>
              <button onClick={() => setOpen(false)} className="text-yellow-300">✖</button>
            </div>
            <div className="space-y-2">
              {events.length === 0 && <div className="text-yellow-200">Henüz olay yok.</div>}
              {events.map((e, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-yellow-500/30">
                  <div className="text-xs text-yellow-300 opacity-80">{e.type} • {new Date(e.ts).toLocaleString()}</div>
                  <div className="mt-1">{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;