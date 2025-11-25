"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useMyReservations } from "@/hooks/useReservations";
import { getSocket } from "@/lib/socket";
import { DASHBOARD_THEME as THEME } from "@/components/dashboard/theme";
import { InfoCard } from "@/components/dashboard/InfoCard";
import { PartnerIncomeChart, PartnerNotifications, PartnerPanelCard, PartnerReservationList } from "@/components/partner/DashboardWidgets";
import { Wallet, Users, Briefcase, Bell, TrendingUp } from "lucide-react";

type EventEntry = { type: string; message: string; ts: number };

const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export default function PartnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className={`min-h-screen ${THEME.bg} text-white font-inter`}>
        <div className="flex justify-center pb-16 pt-24 md:pt-28">
          <Inner />
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Inner() {
  const { user } = useAuth();
  const { data: reservations = [] } = useMyReservations();
  const [events, setEvents] = useState<EventEntry[]>([]);

  useEffect(() => {
    const socket = getSocket();
    const onUpdate = (payload: any) =>
      setEvents((e) => [{ type: "booking_update", message: payload?.message || "Rezervasyon güncellendi", ts: Date.now() }, ...e].slice(0, 5));
    const onMsg = (payload: any) =>
      setEvents((e) => [{ type: "chat_message", message: `Yeni mesaj (#${payload?.booking_id})`, ts: Date.now() }, ...e].slice(0, 5));
    const onAssigned = (payload: any) =>
      setEvents((e) => [{ type: "reservation_assigned", message: `Sürücü atandı (#${payload?.id})`, ts: Date.now() }, ...e].slice(0, 5));
    socket.on("booking_update", onUpdate);
    socket.on("chat_message", onMsg);
    socket.on("reservation_assigned", onAssigned);
    return () => {
      socket.off("booking_update", onUpdate);
      socket.off("chat_message", onMsg);
      socket.off("reservation_assigned", onAssigned);
    };
  }, []);

  const monthly = useMemo(() => {
    const map: Record<string, number> = {};
    reservations.forEach((r) => {
      const d = new Date(r.pickup_time || r.created_at || Date.now());
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      const amt = typeof r.total_amount === "string" ? parseFloat(r.total_amount) : Number(r.total_amount || 0);
      map[key] = (map[key] || 0) + (amt || 0);
    });
    return Object.keys(map)
      .sort()
      .slice(-6)
      .map((k) => ({ label: k, value: map[k] }));
  }, [reservations]);

  const totals = useMemo(() => {
    const totalAmount = reservations.reduce((sum, r) => {
      const amt = typeof r.total_amount === "string" ? parseFloat(r.total_amount) : Number(r.total_amount || 0);
      return sum + (amt || 0);
    }, 0);
    const active = reservations.filter((r) => ["pending", "assigned", "accepted"].includes(r.status || "")).length;
    const completed = reservations.filter((r) => r.status === "completed").length;
    const currentMonthKey = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    })();
    const monthRevenue = monthly.find((m) => m.label === currentMonthKey)?.value || 0;
    return {
      totalAmount,
      active,
      completed,
      monthRevenue,
    };
  }, [reservations, monthly]);

  const lastThree = useMemo(() => reservations.slice(0, 3), [reservations]);

  const stats = [
    { icon: Wallet, title: "Toplam Gelir", value: currency.format(totals.totalAmount), subtext: "Tüm zamanlar" },
    { icon: Users, title: "Aktif Rezervasyon", value: totals.active.toString(), subtext: "Bekleyen & atanan" },
    { icon: Briefcase, title: "Tamamlanan", value: totals.completed.toString(), subtext: "Teslim edilen sürüş" },
    { icon: TrendingUp, title: "Aylık Gelir", value: currency.format(totals.monthRevenue), subtext: "Bu ay" },
  ];

  return (
    <div className="dashboard-shell space-y-10">
      <div className="space-y-2 text-center">
        <h1 className={`${THEME.fontHead} text-3xl md:text-5xl ${THEME.gold}`}>Hoş geldin, {user?.full_name || "Kullanıcı"}</h1>
        <p className={`${THEME.fontBody} ${THEME.textSecondary} text-sm uppercase tracking-[0.4em]`}>Zuber Partner Command</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {stats.map((stat) => (
          <InfoCard key={stat.title} icon={stat.icon} title={stat.title} value={stat.value} subtext={stat.subtext} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PartnerPanelCard title="Aylık Gelir" icon={<TrendingUp className="h-5 w-5" />} className="lg:col-span-2">
          <PartnerIncomeChart data={monthly} />
        </PartnerPanelCard>

        <PartnerPanelCard title="Bildirimler" icon={<Bell className="h-5 w-5" />} className="max-h-[420px] overflow-auto">
          <PartnerNotifications events={events} />
        </PartnerPanelCard>
      </div>

      <PartnerPanelCard title="Son Rezervasyonlar" icon={<Briefcase className="h-5 w-5" />}>
        <PartnerReservationList rows={lastThree} />
      </PartnerPanelCard>
    </div>
  );
}
