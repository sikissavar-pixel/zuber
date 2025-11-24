"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Reservation } from "@/hooks/useReservations";
import { useAuth } from "@/hooks/useAuth";
import { getSocket } from "@/lib/socket";

export default function DriverReservations() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "assigned" | "completed">("all");
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
      // Only refetch when the update concerns the logged-in driver
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
      // Socket will update, but also refetch to be responsive
      queryClient.invalidateQueries({ queryKey: ["driver", "reservations"] });
    } catch (e) {
      console.error(e);
      alert("Durum güncellenemedi");
    }
  };

  const renderActions = (r: Reservation) => {
    if (r.status === "assigned") {
      return (
        <button
          onClick={() => updateStatus(r.id, "in_progress")}
          className="px-3 py-1 rounded-lg bg-yellow-500 text-black text-xs font-semibold hover:scale-[1.02] transition-all"
        >
          Sürüşü Başlat
        </button>
      );
    }
    if (r.status === "in_progress") {
      return (
        <button
          onClick={() => updateStatus(r.id, "completed")}
          className="px-3 py-1 rounded-lg bg-green-500 text-black text-xs font-semibold hover:scale-[1.02] transition-all"
        >
          Tamamla
        </button>
      );
    }
    return null;
  };

  const rows = useMemo(() => {
    const list = reservations || [];
    return list.filter((r) => {
      if (filter === "all") return r.status !== "cancelled";
      return r.status === filter;
    });
  }, [reservations, filter]);

  const statusBadge = (s: Reservation["status"]) => {
    const map: Record<Reservation["status"], { label: string; className: string }> = {
      pending: { label: "Bekliyor", className: "bg-yellow-700/30 text-yellow-300" },
      assigned: { label: "Atandı", className: "bg-green-700/30 text-green-300" },
      in_progress: { label: "Sürüşte", className: "bg-blue-700/30 text-blue-300" },
      completed: { label: "Tamamlandı", className: "bg-gray-700/30 text-gray-300" },
      cancelled: { label: "İptal", className: "bg-red-700/30 text-red-300" },
    };
    const m = map[s];
    return <span className={`px-2 py-1 rounded-lg text-xs ${m.className}`}>{m.label}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["all", "assigned", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300 ${
              filter === f ? "opacity-100" : "opacity-75"
            }`}
          >
            {f === "all" ? "Tümü" : f === "assigned" ? "Aktif" : "Tamamlanan"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-4 text-yellow-200">Yükleniyor...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-yellow-200">Gösterilecek rezervasyon yok.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-gray-300">
              <tr className="text-left">
                <th className="p-3">Tarih</th>
                <th className="p-3">Kalkış</th>
                <th className="p-3">Varış</th>
                <th className="p-3">Durum</th>
                <th className="p-3">Ödeme</th>
                <th className="p-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-yellow-500/10">
                  <td className="p-3">{new Date(r.pickup_time || r.created_at).toLocaleString()}</td>
                  <td className="p-3">{r.pickup_location}</td>
                  <td className="p-3">{r.dropoff_location}</td>
                  <td className="p-3">{statusBadge(r.status)}</td>
                  <td className="p-3">{r.payment_status === "paid" ? "Ödendi" : "Beklemede"}</td>
                  <td className="p-3">{renderActions(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}