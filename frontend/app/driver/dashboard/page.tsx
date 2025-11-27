"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  Car,
  Wallet,
  Clock,
  Bell,
  CalendarDays,
  QrCode,
  Star,
  ArrowRight,
  Hotel,
  MapPin,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import type { Reservation } from "@/hooks/useReservations";
import { GlassCard, ParticleBackground, GradientText, PulsingDot } from "@/components/driver/ui";
import { PremiumStatCard, QuickActionCard } from "@/components/driver/cards";
import { LiveFeedCard, LiveFeedHeader, EmptyFeedState } from "@/components/driver/live-feed";

const PLACEHOLDER_RESERVATION: Reservation = {
  id: 0,
  guest_name: "VIP Misafir",
  pickup_location: "Bosphorus Palace Hotel",
  dropoff_location: "IST Havalimanı",
  pickup_time: new Date().toISOString(),
  status: "pending",
};

const PLACEHOLDER_FEED: Reservation[] = Array.from({ length: 4 }).map((_, i) => ({
  ...PLACEHOLDER_RESERVATION,
  id: i + 1,
  pickup_location: i % 2 ? "Çırağan Palace" : "Swissôtel",
  dropoff_location: i % 2 ? "SAW Havalimanı" : "IST Havalimanı",
  pickup_time: new Date(Date.now() + i * 3_600_000).toISOString(),
}));

