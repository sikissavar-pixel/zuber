"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import api from "@/lib/api";
import type { Reservation } from "@/hooks/useReservations";
import { GlassCard, ParticleBackground, GradientText, PulsingDot } from "@/components/driver/ui";
import { PremiumStatCard, QuickActionCard } from "@/components/driver/cards";
import { LiveFeedCard, LiveFeedHeader, EmptyFeedState } from "@/components/driver/live-feed";
import { useMyDriverLocation } from "@/hooks/useDriverLocation";
import { useRouteEstimate } from "@/hooks/useRouteEstimate";
import dynamic from "next/dynamic";
import { RouteInsightPanel } from "@/components/driver/maps";
import type { DriverMarker, CustomerMarker } from "@/components/maps/ZuberMap";

const DynamicZuberMap = dynamic(
  () => import("@/components/maps").then((mod) => mod.ZuberMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 rounded-3xl border border-[#1c1c1c] bg-[#050505] flex items-center justify-center text-sm text-[#888]">
        Harita yükleniyor...
      </div>
    ),
  }
);

type NotificationEntry = {
  id: string;
  title: string;
  message: string;
  time: string;
  status?: "success" | "warning" | "info";
};

type DriverEarningsResponse = {
  total: number;
  monthly: { month: string; amount: number }[];
};

type LiveFeedReservation = Reservation & { base_price?: number | string };

const relativeFormatter = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });

function formatRelativeTime(value?: string) {
  if (!value) return "—";
  const target = new Date(value);
  const now = Date.now();
  const diff = target.getTime() - now;
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (abs < minute) return "az önce";
  if (abs < hour) {
    const minutes = Math.round(diff / minute);
    return relativeFormatter.format(minutes, "minute");
  }
  if (abs < day) {
    const hours = Math.round(diff / hour);
    return relativeFormatter.format(hours, "hour");
  }
  const days = Math.round(diff / day);
  return relativeFormatter.format(days, "day");
}

