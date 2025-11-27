"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getSocket } from "@/lib/socket";
import { GlassCard } from "@/components/driver/ui";

type Reservation = { id: number; pickup_location: string; dropoff_location: string; pickup_time: string; base_price?: number };

export default function DriverOpenReservationsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Reservation[]>([]);
  const [modal, setModal] = useState<{ open: boolean; reservation: Reservation | null }>({ open: false, reservation: null });
  const [offerPrice, setOfferPrice] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    fetchRows();
    const socket = getSocket();
    const onCreated = (payload: any) => {
      if (payload?.status === "open_bid" && !payload?.driver_id) {
        setRows((prev) =>
          prev.some((entry) => entry.id === payload.id)
            ? prev
            : [
                {
                  id: payload.id,
                  pickup_location: payload.pickup_location,
                  dropoff_location: payload.dropoff_location,
                  pickup_time: payload.pickup_time,
                  base_price: payload.base_price,
                },
                ...prev,
              ]
        );
      }
    };
    const onAssigned = (payload: any) => {
      if (!payload) return;
      setRows((prev) => prev.filter((record) => record.id !== Number(payload.id)));
    };
    socket.on("reservation_created", onCreated);
    socket.on("reservation_assigned", onAssigned);
    const poll = setInterval(fetchRows, 30_000);
    return () => {
      socket.off("reservation_created", onCreated);
      socket.off("reservation_assigned", onAssigned);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchRows() {
    try {
      const response = await api.get("/api/driver/open-reservations");
      setRows(response.data || []);
    } catch {
      // silent
    }
  }

  function openBidModal(reservation: Reservation) {
    setOfferPrice("");
    setComment("");
    setModal({ open: true, reservation });
  }

  async function submitBid() {
    const reservation = modal.reservation;
    if (!reservation) return;
    if (!user || user.role !== "driver") {
      toast.error("Sadece sürücüler teklif verebilir");
      return;
    }
    const value = Number(offerPrice);
    if (!value || value <= 0) {
      toast.error("Geçerli teklif girin");
      return;
    }
    try {
      await api.post("/api/driver/bids", { reservation_id: reservation.id, offer_price: value, comment });
      toast.success("Teklif gönderildi");
      setModal({ open: false, reservation: null });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard variant="premium" className="p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]">Teklife Açık Rezervasyonlar</p>
          <h1 className="font-cinzel text-2xl text-[#050301]">VIP transfer havuzu</h1>
        </div>
        <div className="text-sm text-[#4a3b13]">
          Aktif fırsat sayısı: <strong>{rows.length}</strong>
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[#888] uppercase text-xs tracking-[0.3em] bg-[#050505]">
              <tr>
                <th className="px-5 py-3 text-left">Rezervasyon</th>
                <th className="px-5 py-3 text-left">Konum</th>
                <th className="px-5 py-3 text-left">Zaman</th>
                <th className="px-5 py-3 text-left">Taban</th>
                <th className="px-5 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((reservation) => (
                <tr key={reservation.id} className="border-t border-[#ffcc33]/10 hover:bg-[#0b0b0b] transition">
                  <td className="px-5 py-4 text-[#f5f5f5] font-semibold">#{reservation.id}</td>
                  <td className="px-5 py-4 text-[#cfcfcf]">
                    {reservation.pickup_location} → {reservation.dropoff_location}
                  </td>
                  <td className="px-5 py-4 text-[#cfcfcf]">
                    {new Date(reservation.pickup_time).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-5 py-4 text-[#ffcc33] font-semibold">
                    {reservation.base_price ? `${Number(reservation.base_price).toFixed(0)} ₺` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => openBidModal(reservation)}
                      className="px-4 py-2 rounded-xl border border-[#ffcc33]/40 text-[#ffcc33] hover:bg-[#ffcc33]/10"
                    >
                      Teklif ver
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#cfcfcf]">
                    Hiç veri bulunamadı. İlk rezervasyonunuzu bekliyoruz.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {modal.open && modal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal({ open: false, reservation: null })}></div>
          <div className="relative w-full max-w-md rounded-2xl border border-[#ffcc33]/30 bg-[#050505]/95 p-5 space-y-4">
            <div className="text-[#ffcc33] font-semibold">Teklif Ver: #{modal.reservation.id}</div>
            <div>
              <label className="block text-sm text-[#cfcfcf] mb-1">Teklif Tutarı (₺)</label>
              <input
                value={offerPrice}
                onChange={(event) => setOfferPrice(event.target.value)}
                placeholder="₺"
                className="w-full rounded-xl border border-[#ffcc33]/20 bg-transparent text-white px-3 py-2 focus:border-[#ffcc33]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#cfcfcf] mb-1">Not (isteğe bağlı)</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#ffcc33]/20 bg-transparent text-white px-3 py-2 focus:border-[#ffcc33]/50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal({ open: false, reservation: null })}
                className="px-3 py-2 rounded-xl border border-[#ffcc33]/20 text-[#cfcfcf] hover:bg-[#ffcc33]/10"
              >
                İptal
              </button>
              <button onClick={submitBid} className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#ffb400] to-[#ffcc33] text-black font-semibold">
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}