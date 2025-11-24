"use client";
import React, { useState } from "react";

type ChatMessage = {
  id?: number;
  booking_id?: number;
  sender_role: "partner" | "driver" | string;
  message: string;
  created_at?: string;
};

export default function ChatBox({
  messages,
  onSend,
  userRole,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  userRole: "partner" | "driver" | string;
}) {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col h-full rounded-2xl bg-black/60 backdrop-blur border border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
      <div className="p-4 border-b border-yellow-500/30 text-yellow-300 font-semibold">Sohbet</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-xl text-sm shadow-sm ${
              m.sender_role === userRole
                ? "ml-auto bg-yellow-500 text-black"
                : "mr-auto bg-zinc-800 text-yellow-200"
            }`}
          >
            <div className="opacity-80 mb-1 text-xs">
              {m.sender_role === userRole ? "Sen" : m.sender_role}
            </div>
            <div>{m.message}</div>
          </div>
        ))}
      </div>
      <form
        className="p-3 border-t border-yellow-500/30 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = text.trim();
          if (!trimmed) return;
          onSend(trimmed);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesaj yaz..."
          className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 text-yellow-200 border border-yellow-500/40 outline-none focus:ring-2 focus:ring-yellow-500/50"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}