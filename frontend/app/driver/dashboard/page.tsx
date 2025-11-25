"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Car, Wallet, Clock, Bell, Inbox } from "lucide-react";
import { getSocket } from "@/lib/socket";
import type { Reservation } from "@/hooks/useReservations";
import { DASHBOARD_THEME as THEME } from "@/components/dashboard/theme";
import { InfoCard } from "@/components/dashboard/InfoCard";

const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    <div className="bg-[#ffb400]/5 p-6 rounded-full mb-4 border border-[#ffb400]/20 shadow-[0_0_30px_rgba(255,180,0,0.1)]">
      <Inbox className="w-12 h-12 text-[#ffb400]/60" />
    </div>
    <h3 className={`${THEME.fontHead} text-xl ${THEME.gold} mb-2`}>Bekleyen Rezervasyon Yok</h3>
    <p className={`${THEME.fontBody} ${THEME.textSecondary} max-w-xs`}>
      Şu an için bölgenizde yeni bir talep bulunmuyor. Yeni rezervasyonlar burada görünecek.
    </p>
  </motion.div>
);

const ReservationCard = ({ r, onAccept }: { r: Reservation, onAccept: (id: number) => void }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`${THEME.cardBg} border border-[#ffb400]/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-[#ffb400]/50 transition-all`}
  >
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#ffb400]/20 text-[#ffb400]">YENİ</span>
        <span className={`${THEME.fontHead} ${THEME.textMain} text-lg`}>{r.guest_name || "Misafir"}</span>
      </div>
      <div className="space-y-1">
        <div className={`flex items-center gap-2 text-sm ${THEME.textSecondary}`}>
          <div className="w-2 h-2 rounded-full bg-[#ffb400]" />
          <span className={THEME.textMain}>{r.pickup_location}</span>
        </div>
        <div className="pl-1 ml-px border-l border-[#333] h-3" />
        <div className={`flex items-center gap-2 text-sm ${THEME.textSecondary}`}>
          <div className="w-2 h-2 rounded-full border border-[#ffb400]" />
          <span className={THEME.textMain}>{r.dropoff_location}</span>
        </div>
      </div>
      <div className={`text-xs ${THEME.textSecondary} mt-2 flex items-center gap-1`}>
        <Clock className="w-3 h-3" />
        {new Date(r.pickup_time || r.created_at).toLocaleString("tr-TR")}
      </div>
    </div>
    <button 
      onClick={() => onAccept(r.id)}
      className="bg-[#ffb400] hover:bg-[#ffcc33] text-black font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(255,180,0,0.3)] hover:shadow-[0_0_25px_rgba(255,180,0,0.5)] transition-all transform hover:scale-105 active:scale-95"
    >
      Kabul Et
    </button>
  </motion.div>
);

// --- Main Page ---

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
          return exists ? prev : [
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
    <div className={`min-h-screen ${THEME.bg} text-white pt-20 pb-12 flex justify-center font-inter`}>
      <div className="container max-w-4xl space-y-8">
        
        {/* 1. Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 py-8"
        >
          <h1 className={`${THEME.fontHead} text-3xl md:text-5xl ${THEME.gold}`}>
            Hoş geldin, {name}
          </h1>
          <p className={`${THEME.fontBody} ${THEME.textSecondary} text-sm uppercase tracking-widest`}>
            Zuber Control Room — İstanbul Edition
          </p>
        </motion.div>

        {/* 2. Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard 
            icon={Car} 
            title="Aktif Rezervasyon" 
            subtext="Grand Hotel → IST Airport, 17:30" 
          />
          <InfoCard 
            icon={Wallet} 
            title="Günlük Kazanç" 
            value="2.300₺" 
          />
          <InfoCard 
            icon={Clock} 
            title="Bekleyen Ödeme" 
            subtext="QR onayı bekleniyor (1)" 
          />
          <InfoCard 
            icon={Bell} 
            title="Bildirimler" 
            subtext="Yeni partner ataması (2)" 
          />
        </div>

        {/* 3. Live Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
             <div className="h-px bg-gradient-to-r from-transparent via-[#ffb400]/50 to-transparent w-24" />
             <h2 className={`${THEME.fontHead} text-xl md:text-2xl ${THEME.textMain}`}>Canlı Rezervasyon Akışı</h2>
             <div className="h-px bg-gradient-to-r from-transparent via-[#ffb400]/50 to-transparent w-24" />
          </div>

          <div className="min-h-[200px]">
            {feed.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {feed.map((r) => (
                  <ReservationCard key={r.id} r={r} onAccept={accept} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}