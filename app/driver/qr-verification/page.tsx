"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DriverQRVerification() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const simulateVerify = async () => {
    setLoading(true);
    try {
      await api.post("/api/driver/qr/verify", { reservation_id: 1 });
      toast.success("Sürüş tamamlandı, yolcu QR kodunu doğruladı.");
      router.push("/driver/feedback?open=1&reservation_id=1");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Doğrulama başarısız");
    } finally {
      setLoading(false);
    }
  };
  const manualApprove = async () => {
    await simulateVerify();
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-yellow-700/40 bg-black/60 p-6">
        <div className="text-xl mb-3">QR Onay Akışı</div>
        <div className="flex gap-3">
          <button disabled={loading} onClick={simulateVerify} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:scale-[1.03]">🪪 QR Kod Okut</button>
          <button disabled={loading} onClick={manualApprove} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:scale-[1.03]">✅ Manuel Onayla</button>
        </div>
      </div>
    </div>
  );
}