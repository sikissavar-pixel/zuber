"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QrCode, ShieldCheck, Clock } from "lucide-react";
import api from "@/lib/api";
import type { Reservation } from "@/hooks/useReservations";
import { GlassCard } from "@/components/driver/ui";

export default function DriverQRVerification() {
  const router = useRouter();
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ["driver", "qr", "reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/reservations");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
  });

  const awaitingVerification = useMemo(
    () =>
      reservations.filter((reservation) =>
        ["in_progress", "assigned"].includes(reservation.status) && reservation.payment_status !== "paid"
      ),
    [reservations]
  );

  const handleVerify = async (reservationId: number) => {
    setVerifyingId(reservationId);
    try {
      await api.post("/api/driver/qr/verify", { reservation_id: reservationId });
      toast.success("Sürüş tamamlandı, yolcu QR kodunu doğruladı.");
      router.push(`/driver/feedback?open=1&reservation_id=${reservationId}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Doğrulama başarısız");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard variant="premium" className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#050505] border border-[#ffcc33]/40">
            <QrCode className="w-6 h-6 text-[#050301]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]">QR doğrulama</p>
            <h1 className="font-cinzel text-2xl text-[#050301]">Lüks transfer güvenliği</h1>
            <p className="text-xs text-[#4a3b13] mt-1">
              Yolcu QR kodunu okutun veya manuel onay ile sürüşü kapatın.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-[#4a3b13]">
          <div className="rounded-2xl bg-white/50 px-4 py-3 border border-white/40">
            <p className="uppercase tracking-[0.3em] text-xs">Aktif sürüş</p>
            <strong className="text-lg text-[#050301]">{awaitingVerification.length}</strong>
          </div>
          <div className="rounded-2xl bg-white/40 px-4 py-3 border border-white/35">
            <p className="uppercase tracking-[0.3em] text-xs">Bekleyen ödeme</p>
            <strong className="text-lg text-[#050301]">
              ₺
              {awaitingVerification
                .reduce((sum, reservation) => sum + (Number(reservation.total_amount) || 0), 0)
                .toLocaleString("tr-TR")}
            </strong>
          </div>
          <div className="rounded-2xl bg-white/30 px-4 py-3 border border-white/25 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#050301]" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em]">24/7</p>
              <strong className="text-sm text-[#050301]">Güvenlik kontrolü aktif</strong>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-cinzel text-lg text-white">Doğrulanmayı bekleyen sürüşler</p>
          <span className="flex items-center gap-2 text-xs text-[#888]">
            <Clock className="w-4 h-4" /> {isLoading ? "Yükleniyor..." : "Canlı"}
          </span>
        </div>
        {isLoading ? (
          <EmptyState message="Sürüş listesi yükleniyor..." />
        ) : awaitingVerification.length === 0 ? (
          <EmptyState message="Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz." />
        ) : (
          <div className="grid gap-4">
            {awaitingVerification.map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-2xl border border-[#ffcc33]/20 bg-[#0b0b0b]/80 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#888]">#{reservation.id}</p>
                    <h3 className="text-lg font-semibold text-white">
                      {reservation.pickup_location} → {reservation.dropoff_location}
                    </h3>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#ffcc33]">
                    {reservation.status === "in_progress" ? "SÜRÜŞTE" : "ATANDI"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#cfcfcf]">
                  <span>Yolcu: {reservation.guest_name || "VIP"}</span>
                  <span>
                    Tarih: {new Date(reservation.pickup_time || reservation.created_at).toLocaleString("tr-TR")}
                  </span>
                  <span className="text-[#ffcc33] font-semibold">
                    ₺{Number(reservation.total_amount || 0).toLocaleString("tr-TR")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={verifyingId === reservation.id}
                    onClick={() => handleVerify(reservation.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb400] to-[#ffcc33] text-black font-semibold disabled:opacity-50"
                  >
                    {verifyingId === reservation.id ? "Doğrulanıyor..." : "QR Kod Okut"}
                  </button>
                  <button
                    disabled={verifyingId === reservation.id}
                    onClick={() => handleVerify(reservation.id)}
                    className="px-4 py-2 rounded-xl border border-[#ffcc33]/30 text-[#ffcc33] hover:bg-[#ffcc33]/10 disabled:opacity-50"
                  >
                    Manuel Onay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-[#ffcc33]/20 bg-[#050505]/70 px-4 py-6 text-sm text-center text-[#bcbcbc]"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}