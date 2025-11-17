"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function QRConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await api.post(`/api/bookings/${id}/qr_confirm`);
      toast.success("💸 İşleminiz başarıyla tamamlandı.");
      router.push("/partner/bookings");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Doğrulama başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "radial-gradient(circle at 20% 0%, rgba(250,204,21,0.25), transparent 60%)", backgroundColor: "#000" }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-yellow-400/20 bg-neutral-950/80 backdrop-blur-md p-8 shadow-[0_0_40px_rgba(234,179,8,0.35)] text-center">
        <div className="text-2xl font-bold text-yellow-400">QR Doğrulama</div>
        <div className="mt-2 text-yellow-200">Rezervasyon #{id}</div>
        <button onClick={confirm} disabled={loading}
          className="mt-6 px-6 py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition shadow-[0_0_20px_rgba(234,179,8,0.35)] hover:scale-[1.02]">
          {loading ? "Onaylanıyor…" : "Onayla"}
        </button>
      </motion.div>
    </div>
  );
}