"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

type DetailSection = "monthly" | "notifications" | "reservations";

export default function PartnerDashboardPage() {
  const { data: reservations = [] } = useMyReservations();
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [openDetails, setOpenDetails] = useState<Record<DetailSection, boolean>>({
    monthly: false,
    notifications: false,
    reservations: false,
  });

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

  const detailCards = [
    {
      key: "monthly" as DetailSection,
      title: "Aylık Gelir",
      value: currency.format(totals.monthRevenue),
      subtitle: "Son 6 aylık performans",
      icon: <TrendingUp className="h-5 w-5 text-[#ffcc33]" />,
    },
    {
      key: "notifications" as DetailSection,
      title: "Bildirimler",
      value: `${events.length} güncel`,
      subtitle: "Son 5 sistem uyarısı",
      icon: <Bell className="h-5 w-5 text-[#ffcc33]" />,
    },
    {
      key: "reservations" as DetailSection,
      title: "Son Rezervasyonlar",
      value: `${lastThree.length} kayıt`,
      subtitle: "En yeni talepler",
      icon: <Briefcase className="h-5 w-5 text-[#ffcc33]" />,
    },
  ];

  const stats = [
    { icon: Wallet, title: "Toplam Gelir", value: currency.format(totals.totalAmount), subtext: "Tüm zamanlar" },
    { icon: Users, title: "Aktif Rezervasyon", value: totals.active.toString(), subtext: "Bekleyen & atanan" },
    { icon: Briefcase, title: "Tamamlanan", value: totals.completed.toString(), subtext: "Teslim edilen sürüş" },
    { icon: TrendingUp, title: "Aylık Gelir", value: currency.format(totals.monthRevenue), subtext: "Bu ay" },
  ];

  const toggleDetail = (section: DetailSection) =>
    setOpenDetails((prev) => ({ ...prev, [section]: !prev[section] }));

  const detailContent: Record<DetailSection, React.ReactNode> = {
    monthly: (
      <PartnerPanelCard title="Aylık Gelir" icon={<TrendingUp className="h-5 w-5" />} className="mt-2">
        <PartnerIncomeChart data={monthly} />
      </PartnerPanelCard>
    ),
    notifications: (
      <PartnerPanelCard title="Bildirimler" icon={<Bell className="h-5 w-5" />} className="mt-2">
        <PartnerNotifications events={events} />
      </PartnerPanelCard>
    ),
    reservations: (
      <PartnerPanelCard title="Son Rezervasyonlar" icon={<Briefcase className="h-5 w-5" />} className="mt-2">
        <PartnerReservationList rows={lastThree} />
      </PartnerPanelCard>
    ),
  };

  return (
    <div className="flex justify-center py-6 text-white">
      <div className="dashboard-shell space-y-8">
        <div className="dashboard-grid dashboard-grid-mobile-scroll gap-4">
          {stats.map((stat) => (
            <InfoCard key={stat.title} icon={stat.icon} title={stat.title} value={stat.value} subtext={stat.subtext} />
          ))}
        </div>

        <div className="dashboard-grid dashboard-grid-mobile-scroll gap-4">
          {detailCards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => toggleDetail(card.key)}
              aria-expanded={openDetails[card.key]}
              className={`flex flex-col justify-between rounded-xl border bg-[#0f0f0f] p-4 text-left transition-all duration-200 ${
                openDetails[card.key]
                  ? "border-[#ffcc33]/60 shadow-[0_0_25px_rgba(255,204,51,0.35)]"
                  : "border-[#ffcc33]/20 hover:border-[#ffcc33]/40 hover:shadow-[0_0_20px_rgba(255,204,51,0.2)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#ffcc33]/30 bg-[#ffcc33]/10 p-2">{card.icon}</div>
                <div>
                  <p className={`${THEME.fontHead} text-lg ${THEME.textMain}`}>{card.title}</p>
                  <p className={`${THEME.fontBody} text-xs ${THEME.textSecondary}`}>{card.subtitle}</p>
                </div>
              </div>
              <div className={`${THEME.fontHead} text-2xl ${THEME.gold} mt-4`}>{card.value}</div>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {detailCards.map((card) => (
            <AnimatePresence key={card.key}>
              {openDetails[card.key] && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {detailContent[card.key]}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>
    </div>
  );
}
