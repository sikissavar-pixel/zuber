"use client";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

type Msg = { from: "partner" | "driver"; text: string };

export default function DriverChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "partner", text: "Yeni rezervasyonunuzu onaylayın." },
    { from: "driver", text: "Tamamdır, yoldayım." },
  ]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = getSocket();
    s.on("connect", () => { /* joined */ });
    s.on("driver_chat_message", (payload: any) => {
      if (payload?.text) setMessages((m) => [...m, { from: payload.from || "partner", text: payload.text }]);
    });
    setSocket(s);
    return () => { s.off("driver_chat_message"); };
  }, []);

  const send = () => {
    if (!input.trim()) return;
    const m: Msg = { from: "driver", text: input.trim() };
    setMessages((prev) => [...prev, m]);
    socket?.emit("driver_chat_message", m); // echo via backend socket
    setInput("");
  };

  return (
    <div className="flex flex-col h-[70vh] bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-xl">
      <div className="h-1 rounded-t-xl bg-gradient-to-r from-yellow-700/20 to-transparent" />
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[70%] p-3 rounded-xl ${m.from === "driver" ? "ml-auto bg-yellow-700/10 border border-yellow-500/20" : "bg-yellow-500/20 border border-yellow-500/40"}`}>
            <div className="text-xs text-gray-400 mb-1">{m.from === "driver" ? "Siz" : "Partner"}</div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="p-3 flex gap-2 border-t border-yellow-500/30 bg-black/70 backdrop-blur-sm">
        <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Mesaj yazın..." className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-400" />
        <button onClick={send} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">Gönder</button>
      </div>
    </div>
  );
}