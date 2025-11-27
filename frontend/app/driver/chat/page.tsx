"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard, GradientText, PulsingDot } from "@/components/driver/ui";
import { MessageSquare, Paperclip, Send, Shield, Star } from "lucide-react";

type ChatMessage = {
  id: string;
  from: "driver" | "partner";
  text: string;
  timestamp: number;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "m1", from: "partner", text: "Yeni rezervasyon için hazır mısınız?", timestamp: Date.now() - 6 * 60_000 },
  { id: "m2", from: "driver", text: "Evet, 10 dakika içinde lokasyondayım.", timestamp: Date.now() - 5 * 60_000 },
];

export default function DriverChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef(getSocket());

  const partnerName = "Zuber Partner";

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const handleIncoming = (payload: any) => {
      if (!payload?.text) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          from: payload.from === "driver" ? "driver" : "partner",
          text: payload.text,
          timestamp: Date.now(),
        },
      ]);
    };
    socket.on("driver_chat_message", handleIncoming);
    return () => {
      socket.off("driver_chat_message", handleIncoming);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    const trimmed = input.trim();
    const payload: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      from: "driver",
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, payload]);
    socketRef.current.emit("driver_chat_message", { from: "driver", text: trimmed });
    setInput("");
  }, [input]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const loadOlderMessages = useCallback(() => {
    if (isLoadingHistory) return;
    setIsLoadingHistory(true);
    setTimeout(() => {
      setMessages((prev) => [
        {
          id: `old-${prev.length}`,
          from: "partner",
          text: "Geçmiş mesaj yüklendi",
          timestamp: Date.now() - 8 * 60_000,
        },
        ...prev,
      ]);
      setIsLoadingHistory(false);
    }, 500);
  }, [isLoadingHistory]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (event.currentTarget.scrollTop < 40 && !isLoadingHistory) {
        loadOlderMessages();
      }
    },
    [isLoadingHistory, loadOlderMessages]
  );

  const rightPanel = useMemo(
    () => (
      <GlassCard variant="default" className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#ffcc33]/10 border border-[#ffcc33]/30">
            <MessageSquare className="w-5 h-5 text-[#ffcc33]" />
          </div>
          <div>
            <p className="font-cinzel text-lg">Partner Detayları</p>
            <p className="text-xs text-[#888]">{partnerName}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-[#cfcfcf]">
          <p className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Doğrulanmış iş ortağı</p>
          <p className="flex items-center gap-2"><Star className="w-4 h-4 text-[#ffcc33]" /> Ortalama puan 4.9</p>
        </div>
        <div className="rounded-2xl border border-[#ffcc33]/20 bg-[#0b0b0b] p-4 text-sm text-[#b9b9b9]">
          VIP çağrıları, ödemeler ve operasyona dair bildirimler burada görünür. Sohbet penceresi kapalı olsa bile bildirimler korunur.
        </div>
      </GlassCard>
    ),
    []
  );

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffb4000d,transparent_60%)]" aria-hidden />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs tracking-[0.5em] uppercase text-[#ffcc33] flex items-center gap-2">
            <PulsingDot color="gold" size="sm" /> canlı sohbet
          </p>
          <h1 className="font-cinzel text-3xl md:text-4xl">
            <span className="text-[#f5f5f5]">Partner ile </span>
            <GradientText variant="gold">VIP iletişim</GradientText>
          </h1>
          <p className="text-sm text-[#8f8f8f]">Sohbet tüm cihazlarda dock lu görünür, mobilde tam ekran açılır.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
          <GlassCard
            variant="premium"
            className="p-0 flex flex-col h-[70vh] lg:h-[75vh]"
            glowIntensity="medium"
            aria-label="Sohbet paneli"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ffcc33]/20 bg-[#090909]/60">
              <div>
                <p className="font-cinzel text-xl">{partnerName}</p>
                <span className="text-xs text-[#888]">Hoş geldin, {user?.full_name || "Sürücü"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#b0b0b0]">
                <PulsingDot color="green" size="sm" /> çevrimiçi
              </div>
            </div>

            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto space-y-3 px-5 py-4 scroll-smooth"
              onScroll={handleScroll}
            >
              {isLoadingHistory && (
                <div className="text-center text-xs text-[#777] py-2">Geçmiş mesajlar yükleniyor...</div>
              )}
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
            </div>

            <div className="px-4 py-3 border-t border-[#ffcc33]/20 bg-[#080808]/80">
              <div className="flex items-center gap-3 rounded-2xl border border-[#ffcc33]/30 bg-[#050505]/70 px-3 py-2 focus-within:border-[#ffcc33]/60">
                <button className="p-2 rounded-xl text-[#ffcc33] hover:bg-[#ffcc33]/10" aria-label="Dosya ekle">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesaj yaz..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#777] outline-none"
                  aria-label="Mesaj yazın"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!input.trim()}
                  onClick={sendMessage}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#ffb400] to-[#ffcc33] text-black disabled:opacity-40"
                  aria-label="Mesaj gönder"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </GlassCard>

          <div className="hidden lg:block">{rightPanel}</div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isDriver = message.from === "driver";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`flex ${isDriver ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-lg transition-all ${
          isDriver
            ? "bg-gradient-to-br from-[#ffcc33] to-[#ffb400] text-[#050301] rounded-br-sm"
            : "bg-[#0c0c0c]/90 border border-[#ffcc33]/20 text-[#e2e2e2] rounded-bl-sm"
        }`}
      >
        <p>{message.text}</p>
        <span className={`mt-1 block text-[10px] ${isDriver ? "text-black/60" : "text-[#8c8c8c]"}`}>
          {new Date(message.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}
