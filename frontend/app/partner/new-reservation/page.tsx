"use client";
import React, { useState } from "react";
import api from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "sonner";

export default function NewReservationPage() {
  const { user } = useAuth();
  const [pickup_location, setPickup] = useState("");
  const [dropoff_location, setDropoff] = useState("");
  const [pickup_time, setPickupTime] = useState("");
  const [vehicle_type, setVehicleType] = useState("");
  const [base_price, setBasePrice] = useState<string>("");
  const [allow_bids, setAllowBids] = useState(true);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!user || user.role !== "partner") {
      toast.error("Sadece partner hesabı rezervasyon oluşturabilir");
      return;
    }
    if (!pickup_location || !dropoff_location || !pickup_time) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }
    setLoading(true);
    try {
      const payload: any = { pickup_location, dropoff_location, pickup_time, vehicle_type, allow_bids };
      if (base_price) payload.base_price = Number(base_price);
      const res = await api.post("/api/reservations", payload);
      toast.success("Rezervasyon oluşturuldu");
      const id = res.data.id;
      if (allow_bids) {
        window.location.href = `/partner/bids/${id}`;
      } else {
        window.location.href = "/partner/dashboard";
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Yeni Rezervasyon</h1>
      <div className="space-y-4">
        <input className="w-full border rounded px-3 py-2 bg-black/40 text-white" placeholder="Kalkış" value={pickup_location} onChange={(e) => setPickup(e.target.value)} />
        <input className="w-full border rounded px-3 py-2 bg-black/40 text-white" placeholder="Varış" value={dropoff_location} onChange={(e) => setDropoff(e.target.value)} />
        <input className="w-full border rounded px-3 py-2 bg-black/40 text-white" type="datetime-local" value={pickup_time} onChange={(e) => setPickupTime(e.target.value)} />
        <input className="w-full border rounded px-3 py-2 bg-black/40 text-white" placeholder="Araç tipi (Sedan/SUV)" value={vehicle_type} onChange={(e) => setVehicleType(e.target.value)} />
        <div className="flex items-center gap-3">
          <input id="allow_bids" type="checkbox" checked={allow_bids} onChange={(e) => setAllowBids(e.target.checked)} />
          <label htmlFor="allow_bids">Sürücüler teklif verebilsin</label>
        </div>
        <input className="w-full border rounded px-3 py-2 bg-black/40 text-white" placeholder="Taban fiyat (opsiyonel)" value={base_price} onChange={(e) => setBasePrice(e.target.value)} />
        <button onClick={submit} disabled={loading} className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-black font-medium">
          {loading ? "Oluşturuluyor..." : "Oluştur"}
        </button>
      </div>
    </div>
  );
}