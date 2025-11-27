"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { Reservation } from "@/hooks/useReservations";
import { useAuth } from "@/hooks/useAuth";
import { getSocket } from "@/lib/socket";
import { GlassCard } from "@/components/driver/ui";
import { StatusBadge } from "@/components/driver/live-feed";

const STATUS_FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "assigned", label: "Aktif" },
  { id: "completed", label: "Tamamlanan" },
] as const;

const statusMap: Record<Reservation["status"], Parameters<typeof StatusBadge>[0]["status"]> = {
  pending: "pending",
  assigned: "assigned",
  in_progress: "on_route",
  completed: "completed",
  cancelled: "cancelled",
};

export default function DriverReservations() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]["id"]>("all");
  const queryClient = useQueryClient();
  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ["driver", "reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/reservations");
      return data;
    },
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });

  useEffect(() => {
    const socket = getSocket();
    const refetchIfMine = (payload: any) => {
      if (!payload) return;
      if (payload.driver_id && user?.id && Number(payload.driver_id) === Number(user.id)) {
        queryClient.invalidateQueries({ queryKey: ["driver", "reservations"] });
      }
    };
    socket.on("reservation_assigned", refetchIfMine);
    socket.on("reservation_updated", refetchIfMine);
    return () => {
      socket.off("reservation_assigned", refetchIfMine);
      socket.off("reservation_updated", refetchIfMine);
    };
  }, [queryClient, user?.id]);

  const updateStatus = async (id: number, status: Reservation["status"]) => {
    try {
      await api.patch(`/api/reservations/${id}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ["driver", "reservations"] });
    } catch (e) {
      console.error(e);
      alert("Durum güncellenemedi");
    }
  };

  const rows = useMemo(() => {
    const list = reservations || [];
    return list.filter((reservation) => {
      if (filter === "all") return reservation.status !== "cancelled";
      return reservation.status === filter;
    });
  }, [reservations, filter]);

  const summary = useMemo(() => {
    const list = reservations || [];
    const active = list.filter((reservation) => reservation.status === "assigned" || reservation.status === "in_progress")
      .length;
    const completed = list.filter((reservation) => reservation.status === "completed").length;
    const pendingPayments = list.filter((reservation) => reservation.payment_status !== "paid").length;
    return { total: list.length, active, completed, pendingPayments };
  }, [reservations]);

  return (
    <div className="space-y-6">
      <GlassCard variant="default" className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]">rezervasyon yönetimi</p>
            <h1 className="font-cinzel text-2xl text-white">Canlı operasyon görünümü</h1>
          </div>
          <div className="flex gap-4 text-sm text-[#cfcfcf]">
            <span>Aktif: {summary.active}</span>
            <span>Tamamlanan: {summary.completed}</span>
            <span>Ödeme bekleyen: {summary.pendingPayments}</span>
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-3">
        {STATUS_FILTERS.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => setFilter(item.id)}
            className={`px-4 py-2 rounded-2xl border transition ${
              filter === item.id
                ? "border-[#ffcc33] bg-[#ffcc33]/10 text-white"
                : "border-[#ffcc33]/20 text-[#cfcfcf] hover:border-[#ffcc33]/40"
            }`}
          >
            {item.label}
          </motion.button>
        ))}
      </div>

      <GlassCard variant="default" className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-[#cfcfcf]">Rezervasyonlar yükleniyor...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-[#cfcfcf]">Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-[#888] uppercase text-xs tracking-[0.3em] bg-[#050505]">
                <tr>
                  <th className="px-5 py-3 text-left">Tarih</th>
                  <th className="px-5 py-3 text-left">Kalkış</th>
                  <th className="px-5 py-3 text-left">Varış</th>
                  <th className="px-5 py-3 text-left">Durum</th>
                  <th className="px-5 py-3 text-left">Ödeme</th>
                  <th className="px-5 py-3 text-left">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((reservation) => (
                  <tr key={reservation.id} className="border-t border-[#ffcc33]/10">
                    <td className="px-5 py-4 text-[#cfcfcf]">
                      {new Date(reservation.pickup_time || reservation.created_at).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-5 py-4 text-white">{reservation.pickup_location}</td>
                    <td className="px-5 py-4 text-white">{reservation.dropoff_location}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={statusMap[reservation.status] || "pending"} size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          reservation.payment_status === "paid"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-200 border border-amber-500/20"
                        }`}
                      >
                        {reservation.payment_status === "paid" ? "Ödendi" : "Bekliyor"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {reservation.status === "assigned" && (
                        <button
                          onClick={() => updateStatus(reservation.id, "in_progress")}
                          className="px-3 py-1.5 rounded-xl border border-[#ffcc33]/40 text-[#ffcc33] hover:bg-[#ffcc33]/10 text-xs"
                        >
                          Sürüşü Başlat
                        </button>
                      )}
                      {reservation.status === "in_progress" && (
                        <button
                          onClick={() => updateStatus(reservation.id, "completed")}
                          className="px-3 py-1.5 rounded-xl border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10 text-xs"
                        >
                          Tamamla
                        </button>
                      )}
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