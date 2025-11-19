"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Reservation } from "@/hooks/useReservations";
import { getSocket } from "@/lib/socket";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function PartnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const { user } = useAuth();
  const [events, setEvents] = useState<{ type: string; message: string; ts: number }[]>([]);

  // Fetch stats
  const { data: stats } = useQuery<{ monthly_income: number; active_bids: number; assigned_rides: number }>({
    queryKey: ["partner", "reservations", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/partner/reservations/stats");
      return data;
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  // Fetch last three reservations (include open bids)
  const { data: recent } = useQuery<Reservation[]>({
    queryKey: ["partner", "reservations", "recent"],
    queryFn: async () => {
      const { data } = await api.get("/api/partner/reservations", { params: { include_open_bids: true, limit: 3 } });
      return data;
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
  });

  useEffect(() => {
    const socket = getSocket();
    const onUpdate = (payload: any) => setEvents((e) => [{ type: "booking_update", message: payload?.message || "Rezervasyon güncellendi", ts: Date.now() }, ...e].slice(0, 5));
    const onMsg = (payload: any) => setEvents((e) => [{ type: "chat_message", message: `Yeni mesaj (#${payload?.booking_id})`, ts: Date.now() }, ...e].slice(0, 5));
    const onAssigned = (payload: any) => setEvents((e) => [{ type: "reservation_assigned", message: `Sürücü atandı (#${payload?.id})`, ts: Date.now() }, ...e].slice(0, 5));
    const onBid = (payload: any) => setEvents((e) => [{ type: "bid_submitted", message: `Yeni teklif geldi (#${payload?.reservation_id})`, ts: Date.now() }, ...e].slice(0, 5));
    const onBidAccepted = (payload: any) => setEvents((e) => [{ type: "bid_accepted", message: `Teklif kabul edildi (#${payload?.reservation_id})`, ts: Date.now() }, ...e].slice(0, 5));
    socket.on("booking_update", onUpdate);
    socket.on("chat_message", onMsg);
    socket.on("reservation_assigned", onAssigned);
    socket.on("bid_submitted", onBid);
    socket.on("bid_accepted", onBidAccepted);
    return () => {
      socket.off("booking_update", onUpdate);
      socket.off("chat_message", onMsg);
      socket.off("reservation_assigned", onAssigned);
      socket.off("bid_submitted", onBid);
      socket.off("bid_accepted", onBidAccepted);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">Hoş geldin{user?.full_name ? `, ${user.full_name}` : ""}</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Aylık Gelir">
          <div className="text-3xl font-bold text-yellow-400">₺ {Number(stats?.monthly_income || 0).toLocaleString("tr-TR")}</div>
          <div className="text-yellow-200 text-xs mt-1">Bu ay tamamlanan sürüşlerden</div>
        </Card>
        <a href="/partner/bids/open" className="block">
          <Card title="Aktif Açık Teklifler" className="xl:col-span-1 cursor-pointer hover:shadow-[0_0_40px_rgba(234,179,8,0.35)]">
            <div className="text-2xl font-semibold text-yellow-300">{stats?.active_bids ?? 0}</div>
            <div className="text-yellow-200 text-xs mt-1">Teklif aşamasındaki rezervasyonlar</div>
          </Card>
        </a>
        <Card title="Son 3 Rezervasyon" className="xl:col-span-1">
          <div className="space-y-3">
            {(recent || []).length === 0 && <div className="text-yellow-200">Kayıt bulunmuyor.</div>}
            {(recent || []).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60">
                <div>
                  <div className="text-yellow-300 text-sm">#{r.id} • {new Date(r.pickup_time || r.created_at || Date.now()).toLocaleDateString()}</div>
                  <div className="text-yellow-100 text-xs">{r.pickup_location} → {r.dropoff_location}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Bildirim Özeti" className="xl:col-span-1">
          <div className="space-y-2">
            {events.length === 0 && <div className="text-yellow-200">Son bildirim bulunmuyor.</div>}
            {events.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60">
                <div className="text-yellow-200 text-sm">{e.message}</div>
                <div className="text-yellow-500 text-xs">{new Date(e.ts).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 rounded-2xl bg-black/60 backdrop-blur border border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.25)] ${className}`}>
      <div className="text-yellow-400 font-semibold mb-4">{title}</div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Reservation["status"] | string }) {
  const map: Record<string, { label: string; className: string }> = {
    open_bid: { label: "Teklif Aşamasında", className: "text-yellow-300" },
    pending: { label: "Bekliyor", className: "text-yellow-300" },
    assigned: { label: "Atandı", className: "text-green-400" },
    completed: { label: "Tamamlandı", className: "text-blue-400" },
  };
  const m = map[status] || { label: status, className: "text-yellow-200" };
  return <span className={`text-sm ${m.className}`}>{m.label}</span>;
}

// Chart removed: using aggregated monthly income metric from stats