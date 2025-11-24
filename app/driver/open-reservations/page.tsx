"use client";
import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getSocket } from "@/lib/socket";

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
    const onCreated = (p: any) => {
      if (p?.status === "open_bid" && !p?.driver_id) {
        setRows((prev) => (prev.some((x) => x.id === p.id) ? prev : [{
          id: p.id,
          pickup_location: p.pickup_location,
          dropoff_location: p.dropoff_location,
          pickup_time: p.pickup_time,
          base_price: p.base_price,
        }, ...prev]));
      }
    };
    const onAssigned = (p: any) => {
      if (!p) return;
      setRows((prev) => prev.filter((x) => x.id !== Number(p.id)));
    };
    socket.on("reservation_created", onCreated);
    socket.on("reservation_assigned", onAssigned);
    // Fallback polling every 30s
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
      const r = await api.get("/api/driver/open-reservations");
      setRows(r.data || []);
    } catch {}
  }

  function openBidModal(r: Reservation) {
    setOfferPrice("");
    setComment("");
    setModal({ open: true, reservation: r });
  }

  async function submitBid() {
    const r = modal.reservation;
    if (!r) return;
    if (!user || user.role !== "driver") {
      toast.error("Sadece sürücüler teklif verebilir");
      return;
    }
    const v = Number(offerPrice);
    if (!v || v <= 0) {
      toast.error("Geçerli teklif girin");
      return;
    }
    try {
      await api.post("/api/driver/bids", { reservation_id: r.id, offer_price: v, comment });
      toast.success("Teklif gönderildi");
      setModal({ open: false, reservation: null });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    }
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-yellow-100">
      <h1 className="text-2xl font-semibold mb-4 text-yellow-400">Teklife Açık Rezervasyonlar</h1>
      <div className="overflow-x-auto rounded-2xl bg-black/60 backdrop-blur border border-yellow-500/40">
        <table className="min-w-full text-sm">
          <thead className="text-yellow-300">
            <tr>
              <th className="px-4 py-3 text-left">Rezervasyon</th>
              <th className="px-4 py-3 text-left">Konum</th>
              <th className="px-4 py-3 text-left">Zaman</th>
              <th className="px-4 py-3 text-left">Taban</th>
              <th className="px-4 py-3 text-left">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-yellow-500/20 hover:bg-yellow-500/10 transition-all duration-200">
                <td className="px-4 py-3">#{r.id}</td>
                <td className="px-4 py-3">{r.pickup_location} → {r.dropoff_location}</td>
                <td className="px-4 py-3">{new Date(r.pickup_time).toLocaleString()}</td>
                <td className="px-4 py-3">{r.base_price ? `${Number(r.base_price).toFixed(0)} ₺` : "—"}</td>
                <td className="px-4 py-3">
                  <button onClick={() => openBidModal(r)} className="px-3 py-1 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition">Teklif Ver</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-yellow-200">Şu anda açık teklif yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.open && modal.reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal({ open: false, reservation: null })}></div>
          <div className="relative w-full max-w-md rounded-2xl border border-yellow-500/40 bg-black/80 p-5 shadow-[0_0_30px_rgba(234,179,8,0.25)]">
            <div className="text-yellow-400 font-semibold mb-3">Teklif Ver: #{modal.reservation.id}</div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-yellow-300 mb-1">Teklif Tutarı (₺)</label>
                <input value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="₺"
                  className="w-full rounded-lg border border-yellow-500/30 bg-black/50 text-yellow-100 px-3 py-2 focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-sm text-yellow-300 mb-1">Not (isteğe bağlı)</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                  className="w-full rounded-lg border border-yellow-500/30 bg-black/50 text-yellow-100 px-3 py-2 focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setModal({ open: false, reservation: null })} className="px-3 py-2 rounded-lg bg-zinc-800 text-yellow-200 hover:bg-zinc-700">İptal</button>
                <button onClick={submitBid} className="px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400">Gönder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}