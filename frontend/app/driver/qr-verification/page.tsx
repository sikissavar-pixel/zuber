"use client";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import { getSocket } from "@/lib/socket";

export default function DriverQRVerification() {
  const router = useRouter();
  const params = useSearchParams();
  const reservationIdParam = params?.get("reservation_id");
  const [reservationId, setReservationId] = useState<number | null>(reservationIdParam ? Number(reservationIdParam) : null);
  const [token] = useState<string>(() => Math.random().toString(36).slice(2));
  const [qrReady, setQrReady] = useState<boolean>(false);

  // Build QR content
  const qrValue = useMemo(() => {
    return JSON.stringify({ reservation_id: reservationId, token });
  }, [reservationId, token]);

  useEffect(() => {
    const s = getSocket();
    const onVerified = (payload: any) => {
      if (reservationId && payload?.id === reservationId) {
        toast.success("QR onayı tamamlandı.");
        router.push(`/driver/reservations`);
      }
    };
    s.on("qr_verified", onVerified);
    return () => {
      s.off("qr_verified", onVerified);
    };
  }, [reservationId, router]);

  useEffect(() => {
    // If no reservation passed, try to fetch active ride from dashboard
    const loadActive = async () => {
      if (reservationId) return setQrReady(true);
      try {
        const { data } = await api.get("/api/driver/dashboard");
        const id = data?.active_ride?.id;
        if (id) setReservationId(id);
      } catch {}
      setQrReady(true);
    };
    loadActive();
  }, [reservationId]);

  const manualApprove = async () => {
    if (!reservationId) return;
    try {
      await api.post("/api/driver/qr/verify", { reservation_id: reservationId, token });
      toast.success("QR onayı alındı.");
      router.push("/driver/reservations");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Doğrulama başarısız");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "radial-gradient(circle at 20% 0%, rgba(250,204,21,0.18), transparent 60%)", backgroundColor: "#000" }}>
      <div className="rounded-2xl border border-yellow-500/40 bg-neutral-950/85 backdrop-blur-md p-8 shadow-[0_0_40px_rgba(234,179,8,0.25)] text-center max-w-md w-full">
        <div className="text-2xl font-bold text-yellow-400">QR Onayı Bekleniyor</div>
        <div className="mt-2 text-yellow-200">Rezervasyon #{reservationId ?? "-"}</div>
        <div className="mt-6 flex items-center justify-center">
          {qrReady && reservationId ? (
            <div className="p-4 rounded-xl bg-black/80 border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
              <QRCode value={qrValue} size={180} bgColor="#000000" fgColor="#facc15" />
            </div>
          ) : (
            <div className="text-yellow-300">Hazırlanıyor…</div>
          )}
        </div>
        <div className="mt-4 text-yellow-100 text-sm">Yolcu QR kodu taradığında sürüşü tamamlayabilirsiniz.</div>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={manualApprove} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:scale-[1.03]">✅ Manuel Onayla</button>
          <button onClick={() => router.push("/driver/reservations")} className="px-4 py-2 rounded-xl border border-yellow-400/40 text-yellow-300 hover:bg-yellow-500/10">Geri Dön</button>
        </div>
      </div>
    </div>
  );
}