function sumAmounts(reservations: Reservation[], predicate: (r: Reservation) => boolean) {
  return reservations.reduce((total, reservation) => {
    if (!predicate(reservation)) return total;
    const numeric = Number(reservation.total_amount);
    return total + (isNaN(numeric) ? 0 : numeric);
  }, 0);
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const name = user?.full_name || "Sürücü";
  const queryClient = useQueryClient();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { data: reservationsData = [], isLoading: isLoadingReservations } = useQuery<Reservation[]>({
    queryKey: ["driver", "dashboard", "reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/reservations");
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const { data: earningsData } = useQuery<DriverEarningsResponse>({
    queryKey: ["driver", "dashboard", "earnings"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/earnings");
      return data;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const { data: openReservationsData } = useQuery<LiveFeedReservation[]>({
    queryKey: ["driver", "dashboard", "feed"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/open-reservations");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const [liveFeed, setLiveFeed] = useState<LiveFeedReservation[]>([]);
  const [mapMetrics, setMapMetrics] = useState<{ distanceKm: number; durationMinutes: number } | null>(null);
  const { data: driverLocation } = useMyDriverLocation(user?.role === "driver");
  const [fallbackLocation, setFallbackLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || driverLocation || fallbackLocation) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFallbackLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 2000,
      }
    );
  }, [driverLocation, fallbackLocation]);

  const normalizedDriverLocation = useMemo(() => {
    if (driverLocation) return driverLocation;
    if (fallbackLocation) {
      return {
        driver_id: user?.id || 0,
        latitude: fallbackLocation.latitude,
        longitude: fallbackLocation.longitude,
        heading: null,
        speed: null,
        accuracy: null,
        updated_at: new Date().toISOString(),
      };
    }
    return null;
  }, [driverLocation, fallbackLocation, user?.id]);

  const driverMarkers = useMemo<DriverMarker[]>(
    () => {
      if (!normalizedDriverLocation) return [];
      return [
        {
          id: normalizedDriverLocation.driver_id || user?.id || "driver",
          lat: normalizedDriverLocation.latitude,
          lng: normalizedDriverLocation.longitude,
          heading: normalizedDriverLocation.heading ?? undefined,
          status: driverLocation ? "Sürücü konumu" : "Cihaz konumu",
        },
      ];
    },
    [normalizedDriverLocation, driverLocation, user?.id]
  );

  useEffect(() => {
    if (openReservationsData) {
      setLiveFeed(openReservationsData);
    }
  }, [openReservationsData]);

  useEffect(() => {
    const socket = getSocket();
    const onCreated = (payload: any) => {
      if (!payload || payload.driver_id) return;
      const status = payload.status || "pending";
      if (!["pending", "open_bid"].includes(status)) return;
      setLiveFeed((prev) => {
        if (prev.some((item) => item.id === payload.id)) return prev;
        const next: LiveFeedReservation = {
          ...payload,
        };
        return [next, ...prev].slice(0, 20);
      });
    };
    const onCancelled = (payload: any) => {
      if (!payload?.id) return;
      setLiveFeed((prev) => prev.filter((item) => item.id !== Number(payload.id)));
    };
    const onAccepted = (payload: any) => {
      if (!payload?.id) return;
      setLiveFeed((prev) => prev.filter((item) => item.id !== Number(payload.id)));
      queryClient.invalidateQueries({ queryKey: ["driver", "dashboard", "reservations"] }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["driver", "dashboard", "feed"] }).catch(() => {});
    };

    socket.on("reservation_created", onCreated);
    socket.on("reservation:new", onCreated);
    socket.on("reservation_assigned", onAccepted);
    socket.on("reservation:accepted", onAccepted);
    socket.on("reservation_cancelled", onCancelled);
    socket.on("reservation:cancel", onCancelled);
    return () => {
      socket.off("reservation_created", onCreated);
      socket.off("reservation:new", onCreated);
      socket.off("reservation_assigned", onAccepted);
      socket.off("reservation:accepted", onAccepted);
      socket.off("reservation_cancelled", onCancelled);
      socket.off("reservation:cancel", onCancelled);
    };
  }, [queryClient]);

  useEffect(() => {
    const socket = getSocket();
    const handleLocation = (payload: any) => {
      const driverId = Number(payload?.driverId ?? payload?.driver_id);
      if (!driverId || driverId !== Number(user?.id)) return;
      const normalized = {
        driver_id: driverId,
        latitude: Number(payload?.lat ?? payload?.latitude),
        longitude: Number(payload?.lng ?? payload?.longitude),
        heading: payload?.heading ?? null,
        speed: payload?.speed ?? null,
        accuracy: payload?.accuracy ?? null,
        updated_at: payload?.updatedAt ?? payload?.updated_at ?? new Date().toISOString(),
      };
      queryClient.setQueryData(["driver", "location", "me"], normalized);
    };
    socket.on("driver_location_update", handleLocation);
    socket.on("driver:location:update", handleLocation);
    return () => {
      socket.off("driver_location_update", handleLocation);
      socket.off("driver:location:update", handleLocation);
    };
  }, [queryClient, user?.id]);

  const todaysEarnings = useMemo(
    () =>
      sumAmounts(reservationsData, (reservation) => {
        if (reservation.status !== "completed" && reservation.status !== "in_progress") return false;
        const date = new Date(reservation.pickup_time || reservation.created_at);
        const now = new Date();
        return (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }),
    [reservationsData]
  );

  const pendingPayments = useMemo(
    () => reservationsData.filter((reservation) => reservation.payment_status !== "paid").length,
    [reservationsData]
  );

  const awaitingQr = useMemo(
    () => reservationsData.filter((reservation) => reservation.status === "in_progress").length,
    [reservationsData]
  );

  const completedToday = useMemo(
    () =>
      reservationsData.filter((reservation) => {
        if (reservation.status !== "completed") return false;
        const pickup = new Date(reservation.pickup_time || reservation.created_at);
        const now = new Date();
        return pickup.toDateString() === now.toDateString();
      }).length,
    [reservationsData]
  );

  const upcomingReservations = useMemo(
    () =>
      [...reservationsData]
        .filter((reservation) => ["assigned", "in_progress"].includes(reservation.status))
        .sort(
          (a, b) =>
            new Date(a.pickup_time || a.created_at).getTime() - new Date(b.pickup_time || b.created_at).getTime()
        ),
    [reservationsData]
  );

  const activeReservation = upcomingReservations[0];
  const originWaypoint = useMemo(
    () => (activeReservation?.pickup_location ? { address: activeReservation.pickup_location } : undefined),
    [activeReservation?.pickup_location]
  );
  const destinationWaypoint = useMemo(
    () => (activeReservation?.dropoff_location ? { address: activeReservation.dropoff_location } : undefined),
    [activeReservation?.dropoff_location]
  );
  const { data: routeEstimate, isLoading: isRouteLoading } = useRouteEstimate(
    originWaypoint,
    destinationWaypoint,
    Boolean(originWaypoint && destinationWaypoint)
  );

  const notificationEntries = useMemo<NotificationEntry[]>(() => {
    if (!reservationsData.length) return [];
    return [...reservationsData]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.pickup_time).getTime() - new Date(a.created_at || a.pickup_time).getTime()
      )
      .slice(0, 4)
      .map((reservation) => ({
        id: `reservation-${reservation.id}`,
        title:
          reservation.status === "completed"
            ? "Sürüş tamamlandı"
            : reservation.status === "in_progress"
            ? "Sürüş devam ediyor"
            : "Yeni rezervasyon",
        message: `${reservation.pickup_location} → ${reservation.dropoff_location}`,
        time: formatRelativeTime(reservation.pickup_time || reservation.created_at),
        status:
          reservation.status === "completed"
            ? "success"
            : reservation.status === "in_progress"
            ? "info"
            : "warning",
      }));
  }, [reservationsData]);

  const mapCustomers = useMemo<CustomerMarker[]>(() => {
    const pool: Record<number | string, { id: number | string; pickup: string; status?: string; color?: string }> = {};
    liveFeed.forEach((reservation) => {
      if (!reservation.pickup_location) return;
      pool[reservation.id] = {
        id: reservation.id,
        pickup: reservation.pickup_location,
        status: reservation.status,
        color: "#facc15",
      };
    });
    upcomingReservations.forEach((reservation) => {
      if (!reservation.pickup_location) return;
      pool[reservation.id] = {
        id: reservation.id,
        pickup: reservation.pickup_location,
        status: reservation.status,
        color: reservation.status === "in_progress" ? "#ffb74d" : "#ffd54f",
      };
    });
    return Object.values(pool) as CustomerMarker[];
  }, [liveFeed, upcomingReservations]);

  const quickActions = useMemo(
    () => [
      {
        icon: CalendarDays,
        title: "Aktif Rezervasyonlar",
        description: "Atanmış tüm sürüşler",
        href: "/driver/reservations",
        badge: upcomingReservations.length || undefined,
      },
      {
        icon: QrCode,
        title: "QR Onay / Sürüş Bitişi",
        description: "QR doğrulama bekleyenler",
        href: "/driver/qr-verification",
        badge: awaitingQr || undefined,
      },
      {
        icon: Star,
        title: "Yorumlarım",
        description: "Sürüş sonrası geri bildirim",
        href: "/driver/feedback",
      },
    ],
    [awaitingQr, upcomingReservations.length]
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
    <GlassCard variant="default" glowIntensity="subtle" className="p-6 min-h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#ffcc33]" />
          <p className="font-cinzel text-lg">Bildirimler</p>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-[#777]">canlı</span>
      </div>
      {notificationEntries.length === 0 ? (
        <EmptyState message="Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz." />
      ) : (
        <div className="space-y-3">
          {notificationEntries.map((note) => (
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
              {note.status === "success" && (
                <span className="absolute -left-2 top-1 h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );

  const liveFeedItems = liveFeed;
  const handleAccept = useCallback(() => router.push("/driver/open-reservations"), [router]);

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
          <ActiveReservationCard reservation={activeReservation} isLoading={isLoadingReservations} />
          <PremiumStatCard
            icon={Wallet}
            title="Günlük Kazanç"
            numericValue={todaysEarnings}
            suffix="₺"
            trend={todaysEarnings > 0 ? "up" : "neutral"}
            trendValue={todaysEarnings > 0 ? "%+5" : "%0"}
            variant="success"
            delay={1}
          />
          <PremiumStatCard
            icon={Clock}
            title="Bekleyen Ödeme"
            value={`${pendingPayments} adet`}
            subtext={
              pendingPayments
                ? `QR onayı bekleyen ${awaitingQr || 0} sürüş`
                : "Tüm ödemeler kapatıldı"
            }
            variant="warning"
            delay={2}
          />
          <PremiumStatCard
            icon={Bell}
            title="Güncel Hareket"
            value={`${completedToday} tamamlandı`}
            subtext={`Son 24 saatte ${notificationEntries.length || 0} güncelleme`}
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
            <span className="text-xs text-[#777]">Tüm kritik rota ve işlemler</span>
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

        <GlassCard variant="default" glowIntensity="subtle" className="p-5">
          {googleMapsApiKey ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
              <div className="relative">
                <DynamicZuberMap
                  route={
                    activeReservation?.pickup_location && activeReservation?.dropoff_location
                      ? {
                          origin: activeReservation.pickup_location,
                          destination: activeReservation.dropoff_location,
                        }
                      : undefined
                  }
                  drivers={driverMarkers}
                  customers={mapCustomers}
                  onRouteMetrics={setMapMetrics}
                  height={360}
                />
                {!driverMarkers.length && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-[#cfcfcf] bg-black/30 backdrop-blur-sm rounded-3xl">
                    Sürücü konumu bekleniyor...
                  </div>
                )}
              </div>
              <RouteInsightPanel
                route={routeEstimate}
                driverLocation={normalizedDriverLocation}
                isLoading={isRouteLoading}
                liveMetrics={mapMetrics || undefined}
              />
            </div>
          ) : (
            <EmptyState message="Google Maps API anahtarı tanımlı değil. Lütfen NEXT_PUBLIC_GOOGLE_MAPS_API_KEY değişkenini tanımlayın." />
          )}
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderNotifications()}
          <GlassCard variant="premium" className="lg:col-span-2">
            <LiveFeedHeader count={liveFeedItems.length} />
            {liveFeedItems.length === 0 ? (
              <div className="space-y-4">
                <EmptyFeedState />
                <EmptyState message="Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz." />
              </div>
            ) : (
              <div className="overflow-x-auto pb-3 -mx-2 px-2">
                <div className="flex gap-4 snap-x snap-mandatory">
                  {liveFeedItems.map((reservation, index) => (
                    <LiveFeedCard
                      key={`${reservation.id}-${index}`}
                      reservation={reservation}
                      onAccept={handleAccept}
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

function ActiveReservationCard({ reservation, isLoading }: { reservation?: Reservation; isLoading: boolean }) {
  if (isLoading) {
    return (
      <GlassCard variant="premium" glowIntensity="strong" className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/20 rounded w-2/3" />
          <div className="h-6 bg-white/15 rounded" />
          <div className="h-6 bg-white/15 rounded" />
          <div className="h-5 bg-white/10 rounded" />
        </div>
      </GlassCard>
    );
  }

  if (!reservation) {
    return (
      <GlassCard variant="premium" glowIntensity="strong" className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-5 h-5 text-[#050301]" />
          <p className="text-sm uppercase tracking-[0.4em] text-[#050301]">aktif rezervasyon</p>
        </div>
        <EmptyState message="Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz." dark />
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="premium" glowIntensity="strong" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-[#050301]" />
          <p className="text-sm uppercase tracking-[0.4em] text-[#050301]">aktif rezervasyon</p>
        </div>
        <span className="text-xs text-[#555]">
          {new Date(reservation.pickup_time || reservation.created_at || Date.now()).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
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
          <span>{reservation.guest_name || "VIP misafir"}</span>
          <span className="font-semibold text-[#ff8c00]">
            {reservation.status === "in_progress" ? "Sürüşte" : reservation.status === "assigned" ? "Hazır" : "Takipte"}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function EmptyState({ message, dark = false }: { message: string; dark?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-dashed ${dark ? "border-[#050301]/30 bg-white/40 text-[#050301]" : "border-[#ffcc33]/30 bg-[#050505]/60 text-[#c9c9c9]"} px-4 py-6 text-sm text-center`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
