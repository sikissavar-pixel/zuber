"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { CarFront as Car, Wallet, Clock, Bell } from "lucide-react";
import { getSocket } from "@/lib/socket";
import type { Reservation } from "@/hooks/useReservations";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const card = "bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 hover:shadow-[0_0_20px_#facc15]/30 transition-transform hover:scale-[1.02]";

export default function DriverDashboard() {
  const { user } = useAuth();
  const name = user?.full_name || "Sürücü";
  const [feed, setFeed] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<{ type: string; text: string; ts: number }[]>([]);

  const { data: dashboard, refetch } = useQuery<{ active_ride: any; daily_earnings: number; pending_payments: number; completed_count: number } | undefined>({
    queryKey: ["driver", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/dashboard");
      return data;
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const socket = getSocket();
    const onCreated = (payload: any) => {
      if (!payload) return;
      if (payload.status === "pending" && !payload.driver_id) {
        setFeed((prev) => {
          const exists = prev.some((r) => r.id === payload.id);
          return exists
            ? prev
            : [
                {
                  id: payload.id,
                  guest_id: payload.guest_id,
                  driver_id: payload.driver_id,
                  partner_id: payload.partner_id,
                  created_by_user_id: payload.created_by_user_id,
                  guest_name: payload.guest_name,
                  pickup_location: payload.pickup_location,
                  dropoff_location: payload.dropoff_location,
                  pickup_time: payload.pickup_time,
                  status: payload.status,
                  payment_status: payload.payment_status,
                  total_amount: payload.total_amount,
                  payment_reference: payload.payment_reference,
                  created_at: payload.created_at,
                },
                ...prev,
              ];
        });
      }
    };
    const onAssigned = (payload: any) => {
      if (!payload) return;
      setFeed((prev) => prev.filter((r) => r.id !== payload.id));
    };
    socket.on("reservation_created", onCreated);
    socket.on("reservation_assigned", onAssigned);
    // Realtime notifications (subscribe to driver room via RoleRoomJoiner globally)
    const push = (type: string, text: string) => setEvents((e) => [{ type, text, ts: Date.now() }, ...e].slice(0, 3));
    socket.on("new_reservation_available", () => push("bid", "Yeni teklif fırsatı"));
    socket.on("partner_bid_accepted", (p: any) => push("assignment", `Partner kabul etti (#${p?.reservation_id})`));
    socket.on("partner_bid_rejected", (p: any) => push("bid", `Teklif reddedildi (#${p?.reservation_id})`));
    socket.on("ride_cancelled", (p: any) => push("cancel", `Rezervasyon iptal edildi (#${p?.id || p?.reservation_id})`));
    socket.on("ride_completed", (p: any) => push("complete", `Sürüş tamamlandı (#${p?.id || p?.reservation_id})`));
    // New lifecycle events: refresh dashboard data on changes
    const onQrVerified = (p: any) => {
      push("qr", `QR onayı alındı (#${p?.reservation_id || p?.id})`);
      refetch();
    };
    const onRideCompleted = (p: any) => {
      push("complete", `Sürüş tamamlandı (#${p?.reservation_id || p?.id})`);
      refetch();
    };
    const onPaymentConfirmed = (p: any) => {
      const amount = typeof p?.amount === "number" ? p.amount : (p?.amount_cents ? Math.round(p.amount_cents / 100) : undefined);
      push("payment", amount ? `Ödeme onaylandı, ₺${amount} cüzdana eklendi.` : "Ödeme onaylandı, cüzdan güncellendi.");
      refetch();
    };
    socket.on("qr_verified", onQrVerified);
    socket.on("ride_completed", onRideCompleted);
    socket.on("payment_confirmed", onPaymentConfirmed);
    // Also listen to existing backend events for compatibility
    socket.on("reservation_updated", (p: any) => push("update", `Rezervasyon güncellendi (#${p?.id})`));
    socket.on("trip_completed", (p: any) => push("complete", `Sürüş tamamlandı (#${p?.id})`));
    return () => {
      socket.off("reservation_created", onCreated);
      socket.off("reservation_assigned", onAssigned);
      socket.off("new_reservation_available");
      socket.off("partner_bid_accepted");
      socket.off("partner_bid_rejected");
      socket.off("ride_cancelled");
      socket.off("ride_completed");
      socket.off("qr_verified", onQrVerified);
      socket.off("payment_confirmed", onPaymentConfirmed);
      socket.off("reservation_updated");
      socket.off("trip_completed");
    };
  }, []);

  const accept = (reservationId: number) => {
    const socket = getSocket();
    if (!user?.id) return;
    socket.emit("accept_reservation", { reservation_id: reservationId, driver_id: user.id });
  };
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={card}>
        <div className="text-2xl font-semibold text-yellow-400">Hoş geldin, {name}</div>
        <div className="text-sm text-gray-400">Zuber Control Room — Istanbul Edition</div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-yellow-400" />
            <div className="text-lg font-semibold text-yellow-400">Aktif Rezervasyon</div>
          </div>
          {dashboard?.active_ride ? (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <span>{dashboard.active_ride.pickup_location} → {dashboard.active_ride.dropoff_location}</span>
              <span className="opacity-70">{new Date(dashboard.active_ride.pickup_time).toLocaleTimeString()}</span>
              <Link href={`/driver/reservations`} className="ml-auto px-3 py-1 rounded-lg bg-yellow-500 text-black text-xs hover:bg-yellow-400">Detayları Gör</Link>
            </div>
          ) : (
            <div className="text-sm text-gray-400">Şu an aktif rezervasyon yok.</div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-400" />
            <div className="text-lg font-semibold text-yellow-400">Günlük Kazanç</div>
          </div>
          <div className="text-2xl">{Number(dashboard?.daily_earnings || 0).toFixed(0)}₺</div>
          <div className="text-xs text-gray-400">Tamamlanan {dashboard?.completed_count || 0} sürüş</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div className="text-lg font-semibold text-yellow-400">Bekleyen Ödeme</div>
          </div>
          <div className="text-sm text-gray-400">{dashboard?.pending_payments || 0} adet sürüş QR onayı bekliyor.</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <div className="text-lg font-semibold text-yellow-400">Bildirimler</div>
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            {events.length === 0 ? (
              <div className="text-gray-500">Son olay yok.</div>
            ) : (
              events.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>🔔</span>
                  <span>{e.text}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
        <div className="text-lg font-semibold text-yellow-400 mb-3">Canlı Rezervasyon Akışı</div>
        {feed.length === 0 && <div className="text-sm text-yellow-200">Şu an bekleyen rezervasyon yok.</div>}
        <div className="space-y-3">
          {feed.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-yellow-500/20">
              <div>
                <div className="text-yellow-300 text-sm">{r.guest_name || "Yolcu"}</div>
                <div className="text-yellow-100 text-xs">{r.pickup_location} → {r.dropoff_location}</div>
                <div className="text-yellow-500 text-xs">{new Date(r.pickup_time || r.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => accept(r.id)} className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">Kabul Et</button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}