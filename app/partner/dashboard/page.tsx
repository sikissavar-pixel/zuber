"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useMyReservations, Reservation } from "@/hooks/useReservations";
import { getSocket } from "@/lib/socket";

export default function PartnerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className="bg-black min-h-screen text-[#E9E9E9] font-inter">
        <Inner />
      </div>
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
    <div className="container pt-20 pb-16 md:pt-24 md:pb-24 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-yellow-500/20 pb-6">
        <div>
          <h1 className="font-cinzel text-3xl md:text-4xl text-yellow-400 title-glow mb-2">
            Partner Paneli
          </h1>
          <p className="text-zinc-400 text-sm">
            Hoş geldin, <span className="text-yellow-200 font-medium">{user?.full_name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income Chart */}
        <div className="vip-card p-6 lg:col-span-2">
          <h3 className="font-cinzel text-xl text-yellow-400 mb-6 flex items-center gap-2">
            <span>📊</span> Aylık Gelir
          </h3>
          <div className="h-64 w-full flex items-end justify-around gap-2 p-4 bg-black/40 rounded-lg border border-yellow-900/20">
             <IncomeChart data={monthly} />
          </div>
        </div>

        {/* Notifications */}
        <div className="vip-card p-6">
          <h3 className="font-cinzel text-xl text-yellow-400 mb-6 flex items-center gap-2">
            <span>🔔</span> Bildirimler
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {events.length === 0 && <div className="text-zinc-500 text-sm text-center py-8">Yeni bildirim yok.</div>}
            {events.map((e, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-zinc-900/50 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors">
                <div className="text-zinc-200 text-sm font-medium pr-2">{e.message}</div>
                <div className="text-yellow-600 text-[10px] whitespace-nowrap">{new Date(e.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="vip-card p-6 lg:col-span-3">
          <h3 className="font-cinzel text-xl text-yellow-400 mb-6 flex items-center gap-2">
            <span>🗓️</span> Son Rezervasyonlar
          </h3>
          <div className="grid gap-4">
            {lastThree.length === 0 && <div className="text-zinc-500 text-center py-8">Henüz rezervasyon kaydı bulunmuyor.</div>}
            {lastThree.map((r) => (
              <div key={r.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-yellow-500/10 hover:bg-zinc-900/60 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold text-xs border border-yellow-500/20">
                    #{r.id}
                  </div>
                  <div>
                    <div className="text-zinc-200 font-medium text-sm md:text-base">{r.pickup_location} <span className="text-yellow-500 px-1">➔</span> {r.dropoff_location}</div>
                    <div className="text-zinc-500 text-xs mt-1">{new Date(r.pickup_time || r.created_at || Date.now()).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const map: Record<string, { label: string, color: string }> = {
    pending: { label: "Bekliyor", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    assigned: { label: "Atandı", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    accepted: { label: "Onaylandı", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    started: { label: "Yolda", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    arrived: { label: "Varışta", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
    qr_pending: { label: "QR Bekleniyor", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    completed: { label: "Tamamlandı", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  };
  const conf = map[status] || { label: status, color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${conf.color}`}>
      {conf.label}
    </span>
  );
}

function IncomeChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return <div className="text-zinc-500 w-full h-full flex items-center justify-center">Veri yok</div>;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="w-full h-full flex items-end justify-around gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center w-full max-w-[60px] group cursor-pointer">
          <div className="relative w-full flex items-end justify-center h-[180px]">
             <div 
               className="w-full mx-1 rounded-t bg-gradient-to-t from-yellow-600 to-yellow-400 opacity-80 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
               style={{ height: `${Math.max(10, Math.round((d.value / max) * 100))}%` }} 
             />
             <div className="absolute -top-8 bg-zinc-800 text-yellow-400 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-yellow-500/20 whitespace-nowrap z-10">
               {d.value}₺
             </div>
          </div>
          <div className="mt-3 text-[10px] text-zinc-400 font-mono border-t border-zinc-800 w-full text-center pt-1">{d.label}</div>
        </div>
      ))}
    </div>
  );
}