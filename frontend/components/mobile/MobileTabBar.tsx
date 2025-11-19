"use client";
import React from "react";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";

type Tab = { label: string; href: string };

const roleTabs: Record<string, Tab[]> = {
  driver: [
    { label: "Ana Sayfa", href: "/driver?tab=missions" },
    { label: "Rezervasyonlar", href: "/driver?tab=missions" },
    { label: "Profil", href: "/driver?tab=profile" },
  ],
  partner: [
    { label: "Ana Sayfa", href: "/partner" },
    { label: "Rezervasyonlar", href: "/partner" },
    { label: "Profil", href: "/profile" },
  ],
  admin: [
    { label: "Genel Bakış", href: "/admin" },
    { label: "Harita", href: "/admin" },
    { label: "Finans", href: "/admin" },
  ],
};

export const MobileTabBar: React.FC = () => {
  const { user } = useAuth();
  const tabs = user ? roleTabs[user.role] || [] : [];
  if (!tabs.length) return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/90 backdrop-blur border-t border-zinc-800">
      <div className="flex items-center justify-around py-3">
        {tabs.map((t) => (
          <Link key={t.label} href={t.href} className="text-xs sm:text-sm text-zinc-300 hover:text-[var(--gold)]">
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileTabBar;