"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";

type Bid = { id: number; reservation_id: number; driver_id: number; driver_name?: string; offer_price: number; status: string; created_at: string; comment?: string };

export default function PartnerOpenBidsPage() {
  const [rows, setRows] = useState<Bid[]>([]);
  const [status, setStatus] = useState<string>("");
  const [reservationId, setReservationId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    // Initial load: pending + edited
    fetchCombined(["pending", "edited"]);
    const s = getSocket();
    socketRef.current = s;
    // Accept both legacy and new event names, update affected rows
    const onSubmitted = (payload: any) => {
      const bid: Bid | undefined = payload?.bid || payload;
      if (bid?.id) {
        setRows((prev) => upsertBid(prev, bid));
      } else {
        fetchRows();
      }
    };
    const onUpdated = (payload: any) => {
      const patch = payload?.bid || payload;
      if (patch?.id) {
        setRows((prev) => prev.map((b) => (b.id === patch.id ? { ...b, ...patch } : b)));
      } else if (payload?.bid_id) {
        const { bid_id, ...rest } = payload;
        setRows((prev) => prev.map((b) => (b.id === bid_id ? { ...b, ...rest } : b)));
      } else {
        fetchRows();
      }
    };
    const onCancelled = (payload: any) => {
      const id = payload?.bid_id || payload?.id;
      if (id) setRows((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      else fetchRows();
    };
    const onAccepted = (payload: any) => {
      const id = payload?.bid_id || payload?.id;
      if (id) setRows((prev) => prev.map((b) => (b.id === id ? { ...b, status: "accepted" } : b)));
      else fetchRows();
    };
    const onRejected = (payload: any) => {
      const id = payload?.bid_id || payload?.id;
      if (id) setRows((prev) => prev.map((b) => (b.id === id ? { ...b, status: "rejected" } : b)));
      else fetchRows();
    };
    s.on("driver_bid_submitted", onSubmitted);
    s.on("bid_submitted", onSubmitted);
    s.on("driver_bid_updated", onUpdated);
    s.on("driver_bid_cancelled", onCancelled);
    s.on("partner_bid_accepted", onAccepted);
    s.on("partner_bid_rejected", onRejected);
    // Fallback polling every 30s if socket disconnected
    const interval = setInterval(() => {
      const connected = socketRef.current?.connected;
      if (!connected) fetchRows();
    }, 30_000);
    return () => {
      s.off("driver_bid_submitted", onSubmitted);
      s.off("bid_submitted", onSubmitted);
      s.off("driver_bid_updated", onUpdated);
      s.off("driver_bid_cancelled", onCancelled);
      s.off("partner_bid_accepted", onAccepted);
      s.off("partner_bid_rejected", onRejected);
      clearInterval(interval);
    };
  }, []);

  async function fetchRows() {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (reservationId) params.reservation_id = Number(reservationId);
      const r = await api.get("/api/partner/bids/open", { params });
      setRows(r.data);
    } catch {}
  }

  async function fetchCombined(statuses: string[]) {
    try {
      const all: Bid[] = [];
      for (const st of statuses) {
        const { data } = await api.get("/api/partner/bids/open", { params: { status: st } });
        all.push(...data);
      }
      // De-duplicate by id
      const unique = Object.values(
        all.reduce<Record<number, Bid>>((acc, b) => {
          acc[b.id] = b;
          return acc;
        }, {})
      );
      setRows(unique);
    } catch {}
  }

  function upsertBid(prev: Bid[], bid: Bid) {
    const idx = prev.findIndex((b) => b.id === bid.id);
    if (idx >= 0) {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...bid };
      return copy;
    }
    return [bid, ...prev];
  }

  async function accept(bidId: number) {
    try {
      await api.post(`/api/partner/bids/accept/${bidId}`);
      toast.success("Teklif kabul edildi");
      setRows((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "accepted" } : b)));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    }
  }

  async function reject(bidId: number) {
    try {
      await api.post(`/api/partner/bids/reject/${bidId}`);
      toast.success("Teklif reddedildi");
      setRows((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "rejected" } : b)));
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    }
  }

  // Derived display rows: filter + search + sort
  const displayRows = useMemo(() => {
    let data = [...rows];
    if (status) data = data.filter((b) => b.status === status);
    if (reservationId) data = data.filter((b) => String(b.reservation_id) === reservationId.trim());
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((b) =>
        String(b.reservation_id).includes(q) || (b.driver_name ? b.driver_name.toLowerCase().includes(q) : false)
      );
    }
    data.sort((a, b) => (sortDir === "asc" ? a.offer_price - b.offer_price : b.offer_price - a.offer_price));
    return data;
  }, [rows, status, reservationId, search, sortDir]);

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Açık Teklifler</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2">
          <option value="">Tümü</option>
          <option value="pending">Beklemede</option>
          <option value="edited">Güncellendi</option>
          <option value="accepted">Kabul Edildi</option>
          <option value="rejected">Reddedildi</option>
          <option value="cancelled">İptal Edildi</option>
        </select>
        <input value={reservationId} onChange={(e) => setReservationId(e.target.value)} placeholder="Rezervasyon ID" className="bg-black border border-gray-700 rounded px-3 py-2" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sürücü adı veya rezervasyon" className="bg-black border border-gray-700 rounded px-3 py-2 flex-1 min-w-[180px]" />
        <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className="bg-black border border-gray-700 rounded px-3 py-2">
          <option value="asc">Fiyat ⬆︎</option>
          <option value="desc">Fiyat ⬇︎</option>
        </select>
        <button onClick={fetchRows} className="px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-black">Yenile</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Rezervasyon</th>
              <th className="py-2">Sürücü</th>
              <th className="py-2">Teklif</th>
              <th className="py-2">Durum</th>
              <th className="py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((b) => (
              <tr key={b.id} className="border-b border-gray-800 hover:bg-zinc-900/70 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <td className="py-2">
                  <a className="text-yellow-400 hover:text-yellow-300" href={`/partner/bids/${b.reservation_id}`}>#{b.reservation_id}</a>
                </td>
                <td className="py-2">{b.driver_name || `#${b.driver_id}`}</td>
                <td className="py-2"><span title={b.comment || ""}>₺{Number(b.offer_price).toFixed(2)}</span></td>
                <td className="py-2"><StatusBadge status={b.status} /></td>
                <td className="py-2">
                  <DetailTrigger bid={b} onAccept={() => accept(b.id)} onReject={() => reject(b.id)} />
                  <button onClick={() => accept(b.id)} disabled={!(b.status === "pending" || b.status === "edited")}
                    className="ml-2 px-3 py-1 rounded border border-green-500 text-green-400 hover:text-green-300 hover:border-green-400">Kabul Et</button>
                  <button onClick={() => reject(b.id)} disabled={!(b.status === "pending" || b.status === "edited")}
                    className="ml-2 px-3 py-1 rounded border border-red-500 text-red-400 hover:text-red-300 hover:border-red-400">Reddet</button>
                </td>
              </tr>
            ))}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">Kriterlere göre teklif bulunamadı</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {displayRows.length === 0 && rows.length === 0 && (
        <div className="mt-6 text-yellow-200">Şu anda açık teklif bulunmuyor</div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Bid["status"] | string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "🟡 Beklemede", className: "text-yellow-300" },
    edited: { label: "🟠 Güncellendi", className: "text-orange-400" },
    accepted: { label: "🟢 Kabul Edildi", className: "text-green-400" },
    rejected: { label: "🔴 Reddedildi", className: "text-red-400" },
    cancelled: { label: "⚫ İptal Edildi", className: "text-gray-400" },
  };
  const m = map[status] || { label: status, className: "text-yellow-200" };
  return <span className={`text-sm ${m.className}`}>{m.label}</span>;
}

