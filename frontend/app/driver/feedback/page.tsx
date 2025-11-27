"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Reservation } from "@/hooks/useReservations";
import { GlassCard, GradientText } from "@/components/driver/ui";

type FeedbackRecord = {
  id: string;
  reservationId: number;
  passenger: string;
  stars: number;
  comment: string;
  createdAt: string;
};

export default function DriverFeedbackPage() {
  const params = useSearchParams();
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null);
  const reservationFromQuery = Number(params.get("reservation_id"));

  const { data: reservations = [] } = useQuery<Reservation[]>({
    queryKey: ["driver", "feedback", "reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/reservations");
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (params.get("open") === "1") {
      setModalOpen(true);
      if (reservationFromQuery) {
        setSelectedReservation(reservationFromQuery);
      }
    }
  }, [params, reservationFromQuery]);

  const completedReservations = useMemo(
    () =>
      reservations.filter((reservation) => reservation.status === "completed").sort(
        (a, b) =>
          new Date(b.pickup_time || b.created_at).getTime() - new Date(a.pickup_time || a.created_at).getTime()
      ),
    [reservations]
  );

  const averageRating = useMemo(() => {
    if (!feedbacks.length) return "—";
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.stars, 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const submit = async () => {
    const reservationId = selectedReservation || reservationFromQuery;
    if (!reservationId) {
      toast.warning("Lütfen bir rezervasyon seçin");
      return;
    }
    try {
      await api.post("/api/driver/feedback", {
        reservation_id: reservationId,
        rating: stars,
        comment: text,
        passenger_name: "Yolcu",
      });
      setFeedbacks((prev) => [
        {
          id: crypto.randomUUID(),
          reservationId,
          passenger: "Yolcu",
          stars,
          comment: text || "—",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast.success("⭐ Teşekkürler! Değerlendirmeniz alındı.");
      setModalOpen(false);
      setStars(5);
      setText("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Gönderim başarısız");
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard variant="premium" className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]">sürüş sonrası itibar</p>
          <h1 className="font-cinzel text-3xl text-white">
            Ortalama <GradientText variant="gold">puan</GradientText>
          </h1>
          <p className="text-sm text-[#888] mt-1">Gerçek müşterilerinizden gelen canlı geri bildirimler.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-5xl font-cinzel text-[#ffcc33]">{averageRating}</div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold hover:scale-[1.02] transition-all duration-300"
          >
            Değerlendirme Ekle
          </button>
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-cinzel text-lg text-white">Gönderilmiş yorumlar</p>
          <span className="text-xs uppercase tracking-[0.4em] text-[#777]">{feedbacks.length || "0"} kayıt</span>
        </div>
        {feedbacks.length === 0 ? (
          <EmptyState message="Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz." />
        ) : (
          <div className="space-y-3">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="rounded-2xl border border-[#ffcc33]/20 bg-[#0b0b0b]/80 p-4 flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center justify-between text-sm text-[#cfcfcf] gap-2">
                  <span className="font-semibold">{feedback.passenger}</span>
                  <span className="text-xs text-[#888]">
                    {new Date(feedback.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#ffcc33] text-lg" aria-label={`${feedback.stars} yıldız`}>
                  {"★".repeat(feedback.stars)}
                </div>
                <p className="text-sm text-[#bcbcbc]">{feedback.comment}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard variant="default" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-cinzel text-lg text-white">Tamamlanan rezervasyonlar</p>
          <span className="text-xs text-[#888]">En yeni 6 kayıt</span>
        </div>
        {completedReservations.length === 0 ? (
          <EmptyState message="Henüz tamamlanmış rezervasyon yok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-[#888] uppercase text-xs tracking-[0.4em]">
                <tr>
                  <th className="py-3 pr-4">Rezervasyon</th>
                  <th className="py-3 pr-4">Güzergah</th>
                  <th className="py-3 pr-4">Tutar</th>
                  <th className="py-3 pr-4">Değerlendirme</th>
                </tr>
              </thead>
              <tbody>
                {completedReservations.slice(0, 6).map((reservation) => (
                  <tr key={reservation.id} className="border-t border-[#ffcc33]/10">
                    <td className="py-3 pr-4 text-[#f5f5f5] font-semibold">#{reservation.id}</td>
                    <td className="py-3 pr-4 text-[#cfcfcf]">
                      {reservation.pickup_location} → {reservation.dropoff_location}
                    </td>
                    <td className="py-3 pr-4 text-[#ffcc33] font-semibold">
                      ₺{Number(reservation.total_amount || 0).toLocaleString("tr-TR")}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation.id);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#ffcc33]/40 text-[#ffcc33] hover:bg-[#ffcc33]/10 transition"
                      >
                        Değerlendir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-[#050505]/95 border border-[#ffcc33]/30 text-gray-300 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]">rezervasyon geri bildirimi</p>
                <h2 className="text-xl font-cinzel text-white">Sürüş deneyimini puanla</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#888] hover:text-white transition"
                aria-label="Pencereyi kapat"
              >
                ✕
              </button>
            </div>
            <label className="block text-sm text-[#cfcfcf]">
              <span className="mb-1 inline-block">Rezervasyon</span>
              <select
                value={selectedReservation || ""}
                onChange={(event) => setSelectedReservation(Number(event.target.value))}
                className="w-full rounded-xl bg-[#0b0b0b] border border-[#ffcc33]/30 px-3 py-2 text-white"
              >
                <option value="">Seçim yapın</option>
                {completedReservations.map((reservation) => (
                  <option key={reservation.id} value={reservation.id}>
                    #{reservation.id} · {reservation.pickup_location}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => setStars(score)}
                  className={`px-4 py-3 rounded-xl border transition ${
                    stars >= score
                      ? "bg-[#ffcc33]/20 border-[#ffcc33]/40 text-[#ffcc33]"
                      : "bg-[#0b0b0b] border-[#ffcc33]/20 text-[#666]"
                  }`}
                  aria-label={`${score} yıldız`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="w-full h-28 px-4 py-3 rounded-2xl bg-[#0b0b0b] border border-[#ffcc33]/20 text-[#ffcc33] placeholder-[#555] focus:border-[#ffcc33]/50"
              placeholder="Misafir deneyimini birkaç kelimeyle anlatın..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#ffcc33]/20 text-[#cfcfcf] hover:bg-[#ffcc33]/10"
              >
                İptal
              </button>
              <button
                onClick={submit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb400] to-[#ffcc33] text-black font-semibold"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
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