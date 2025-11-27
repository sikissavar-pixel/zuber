"use client";

import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import api from "@/lib/api";
import type { Reservation } from "@/hooks/useReservations";
import { GlassCard, GradientText, AnimatedCounter } from "@/components/driver/ui";

type DriverEarningsResponse = {
  total: number;
  monthly: { month: string; amount: number }[];
};

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export default function DriverEarnings() {
  const { data: earningsData, isLoading: isEarningsLoading } = useQuery<DriverEarningsResponse>({
    queryKey: ["driver", "earnings", "summary"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/earnings");
      return data;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const { data: reservationsData = [], isLoading: isReservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["driver", "earnings", "reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/reservations");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const monthlySeries = earningsData?.monthly ?? [];
  const total = earningsData?.total ?? 0;

  const averageTicket = useMemo(() => {
    if (!reservationsData.length) return 0;
    const sum = reservationsData.reduce((acc, item) => acc + (Number(item.total_amount) || 0), 0);
    return sum / reservationsData.length;
  }, [reservationsData]);

  const recentSettlements = useMemo(
    () =>
      [...reservationsData]
        .filter((reservation) => reservation.status === "completed")
        .sort(
          (a, b) =>
            new Date(b.pickup_time || b.created_at).getTime() - new Date(a.pickup_time || a.created_at).getTime()
        )
        .slice(0, 8),
    [reservationsData]
  );

  return (
    <div className="space-y-6">
      <GlassCard variant="premium" glowIntensity="strong" className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-[#ffcc33]">kazanç raporu</p>
            <h1 className="font-cinzel text-3xl md:text-4xl mt-2">
              <span className="text-[#f5f5f5]">Toplam </span>
              <GradientText variant="gold">kazanç</GradientText>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <AnimatedCounter value={total} suffix="₺" className="text-4xl font-cinzel text-[#ffcc33]" />
              <span className="flex items-center gap-1 text-emerald-400 text-sm">
                <TrendingUp className="w-4 h-4" /> {recentSettlements.length ? "%+4" : "%0"}
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#777] mt-2">
              Ortalama bilet: {averageTicket ? currency.format(averageTicket) : "—"}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-[#c0c0c0] bg-[#0b0b0b]/70 border border-[#ffcc33]/20 rounded-2xl p-4">
            <p className="uppercase tracking-[0.3em] text-[#ffcc33] text-xs">durum özeti</p>
            <div className="flex items-center justify-between">
              <span>Tamamlanan sürüş</span>
              <strong>{recentSettlements.length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Açık ödeme</span>
              <strong>
                {reservationsData.filter((item) => item.payment_status !== "paid").length}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Son veri yenileme</span>
              <strong>{isEarningsLoading ? "Yükleniyor..." : "şimdi"}</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-cinzel text-lg">Aylık Trend</p>
          <span className="text-xs text-[#888]">gerçek zamanlı</span>
        </div>
        {isEarningsLoading ? (
          <EmptyState message="Gelir grafiği yükleniyor..." />
        ) : monthlySeries.length === 0 ? (
          <EmptyState message="Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz." />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySeries} margin={{ left: 0, right: 0, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="month" stroke="#777" />
                <YAxis stroke="#777" />
                <Tooltip contentStyle={{ background: "#050505", border: "1px solid #ffcc33", color: "#ffcc33" }} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ffcc33"
                  strokeWidth={3}
                  dot={{ stroke: "#ffcc33", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <GlassCard variant="default" className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ffcc33]/15 flex items-center justify-between">
          <p className="font-cinzel text-lg">Son Transferler</p>
          <span className="text-xs uppercase tracking-[0.3em] text-[#888]">gelir kaydı</span>
        </div>
        {isReservationsLoading ? (
          <div className="p-6">
            <EmptyState message="Gerçek ödemeler yükleniyor..." />
          </div>
        ) : recentSettlements.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-[#050505] text-[#a1a1a1] uppercase text-xs tracking-[0.3em]">
                <tr>
                  <th className="px-5 py-3 text-left">Tarih</th>
                  <th className="px-5 py-3 text-left">Güzergah</th>
                  <th className="px-5 py-3 text-left">Tutar</th>
                  <th className="px-5 py-3 text-left">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentSettlements.map((row) => (
                  <tr key={row.id} className="border-t border-[#ffcc33]/10 hover:bg-[#0b0b0b] transition-colors">
                    <td className="px-5 py-4">
                      {new Date(row.pickup_time || row.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-4 text-[#f5f5f5]">
                      {row.pickup_location} → {row.dropoff_location}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#ffcc33]">
                      {currency.format(Number(row.total_amount) || 0)}
                    </td>
                    <td className="px-5 py-4">
                      <EarningStatusBadge status={row.payment_status === "paid" ? "completed" : "pending"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

type EarningStatus = "completed" | "pending" | "processing";

function EarningStatusBadge({ status }: { status: EarningStatus }) {
  const map: Record<EarningStatus, { label: string; classes: string }> = {
    completed: { label: "Tamamlandı", classes: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" },
    pending: { label: "Beklemede", classes: "bg-amber-500/10 text-amber-300 border border-amber-500/30" },
    processing: { label: "İşleniyor", classes: "bg-blue-500/10 text-blue-200 border border-blue-500/30" },
  };
  const { label, classes } = map[status];
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${classes}`}>{label}</span>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-[#ffcc33]/30 bg-[#050505]/60 text-[#c9c9c9] px-4 py-6 text-sm text-center"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
