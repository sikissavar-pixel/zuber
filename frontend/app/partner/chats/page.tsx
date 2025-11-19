"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useMyReservations, Reservation, useDrivers } from "@/hooks/useReservations";
import { getSocket } from "@/lib/socket";
import { motion } from "framer-motion";

export default function PartnerChatsPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const { data: reservations = [] } = useMyReservations();
  const { data: drivers = [] } = useDrivers();
  const [messages, setMessages] = useState<Record<number, { sender_role: string; message: string; created_at?: string }[]>>({});
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const onMsg = (payload: any) => {
      const bid = payload?.booking_id;
      if (!bid) return;
      setMessages((m) => ({
        ...m,
        [bid]: [...(m[bid] || []), { sender_role: payload.sender_role || "driver", message: payload.message, created_at: payload.created_at }],
      }));
      setNotify(true);
      setTimeout(() => setNotify(false), 2000);
    };
    socket.on("chat_message", onMsg);
    return () => {
      socket.off("chat_message", onMsg);
    };
  }, []);

  const send = (id: number, text: string) => {
    const socket = getSocket();
    socket.emit("chat_message", { booking_id: id, sender_role: "partner", message: text });
    setMessages((m) => ({ ...m, [id]: [...(m[id] || []), { sender_role: "partner", message: text, created_at: new Date().toISOString() }] }));
  };

  const driverName = (r: Reservation) => drivers.find((d) => d.id === r.driver_id)?.full_name || "Atanmadı";

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        Sohbetler
        <span className={`${notify ? "animate-bounce" : ""}`}>🔔</span>
      </h1>

      {reservations.length === 0 ? (
        <div className="text-center text-gray-400 py-20">Henüz bir sohbet bulunmuyor.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          {reservations.map((r) => (
            <ChatCard
              key={r.id}
              reservation={r}
              driverName={driverName(r)}
              messages={messages[r.id] || []}
              onSend={(text) => send(r.id, text)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type ChatCardProps = {
  reservation: Reservation;
  driverName: string;
  messages: { sender_role: string; message: string; created_at?: string }[];
  onSend: (text: string) => void;
};

function ChatCard({ reservation, driverName, messages, onSend }: ChatCardProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const socket = getSocket();
    socket.emit("chat_join", { booking_id: reservation.id });
  }, [reservation.id]);

  const dateLabel = useMemo(() => {
    const d = reservation.pickup_time || reservation.created_at;
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  }, [reservation.pickup_time, reservation.created_at]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-black/70 border border-yellow-500/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(250,204,21,0.1)] flex flex-col justify-between hover:shadow-[0_0_20px_#facc15]/20"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-yellow-400 font-semibold text-lg">
            {reservation.pickup_location} → {reservation.dropoff_location}
          </h3>
          <p className="text-sm text-gray-400">
            Durum: <span className="text-yellow-300">{reservation.status}</span>
          </p>
          <p className="text-sm text-gray-400">Sürücü: {driverName}</p>
        </div>
        <span className="text-xs text-gray-500">{dateLabel}</span>
      </div>

      <div className="flex-1 overflow-y-auto bg-black/40 rounded-xl p-3 border border-yellow-500/10 mb-3 max-h-[250px]">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-400">Henüz mesaj yok.</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-2 ${msg.sender_role === "driver" ? "text-right" : "text-left"}`}>
              <p className={`inline-block px-3 py-2 rounded-xl ${msg.sender_role === "driver" ? "bg-yellow-500 text-black" : "bg-gray-800 text-yellow-300"}`}>
                {msg.message}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-black/50 text-gray-300 border border-yellow-500/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-400"
        />
        <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold">
          Gönder
        </button>
      </form>
    </motion.div>
  );
}