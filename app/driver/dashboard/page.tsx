"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Car, Wallet, Clock, Bell } from "lucide-react";
import { getSocket } from "@/lib/socket";
import type { Reservation } from "@/hooks/useReservations";

const card = "bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 hover:shadow-[0_0_20px_#facc15]/30 transition-transform hover:scale-[1.02]";

export default function DriverDashboard() {
  const { user } = useAuth();
  const name = user?.full_name || "Sürücü";
  const [feed, setFeed] = useState<Reservation[]>([]);

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
    return () => {
      socket.off("reservation_created", onCreated);
      socket.off("reservation_assigned", onAssigned);
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
          <div className="text-sm text-gray-400">Grand Hotel → IST Airport, 17:30</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-400" />
            <div className="text-lg font-semibold text-yellow-400">Günlük Kazanç</div>
          </div>
          <div className="text-2xl">2.300₺</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div className="text-lg font-semibold text-yellow-400">Bekleyen Ödeme</div>
          </div>
          <div className="text-sm text-gray-400">QR onayı bekleniyor (1)</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={card}>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <div className="text-lg font-semibold text-yellow-400">Bildirimler</div>
          </div>
          <div className="text-sm text-gray-400">Yeni partner ataması (2)</div>
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