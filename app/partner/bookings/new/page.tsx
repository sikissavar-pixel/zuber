"use client";
import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function NewBookingPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const router = useRouter();
  const [form, setForm] = useState({
    guest_name: "",
    phone: "",
    pickup_location: "",
    dropoff_location: "",
    date: "",
    time: "",
    vehicle_type: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.pickup_location || !form.dropoff_location || !form.date || !form.time) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }
    setLoading(true);
    try {
      const pickup_time = new Date(`${form.date}T${form.time}:00`).toISOString();
      const payload = {
        guest_name: form.guest_name || undefined,
        pickup_location: form.pickup_location,
        dropoff_location: form.dropoff_location,
        pickup_time,
      };
      const { data } = await api.post("/api/bookings/create", payload);
      // Demo: block a fixed estimate (₺500) per spec
      try {
        const estimatedAmount = 500;
        await api.post("/api/wallet/block", { reservation_id: data.id, amount: estimatedAmount });
        toast.success("Rezervasyon oluşturuldu ve ₺500 bloke edildi");
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || "Blokaj başarısız");
      }
      router.push(`/partner/bookings/${data.id}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="text-yellow-100">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">Yeni Rezervasyon</h1>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-6 rounded-2xl border border-yellow-400/20 bg-neutral-950/70 backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.25)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Müşteri Adı" value={form.guest_name} onChange={(v) => set("guest_name", v)} />
            <Input label="Telefon" value={form.phone} onChange={(v) => set("phone", v)} />
            <Input label="Kalkış" value={form.pickup_location} onChange={(v) => set("pickup_location", v)} required />
            <Input label="Varış" value={form.dropoff_location} onChange={(v) => set("dropoff_location", v)} required />
            <Input label="Tarih" type="date" value={form.date} onChange={(v) => set("date", v)} required />
            <Input label="Saat" type="time" value={form.time} onChange={(v) => set("time", v)} required />
            <Input label="Araç Tipi" value={form.vehicle_type} onChange={(v) => set("vehicle_type", v)} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-yellow-400/30 hover:shadow-yellow-400/40 transition transform hover:scale-[1.02] disabled:opacity-50"
            >
              Oluştur
            </button>
            <button onClick={() => router.back()} className="px-5 py-2 rounded-xl bg-zinc-800 text-yellow-200 hover:bg-zinc-700 transition">
              İptal
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="space-y-2">
      <span className="text-yellow-300 text-sm">{label}{required ? " *" : ""}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        className="w-full px-4 py-2 rounded-xl bg-neutral-900/60 text-gray-100 placeholder-[#a3a3a3] border border-yellow-400/30 outline-none focus:ring-2 focus:ring-yellow-500/40"
      />
    </label>
  );
}