function DetailTrigger({ bid, onAccept, onReject }: { bid: Bid; onAccept: () => void; onReject: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-3 py-1 rounded border border-yellow-500 text-yellow-400 hover:text-yellow-300 hover:border-yellow-400">Detay</button>
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-yellow-700 rounded-2xl p-5 w-full max-w-lg shadow-[0_0_30px_rgba(234,179,8,0.25)]">
            <h2 className="text-xl font-semibold text-yellow-400 mb-3">Teklif Detayı</h2>
            <div className="space-y-2 text-yellow-100">
              <div>Rezervasyon: <span className="text-yellow-300">#{bid.reservation_id}</span></div>
              <div>Sürücü: <span className="text-yellow-300">{bid.driver_name || `#${bid.driver_id}`}</span></div>
              <div>Teklif: <span className="text-yellow-300">₺{Number(bid.offer_price).toFixed(2)}</span></div>
              <div>Not: <span className="text-yellow-300">{bid.comment || "—"}</span></div>
              <div>Oluşturulma: <span className="text-yellow-300">{new Date(bid.created_at).toLocaleString()}</span></div>
              <div>Durum: <StatusBadge status={bid.status} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="px-3 py-2 rounded border border-gray-600 text-gray-300">Kapat</button>
              <button onClick={() => { onAccept(); setOpen(false); }} disabled={!(bid.status === "pending" || bid.status === "edited")} className="px-3 py-2 rounded border border-green-500 text-green-400 hover:text-green-300 hover:border-green-400">Kabul Et</button>
              <button onClick={() => { onReject(); setOpen(false); }} disabled={!(bid.status === "pending" || bid.status === "edited")} className="px-3 py-2 rounded border border-red-500 text-red-400 hover:text-red-300 hover:border-red-400">Reddet</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}