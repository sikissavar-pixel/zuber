"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useMyReservations, Reservation } from "@/hooks/useReservations";
import { getSocket } from "@/lib/socket";

export default function PartnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const { user } = useAuth();
  const { data: reservations } = useMyReservations();
  const [events, setEvents] = useState<{ type: string; message: string; ts: number }[]>([]);
  
  useEffect(() => {
    const socket = getSocket();
    const onUpdate = (payload: any) => setEvents((e) => [{ type: "booking_update", message: payload?.message || "Rezervasyon güncellendi", ts: Date.now() }, ...e].slice(0, 5));
    const onMsg = (payload: any) => setEvents((e) => [{ type: "chat_message", message: `Yeni mesaj (#${payload?.booking_id})`, ts: Date.now() }, ...e].slice(0, 5));
    const onAssigned = (payload: any) => setEvents((e) => [{ type: "reservation_assigned", message: `Sürücü atandı (#${payload?.id})`, ts: Date.now() }, ...e].slice(0, 5));
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
    // Basic income aggregation by month from reservations
    const map: Record<string, number> = {};
    (reservations || []).forEach((r) => {
      const d = new Date(r.pickup_time || r.created_at || Date.now());
      const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}`;
      const amt = typeof r.total_amount === "string" ? parseFloat(r.total_amount) : Number(r.total_amount || 0);
      map[key] = (map[key] || 0) + (amt || 0);
    });
    const keys = Object.keys(map).sort();
    return keys.slice(-6).map((k) => ({ label: k, value: map[k] }));
  }, [reservations]);

  const lastThree = useMemo(() => (reservations || []).slice(0,3), [reservations]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">Hoş geldin{user?.full_name ? `, ${user.full_name}` : ""}</h1>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Aylık Gelir">
          <IncomeChart data={monthly} />
        </Card>
        <Card title="Son 3 Rezervasyon" className="xl:col-span-1">
          <div className="space-y-3">
            {lastThree.length === 0 && <div className="text-yellow-200">Kayıt bulunmuyor.</div>}
            {lastThree.map((r) => (
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

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const map: Record<string, string> = {
    pending: "🟡 Bekliyor",
    assigned: "🟢 Atandı",
    accepted: "🟢 Onaylandı",
    started: "🚗 Yola Çıkıldı",
    arrived: "📍 Varışta",
    qr_pending: "🔶 QR Bekleniyor",
    completed: "🔵 Tamamlandı",
  };
  return <span className="text-sm">{map[status] || status}</span>;
}

function IncomeChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return <div className="text-yellow-200">Veri yok</div>;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center w-12">
          <div className="w-full rounded-t-xl bg-yellow-500" style={{ height: `${Math.round((d.value / max) * 140)}px`, boxShadow: "0 0 20px rgba(234,179,8,0.4)" }} />
          <div className="mt-2 text-[10px] text-yellow-300">{d.label}</div>
        </div>
      ))}
    </div>
  );
}