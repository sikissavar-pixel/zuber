"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { GlassCard } from "@/components/driver/ui";

type Bid = { id: number; reservation_id: number; offer_price: number; status: string; created_at: string; comment?: string };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-200 border border-amber-500/30",
  edited: "bg-blue-500/10 text-blue-200 border border-blue-500/30",
  accepted: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30",
  rejected: "bg-rose-500/10 text-rose-200 border border-rose-500/30",
};

export default function DriverMyBidsPage() {
  const [rows, setRows] = useState<Bid[]>([]);
  const [editing, setEditing] = useState<Bid | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchRows();
    const socket = getSocket();
    const onRejected = ({ bid_id }: any) => {
      setRows((prev) => prev.map((bid) => (bid.id === bid_id ? { ...bid, status: "rejected" } : bid)));
    };
    const onAccepted = ({ bid_id }: any) => {
      setRows((prev) => prev.map((bid) => (bid.id === bid_id ? { ...bid, status: "accepted" } : bid)));
    };
    socket.on("partner_bid_rejected", onRejected);
    socket.on("partner_bid_accepted", onAccepted);
    socket.on("bid_accepted", onAccepted);
    return () => {
      socket.off("partner_bid_rejected", onRejected);
      socket.off("partner_bid_accepted", onAccepted);
      socket.off("bid_accepted", onAccepted);
    };
  }, []);

  async function fetchRows() {
    try {
      const response = await api.get("/api/driver/bids");
      setRows(response.data || []);
    } catch {
      // ignore
    }
  }

  async function cancel(bidId: number) {
    try {
      await api.delete(`/api/driver/bids/${bidId}`);
      toast.success("Teklif iptal edildi");
      fetchRows();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Hata oluştu");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await api.patch(`/api/driver/bids/${editing.id}`, {
        offer_price: offerPrice ? Number(offerPrice) : undefined,
        comment,
      });
      toast.success("Teklif güncellendi");
      setEditing(null);
      setOfferPrice("");
      setComment("");
      fetchRows();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Hata oluştu");
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard variant="default" className="p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]">Teklif yönetimi</p>
          <h1 className="font-cinzel text-2xl text-white">Açık teklif akışı</h1>
        </div>
        <div className="text-sm text-[#cfcfcf]">Toplam teklif: {rows.length}</div>
      </GlassCard>

      <GlassCard variant="default" className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-[#888] uppercase text-xs tracking-[0.3em] bg-[#050505]">
              <tr>
                <th className="px-5 py-3 text-left">Rezervasyon</th>
                <th className="px-5 py-3 text-left">Teklif</th>
                <th className="px-5 py-3 text-left">Durum</th>
                <th className="px-5 py-3 text-left">Tarih</th>
                <th className="px-5 py-3 text-left">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((bid) => (
                <tr key={bid.id} className="border-t border-[#ffcc33]/10">
                  <td className="px-5 py-4 text-white font-semibold">#{bid.reservation_id}</td>
                  <td className="px-5 py-4 text-[#ffcc33] font-semibold">₺{Number(bid.offer_price).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${statusStyles[bid.status] || "bg-zinc-800 text-zinc-200"}`}>
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#cfcfcf]">
                    {new Date(bid.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-5 py-4">
                    {bid.status === "pending" || bid.status === "edited" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setEditing(bid);
                            setOfferPrice(String(bid.offer_price));
                            setComment(bid.comment || "");
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[#ffcc33]/40 text-[#ffcc33] hover:bg-[#ffcc33]/10 text-xs"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => cancel(bid.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-400/40 text-rose-300 hover:bg-rose-500/10 text-xs"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#666]">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#cfcfcf]">
                    Henüz teklif yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#050505]/95 border border-[#ffcc33]/30 rounded-2xl p-5 w-full max-w-md space-y-3">
            <h2 className="text-xl font-cinzel text-white">Teklif Düzenle</h2>
            <label className="block text-sm text-[#cfcfcf]">
              Yeni Teklif (₺)
              <input
                value={offerPrice}
                onChange={(event) => setOfferPrice(event.target.value)}
                className="mt-1 w-full bg-transparent border border-[#ffcc33]/20 rounded-xl px-3 py-2 text-white focus:border-[#ffcc33]/50"
              />
            </label>
            <label className="block text-sm text-[#cfcfcf]">
              Yorum
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="mt-1 w-full bg-transparent border border-[#ffcc33]/20 rounded-xl px-3 py-2 text-white focus:border-[#ffcc33]/50"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-xl border border-[#ffcc33]/20 text-[#cfcfcf] hover:bg-[#ffcc33]/10">
                Vazgeç
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#ffb400] to-[#ffcc33] text-black font-semibold"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
