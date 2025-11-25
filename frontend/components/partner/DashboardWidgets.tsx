"use client";

import { motion } from "framer-motion";
import { Bell, CalendarRange, MapPin } from "lucide-react";
import type { Reservation } from "@/hooks/useReservations";
import { DASHBOARD_THEME as THEME } from "@/components/dashboard/theme";
import React from "react";

type ChartDatum = {
  label: string;
  value: number;
};

type EventItem = {
  type: string;
  message: string;
  ts: number;
};

type PanelProps = {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

const baseCard = `${THEME.cardBg} ${THEME.borderGlow} rounded-xl p-6 h-full`;

export function PartnerPanelCard({ title, icon, action, className = "", children }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className={`${baseCard} ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon && <span className="text-[#ffcc33]">{icon}</span>}
          <h3 className={`${THEME.fontHead} text-xl ${THEME.textMain}`}>{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

export function PartnerIncomeChart({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#777]">
        Son 6 aya ait veri bulunamadı.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="flex h-56 w-full items-end gap-4">
      {data.map((item) => {
        const height = Math.max(12, Math.round((item.value / max) * 100));
        return (
          <div key={item.label} className="flex-1">
            <div className="relative flex h-56 flex-col-reverse items-center">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-[#b37500] via-[#ffcc33] to-[#ffe38a] shadow-[0_0_20px_rgba(255,204,51,0.35)] transition-all hover:from-[#ffb400] hover:via-[#ffd966]"
                style={{ height: `${height}%` }}
              />
              <div className="absolute -top-8 rounded-lg border border-[#ffcc33]/30 bg-[#050505] px-2 py-1 text-xs text-[#ffcc33] opacity-0 shadow-[0_0_20px_rgba(255,204,51,0.2)] transition-opacity duration-200 hover:opacity-100">
                {Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(item.value)}₺
              </div>
            </div>
            <div className="mt-3 text-center text-xs uppercase tracking-wide text-[#888]">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function PartnerNotifications({ events }: { events: EventItem[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-[#777]">
        Şu anda yeni bildirim yok.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {events.map((event, idx) => (
        <div
          key={`${event.ts}-${idx}`}
          className={`flex items-start justify-between rounded-xl border border-[#ffb400]/20 bg-[#0f0f0f] p-5 text-sm transition hover:border-[#ffb400]/40`}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full border border-[#ffcc33]/30 bg-[#ffcc33]/10 p-2">
              <Bell className="h-4 w-4 text-[#ffcc33]" />
            </div>
            <p className={`${THEME.fontBody} text-left text-[#f5f5f5]`}>{event.message}</p>
          </div>
          <span className="text-xs text-[#888]">{new Date(event.ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      ))}
    </div>
  );
}

export function PartnerReservationList({ rows }: { rows: Reservation[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#777]">
        Henüz rezervasyon kaydı bulunmuyor.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {rows.map((reservation) => (
        <div
          key={reservation.id}
          className={`${THEME.cardBg} border border-[#ffb400]/20 rounded-xl p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#ffb400]/30 bg-[#ffb400]/10 text-sm font-semibold text-[#ffb400]">
              #{reservation.id}
            </div>
            <div>
              <div className={`${THEME.fontBody} text-base ${THEME.textMain}`}>
                {reservation.pickup_location}
                <span className="px-2 text-[#ffb400]">→</span>
                {reservation.dropoff_location}
              </div>
              <div className={`mt-1 flex items-center gap-2 text-xs ${THEME.textSecondary}`}>
                <CalendarRange className="h-3.5 w-3.5" />
                {new Date(reservation.pickup_time || reservation.created_at || Date.now()).toLocaleString("tr-TR")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-full border border-[#ffb400]/40 bg-[#ffb400]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#ffb400]">
              <MapPin className="h-3.5 w-3.5" />
              {reservation.status?.replace("_", " ") || "Bilinmiyor"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
