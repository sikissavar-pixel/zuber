"use client";
import React, { useEffect, useState } from "react";
import api from "../../../../lib/api";
import { useAuth } from "../../../../hooks/useAuth";
import { toast } from "sonner";
import { getSocket } from "../../../../lib/socket";

type Bid = { id: number; reservation_id: number; driver_id: number; offer_price: number; status: string; created_at: string; comment?: string };
type Reservation = { id: number; pickup_location: string; dropoff_location: string; pickup_time: string; vehicle_type?: string; base_price?: number; allow_bids?: boolean };

export default function PartnerReservationBidsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [res, setRes] = useState<Reservation | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetchData();
    const s = getSocket();
    s.on("bid_submitted", (data: any) => {
      if (data?.reservation_id == Number(params.id)) {
        fetchBids();
        toast.info("Yeni teklif geldi");
      }
    });
    s.on("driver_bid_updated", (data: any) => {
      if (data?.reservation_id == Number(params.id)) {
        fetchBids();
        toast.info("Sürücü teklifini güncelledi");
      }
    });
    s.on("driver_bid_cancelled", (data: any) => {
      if (data?.reservation_id == Number(params.id)) {
        fetchBids();
        toast.warning("Sürücü teklifini iptal etti");
      }
    });
    s.on("reservation_assigned", (payload: any) => {
      if (payload?.id == Number(params.id)) {
        toast.success("Sürücü atandı");
      }
    });
    return () => {
      s.off("bid_submitted");
      s.off("driver_bid_updated");
      s.off("driver_bid_cancelled");
      s.off("reservation_assigned");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchData() {
    try {
      const r = await api.get(`/api/reservations/me`);
      const item = (r.data as Reservation[]).find((x) => x.id == Number(params.id));
      setRes(item || null);
      await fetchBids();
    } catch {}
  }

  async function fetchBids() {
    try {
      const r = await api.get(`/api/partner/bids/${params.id}`);
      setBids(r.data);
    } catch {}
  }

  async function accept(bidId: number) {
    if (!user || user.role !== "partner") {
      toast.error("Sadece partner onaylayabilir");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/partner/bids/accept/${bidId}`);
      toast.success("Teklif kabul edildi");
      window.location.href = "/partner/dashboard";
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Gelen Teklifler</h1>
      {res && (
        <div className="mb-6 text-sm text-gray-300">
          <div>#{res.id} — {res.pickup_location} → {res.dropoff_location}</div>
          <div>Tarih: {new Date(res.pickup_time).toLocaleString()}</div>
          {res.vehicle_type && <div>Araç: {res.vehicle_type}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Sürücü</th>
              <th className="py-2">Araç</th>
              <th className="py-2">Teklif</th>
              <th className="py-2">Durum</th>
              <th className="py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((b) => (
              <tr key={b.id} className="border-b border-gray-800">
                <td className="py-2">#{b.driver_id}</td>
                <td className="py-2">—</td>
                <td className="py-2">
                  <span title={b.comment || ""}>₺{Number(b.offer_price).toFixed(2)}</span>
                </td>
                <td className="py-2">{b.status}</td>
                <td className="py-2">
                  <button disabled={loading || b.status !== "pending"} onClick={() => accept(b.id)} className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-black">
                    Kabul Et
                  </button>
                  <button
                    disabled={loading || b.status !== "pending"}
                    onClick={async () => {
                      try {
                        await api.post(`/api/partner/bids/reject/${b.id}`);
                        toast.success("Teklif reddedildi");
                        fetchBids();
                      } catch (e: any) {
                        toast.error(e?.response?.data?.detail || "Hata oluştu");
                      }
                    }}
                    className="ml-2 px-3 py-1 rounded border border-red-500 text-red-400 hover:text-red-300 hover:border-red-400"
                  >
                    Reddet
                  </button>
                </td>
              </tr>
            ))}
            {bids.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">Henüz teklif yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}