type NotificationEntry = {
  id: string;
  title: string;
  message: string;
  time: string;
  status?: "success" | "warning" | "info";
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const name = user?.full_name || "Sürücü";
  const [feed, setFeed] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({
    dailyEarnings: 2300,
    pendingPayments: 1,
    notifications: 2,
  });
  const [notifications, setNotifications] = useState<NotificationEntry[]>([
    {
      id: "n1",
      title: "Yeni VIP Transfer",
      message: "The Peninsula → IST, 15 dakika içinde hazır olun",
      time: "2 dk önce",
      status: "info",
    },
    {
      id: "n2",
      title: "Ödeme Onayı",
      message: "QR doğrulama bekleyen sürüşünüz var",
      time: "1 saat önce",
      status: "warning",
    },
  ]);

  useEffect(() => {
    const socket = getSocket();

    const onCreated = (payload: any) => {
      if (!payload) return;
      if (payload.status === "pending" && !payload.driver_id) {
        setFeed((prev) => {
          const exists = prev.some((r) => r.id === payload.id);
          const next = exists
            ? prev
            : [
                {
                  ...PLACEHOLDER_RESERVATION,
                  ...payload,
                },
                ...prev,
              ];
          return next.slice(0, 10);
        });
        setNotifications((prev) => [
          {
            id: `socket-${payload.id}`,
            title: "Yeni rezervasyon",
            message: `${payload.pickup_location} → ${payload.dropoff_location}`,
            time: "Şimdi",
            status: "info",
          },
          ...prev,
        ].slice(0, 4));
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

  const activeReservation = useMemo(() => feed[0] ?? PLACEHOLDER_RESERVATION, [feed]);
  const liveFeedItems = feed.length ? feed : PLACEHOLDER_FEED;

  const quickActions = useMemo(
    () => [
      { icon: CalendarDays, title: "Aktif Rezervasyonlar", href: "/driver/reservations", badge: feed.length || undefined },
      { icon: QrCode, title: "QR Onay / Sürüş Bitişi", href: "/driver/qr-verification" },
      { icon: Star, title: "Yorumlarım", href: "/driver/feedback", badge: 4.8 },
    ],
    [feed.length]
  );

  const renderGreeting = () => {
    const [first, ...rest] = name.split(" ");
    const last = rest.join(" ");
    return (
      <h1 className="font-cinzel text-4xl md:text-6xl lg:text-7xl">
        <span className="text-[#f5f5f5]">Hoş geldin, </span>
        <GradientText variant="premium" className="font-bold">
          {first}
        </GradientText>
        {last && (
          <span className="text-[#ffcc33] ml-2 drop-shadow-[0_0_20px_rgba(255,204,51,0.3)]">{last}</span>
        )}
      </h1>
    );
  };

  const renderNotifications = () => (
    <GlassCard variant="default" glowIntensity="subtle" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#ffcc33]" />
          <p className="font-cinzel text-lg">Bildirimler</p>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-[#777]">canlı</span>
      </div>
      <div className="space-y-3">
        {notifications.slice(0, 2).map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-2xl border border-[#ffcc33]/25 bg-[#050505]/80 px-4 py-3"
          >
            <div className="flex items-center justify-between text-sm">
              <p className="text-[#f5f5f5] font-semibold">{note.title}</p>
              <span className="text-xs text-[#888]">{note.time}</span>
            </div>
            <p className="text-xs text-[#bcbcbc] mt-1">{note.message}</p>
            {note.status === "warning" && (
              <span className="absolute -left-2 top-1 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            {note.status === "info" && (
              <span className="absolute -left-2 top-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white font-inter relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <ParticleBackground particleCount={50} speed={0.25} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffb4000d,transparent_55%)]" />
      </div>
      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 py-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#ffb400]/30 bg-[#ffb400]/10 shadow-[0_0_25px_rgba(255,180,0,0.25)]"
          >
            <PulsingDot color="gold" size="sm" />
            <span className="text-xs font-semibold tracking-[0.4em] text-[#ffb400] uppercase">Premium Driver</span>
          </motion.div>
          {renderGreeting()}
          <p className="text-sm uppercase tracking-[0.4em] text-[#777]">Zuber Control Room — İstanbul Edition</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <ActiveReservationCard reservation={activeReservation} />
          <PremiumStatCard
            icon={Wallet}
            title="Günlük Kazanç"
            numericValue={stats.dailyEarnings}
            suffix="₺"
            trend="up"
            trendValue="%12"
            variant="success"
            delay={1}
          />
          <PremiumStatCard
            icon={Clock}
            title="Bekleyen Ödeme"
            subtext={`QR onayı bekleyen ${stats.pendingPayments} işlem`}
            variant="warning"
            delay={2}
          />
          <PremiumStatCard
            icon={Bell}
            title="Bildirimler"
            subtext={`Son 24 saatte ${stats.notifications} uyarı`}
            variant="default"
            delay={3}
          />
        </div>

        <GlassCard variant="default" glowIntensity="subtle" className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[#ffcc33]" />
              <h3 className="font-cinzel text-lg">Hızlı Erişim</h3>
            </div>
            <span className="text-xs text-[#777]">her güncellemede anında erişim</span>
          </div>
          <div className="overflow-x-auto -mx-2 px-2 pb-2">
            <div className="flex gap-3 min-w-max">
              {quickActions.map((action, i) => (
                <QuickActionCard
                  key={action.href}
                  {...action}
                  delay={i}
                  badgeColor={action.title === "Yorumlarım" ? "green" : "gold"}
                />
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderNotifications()}
          <GlassCard variant="premium" className="lg:col-span-2">
            <LiveFeedHeader count={liveFeedItems.length} />
            {liveFeedItems.length === 0 ? (
              <EmptyFeedState />
            ) : (
              <div className="overflow-x-auto pb-3 -mx-2 px-2">
                <div className="flex gap-4 snap-x snap-mandatory">
                  {liveFeedItems.map((reservation, index) => (
                    <LiveFeedCard
                      key={`${reservation.id}-${index}`}
                      reservation={reservation}
                      onAccept={() => {}}
                      index={index}
                      variant="carousel"
                    />
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function ActiveReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <GlassCard variant="premium" glowIntensity="strong" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-[#050301]" />
          <p className="text-sm uppercase tracking-[0.4em] text-[#050301]">aktif rezervasyon</p>
        </div>
        <span className="text-xs text-[#555]">{new Date(reservation.pickup_time || reservation.created_at || Date.now()).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#050301] font-semibold text-lg">
          <Hotel className="w-4 h-4" />
          <span>{reservation.pickup_location || "Bekleyen rezervasyon"}</span>
        </div>
        <div className="flex items-center gap-2 text-[#050301]/80">
          <MapPin className="w-4 h-4" />
          <span>{reservation.dropoff_location || "Varış bekleniyor"}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-[#4a3b13] border-t border-[#ffcc33]/30 pt-3">
          <span>VIP misafir</span>
          <span className="font-semibold text-[#ff8c00]">Hazır</span>
        </div>
      </div>
    </GlassCard>
  );
}
