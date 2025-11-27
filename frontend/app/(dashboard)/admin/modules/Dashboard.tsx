"use client";

import React, { useEffect, useState } from "react";
import { useAdminSummary, useHealthCheck, useSystemStatus } from "../../../../hooks/useAdmin";
import { Loader2, Users, Car, Building2, Activity, Calendar, DollarSign, Server, Wifi, Database, Zap } from "lucide-react";
import clsx from "clsx";

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count.toLocaleString("tr-TR")}</span>;
}

function StatusBadge({ status, label }: { status: "online" | "offline" | "warning"; label: string }) {
  const styles = {
    online: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    offline: "bg-rose-500/15 text-rose-200 border-rose-500/30",
    warning: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  };
  return (
    <div className={clsx("rounded-full border px-3 py-1.5 text-xs font-semibold flex items-center gap-2", styles[status])}>
      <div className={clsx("h-2 w-2 rounded-full", status === "online" ? "bg-emerald-400" : status === "warning" ? "bg-amber-400" : "bg-rose-400")} />
      {label}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: summary, isLoading: summaryLoading } = useAdminSummary();
  const { data: health, isLoading: healthLoading } = useHealthCheck();
  const { data: systemStatus, isLoading: systemLoading } = useSystemStatus();

  const stats = [
    {
      title: "Toplam Kullanıcı",
      value: summary?.total_users || 0,
      icon: Users,
      accent: "gold",
      loading: summaryLoading,
    },
    {
      title: "Toplam Sürücü",
      value: summary?.total_drivers || 0,
      icon: Car,
      accent: "emerald",
      loading: summaryLoading,
    },
    {
      title: "Toplam Partner",
      value: summary?.total_partners || 0,
      icon: Building2,
      accent: "amber",
      loading: summaryLoading,
    },
    {
      title: "Aktif Sürücü",
      value: summary?.online_drivers || 0,
      icon: Activity,
      accent: "emerald",
      loading: summaryLoading,
    },
    {
      title: "Aktif Rezervasyon",
      value: summary?.active_reservations || 0,
      icon: Calendar,
      accent: "gold",
      loading: summaryLoading,
    },
    {
      title: "Günlük Gelir",
      value: summary?.daily_revenue || 0,
      icon: DollarSign,
      accent: "gold",
      loading: summaryLoading,
      format: "currency",
    },
    {
      title: "Haftalık Gelir",
      value: summary?.weekly_revenue || 0,
      icon: DollarSign,
      accent: "gold",
      loading: summaryLoading,
      format: "currency",
    },
    {
      title: "Aylık Gelir",
      value: summary?.monthly_revenue || 0,
      icon: DollarSign,
      accent: "gold",
      loading: summaryLoading,
      format: "currency",
    },
  ];

  const systemHealth = [
    {
      label: "Sistem Durumu",
      status: summary?.system_status === "healthy" ? "online" : summary?.system_status === "degraded" ? "warning" : "offline",
      icon: Server,
    },
    {
      label: "Socket Durumu",
      status: summary?.socket_status === "connected" ? "online" : "offline",
      icon: Wifi,
    },
    {
      label: "API Durumu",
      status: summary?.api_status === "operational" ? "online" : "offline",
      icon: Zap,
    },
    {
      label: "Veritabanı",
      status: summary?.db_status === "connected" ? "online" : "offline",
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Genel Durum</h2>
        <p className="text-sm text-zinc-400">Sistem özeti ve canlı istatistikler</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const palette: Record<string, string> = {
            gold: "from-[#fbd483] to-[#f3b94f]",
            emerald: "from-emerald-400/70 to-emerald-500/50",
            amber: "from-amber-300/70 to-amber-500/50",
          };
          return (
            <div key={stat.title} className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-[#b18a39] mb-3">
                <Icon className="h-4 w-4 text-[#f5c76a]" />
                {stat.title}
              </div>
              <div className="text-3xl font-cinzel text-white mb-3">
                {stat.loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[#f5c76a]" />
                ) : stat.format === "currency" ? (
                  <AnimatedCounter value={stat.value} /> + " ₺"
                ) : (
                  <AnimatedCounter value={stat.value} />
                )}
              </div>
              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${palette[stat.accent]}`} />
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <h3 className="font-cinzel text-xl text-[#f5d47d] mb-4">Sistem Sağlığı</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {systemHealth.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 p-4 rounded-2xl border border-[#3a2a0f] bg-black/40">
                <Icon className="h-5 w-5 text-[#f5c76a]" />
                <div className="flex-1">
                  <p className="text-xs text-zinc-400 mb-1">{item.label}</p>
                  <StatusBadge status={item.status} label={item.status === "online" ? "Aktif" : item.status === "warning" ? "Uyarı" : "Kapalı"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

