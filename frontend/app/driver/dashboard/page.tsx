"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Car, Wallet, Clock, Bell, CalendarDays, QrCode, Star, ArrowRight } from "lucide-react";
import { getSocket } from "@/lib/socket";
import type { Reservation } from "@/hooks/useReservations";

// Premium UI Components
import { GlassCard, ParticleBackground, GradientText, PulsingDot } from "@/components/driver/ui";
import { PremiumStatCard, QuickActionCard } from "@/components/driver/cards";
import { LiveFeedCard, LiveFeedHeader, EmptyFeedState } from "@/components/driver/live-feed";

// --- Main Page ---

export default function DriverDashboard() {
  const { user } = useAuth();
  const name = user?.full_name || "Sürücü";
  const [feed, setFeed] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({
    dailyEarnings: 2300,
    pendingPayments: 1,
    notifications: 2,
  });

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

  const quickActions = useMemo(() => [
    { icon: CalendarDays, title: "Aktif Rezervasyonlar", href: "/driver/reservations", badge: feed.length || undefined },
    { icon: QrCode, title: "QR Onay / Sürüş Bitişi", href: "/driver/qr-verification" },
    { icon: Star, title: "Yorumlarım", href: "/driver/feedback", badge: 4.8 },
  ], [feed.length]);

  return (
    <div className="min-h-screen bg-[#000] text-white font-inter relative overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none">
        <ParticleBackground particleCount={40} speed={0.2} />
      </div>

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffb400]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ffb400]/3 rounded-full blur-[150px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8 space-y-10">
        
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-4 py-8 relative"
        >
          {/* Premium badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffb400]/10 border border-[#ffb400]/20 mb-4"
          >
            <PulsingDot color="gold" size="sm" />
            <span className="text-xs font-medium text-[#ffb400] uppercase tracking-widest">Premium Driver</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="font-cinzel text-4xl md:text-6xl lg:text-7xl">
            <span className="text-[#f5f5f5]">Hoş geldin, </span>
            <GradientText variant="premium" className="font-bold">
              {name}
            </GradientText>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-inter text-[#666] text-sm md:text-base uppercase tracking-[0.3em]"
          >
            Zuber Control Room — İstanbul Edition
          </motion.p>

          {/* Decorative lines */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent to-[#ffb400]/50"
            />
            <div className="w-2 h-2 rotate-45 bg-[#ffb400]/30" />
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-px bg-gradient-to-l from-transparent to-[#ffb400]/50"
            />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumStatCard
            icon={Car}
            title="Aktif Rezervasyon"
            subtext="Grand Hotel → IST Airport, 17:30"
            variant="premium"
            delay={0}
          />
          <PremiumStatCard
            icon={Wallet}
            title="Günlük Kazanç"
            numericValue={stats.dailyEarnings}
            suffix="₺"
            trend="up"
            trendValue="+12%"
            variant="success"
            delay={1}
          />
          <PremiumStatCard
            icon={Clock}
            title="Bekleyen Ödeme"
            subtext={`QR onayı bekleniyor (${stats.pendingPayments})`}
            variant="warning"
            delay={2}
          />
          <PremiumStatCard
            icon={Bell}
            title="Bildirimler"
            subtext={`Yeni partner ataması (${stats.notifications})`}
            variant="default"
            delay={3}
          />
        </div>

        {/* Quick Actions */}
        <GlassCard variant="default" glowIntensity="subtle" hoverEffect={false} className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ffb400] to-[#ffb400]/30 rounded-full" />
            <h3 className="font-cinzel text-lg text-[#f5f5f5]">Hızlı Erişim</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <QuickActionCard
                key={action.href}
                {...action}
                delay={i}
                badgeColor={action.title === "Yorumlarım" ? "green" : "gold"}
              />
            ))}
          </div>
        </GlassCard>

        {/* Live Feed Section */}
        <div className="space-y-6">
          <LiveFeedHeader count={feed.length} />

          <div className="min-h-[300px] space-y-4">
            <AnimatePresence mode="popLayout">
              {feed.length === 0 ? (
                <EmptyFeedState />
              ) : (
                feed.map((r, index) => (
                  <LiveFeedCard
                    key={r.id}
                    reservation={r}
                    onAccept={accept}
                    index={index}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
