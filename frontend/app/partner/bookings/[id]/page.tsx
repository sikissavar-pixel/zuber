"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDrivers, useMyReservations, Reservation } from "@/hooks/useReservations";
import ChatBox from "@/components/ChatBox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import api from "@/lib/api";

type ChatMsg = { sender_role: string; message: string; created_at?: string };

export default function BookingDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const params = useParams();
  const id = Number(params?.id);
  const { data: reservations } = useMyReservations();
  const { data: drivers } = useDrivers();
  const booking = useMemo(() => (reservations || []).find((r) => r.id === id), [reservations, id]);
  const driver = useMemo(() => drivers?.find((d) => d.id === booking?.driver_id), [drivers, booking]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    socket.emit("chat_join", { booking_id: id });
    const onMsg = (payload: any) => {
      if (payload?.booking_id === id) {
        setMessages((m) => [...m, { sender_role: payload.sender_role || "driver", message: payload.message }]);
      }
    };
    socket.on("chat_message", onMsg);
    return () => {
      socket.off("chat_message", onMsg);
    };
  }, [id]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data } = await api.get(`/api/bookings/${id}/messages`);
        setMessages((data || []).map((d: any) => ({ sender_role: d.sender_role, message: d.message, created_at: d.created_at })));
      } catch (_) {}
    };
    if (id) fetchInitial();
  }, [id]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-yellow-100">
        <div className="max-w-5xl mx-auto px-6 pt-28">Rezervasyon bulunamadı.</div>
      </div>
    );
  }

  const mapQuery = encodeURIComponent(`${booking.pickup_location} to ${booking.dropoff_location}`);

  const sendMessage = (text: string) => {
    const socket = getSocket();
    socket.emit("chat_message", { booking_id: id, sender_role: "partner", message: text });
    setMessages((m) => [...m, { sender_role: "partner", message: text }]);
  };
  const simulateScan = async () => {
    try {
      await api.post(`/api/wallet/release`, { reservation_id: id });
      toast.success("QR doğrulama başarılı, ödeme serbest bırakıldı.");
      setQrOpen(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Doğrulama başarısız");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-yellow-100">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-yellow-500/40 bg-black/60 backdrop-blur shadow-[0_0_30px_rgba(234,179,8,0.25)]">
            <iframe
              title="Güzergah Haritası"
              src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY || ""}&origin=${encodeURIComponent(booking.pickup_location)}&destination=${encodeURIComponent(booking.dropoff_location)}`}
              width="100%"
              height="320"
              loading="lazy"
            />
          </div>

          <div className="p-5 rounded-2xl bg-black/60 backdrop-blur border border-yellow-500/40 text-yellow-200">
            <div className="font-semibold text-yellow-400 mb-2">Sürücü Bilgisi</div>
            <div>🚘 Sürücü: {driver?.full_name || "Atanmadı"}</div>
            <div>📞 {driver?.contact_phone || "-"}</div>
            <div>🚗 Araç: {driver?.vehicle_model || "-"} ({driver?.vehicle_plate || "-"})</div>
          </div>
        </div>

        <div className="lg:col-span-1 h-[500px] space-y-4">
          <ChatBox messages={messages} onSend={sendMessage} userRole="partner" />
          <button onClick={() => setQrOpen(true)} className="w-full px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition">QR Doğrulama</button>
        </div>

        {/* QR Modal */}
        {qrOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur" onClick={() => setQrOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md rounded-2xl border border-yellow-400/30 bg-neutral-950/85 p-6 shadow-[0_0_40px_rgba(234,179,8,0.35)] text-center">
              <div className="text-xl font-bold text-yellow-400">QR Doğrulama</div>
              <div className="mt-2 text-yellow-200">Rezervasyon #{id}</div>
              <div className="mt-4 mx-auto w-40 h-40 rounded-xl bg-yellow-500/10 border border-yellow-400/30 flex items-center justify-center text-yellow-300">QR Demo</div>
              <div className="mt-6 flex gap-3 justify-center">
                <button onClick={() => setQrOpen(false)} className="px-4 py-2 rounded-xl bg-neutral-800 text-yellow-200 hover:bg-neutral-700">Kapat</button>
                <button onClick={simulateScan} className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition">Simulate Scan</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}