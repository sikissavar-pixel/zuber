"use client";
import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import { getSocket } from "../../../lib/socket";
import { toast } from "sonner";

type Bid = { id: number; reservation_id: number; offer_price: number; status: string; created_at: string; comment?: string };

export default function DriverMyBidsPage() {
  const [rows, setRows] = useState<Bid[]>([]);
  const [editing, setEditing] = useState<Bid | null>(null);
  const [offerPrice, setOfferPrice] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  useEffect(() => {
    fetchRows();
    const s = getSocket();
    const onRejected = ({ bid_id }: any) => {
      setRows((prev) => prev.map((b) => (b.id === bid_id ? { ...b, status: "rejected" } : b)));
    };
    const onAccepted = ({ bid_id }: any) => {
      setRows((prev) => prev.map((b) => (b.id === bid_id ? { ...b, status: "accepted" } : b)));
    };
    s.on("partner_bid_rejected", onRejected);
    s.on("partner_bid_accepted", onAccepted);
    s.on("bid_accepted", onAccepted);
    return () => {
      s.off("partner_bid_rejected", onRejected);
      s.off("partner_bid_accepted", onAccepted);
      s.off("bid_accepted", onAccepted);
    };
  }, []);
  async function fetchRows() {
    try {
      const r = await api.get("/api/driver/bids");
      setRows(r.data);
    } catch {}
  }
  async function cancel(bidId: number) {
    try {
      await api.delete(`/api/driver/bids/${bidId}`);
      toast.success("Teklif iptal edildi");
      fetchRows();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
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
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    }
  }
  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tekliflerim</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Rezervasyon</th>
              <th className="py-2">Teklif</th>
              <th className="py-2">Durum</th>
              <th className="py-2">Tarih</th>
              <th className="py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-gray-800">
                <td className="py-2">#{b.reservation_id}</td>
                <td className="py-2"><span title={b.comment || ""}>₺{Number(b.offer_price).toFixed(2)}</span></td>
                <td className="py-2">{b.status}</td>
                <td className="py-2">{new Date(b.created_at).toLocaleString()}</td>
                <td className="py-2">
                  {b.status === "pending" || b.status === "edited" ? (
                    <>
                      <button onClick={() => { setEditing(b); setOfferPrice(String(b.offer_price)); setComment(b.comment || ""); }} className="px-3 py-1 rounded border border-yellow-500 text-yellow-400 hover:text-yellow-300 hover:border-yellow-400">Düzenle</button>
                      <button onClick={() => cancel(b.id)} className="ml-2 px-3 py-1 rounded border border-red-500 text-red-400 hover:text-red-300 hover:border-red-400">İptal</button>
                    </>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">Henüz teklif yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-black border border-yellow-700 rounded p-4 w-full max-w-md">
            <h2 className="text-xl mb-3">Teklif Düzenle</h2>
            <label className="block mb-2 text-sm">Yeni Teklif (₺)</label>
            <input value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-3 py-2 mb-3" />
            <label className="block mb-2 text-sm">Yorum</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-3 py-2 mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setEditing(null); }} className="px-3 py-2 rounded border border-gray-600 text-gray-300">Vazgeç</button>
              <button onClick={saveEdit} className="px-3 py-2 rounded border border-yellow-500 text-black bg-yellow-600 hover:bg-yellow-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}