"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ChevronDown, User, Loader2 } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";

type ChatMessage = {
  id: string;
  from: "partner" | "driver";
  text: string;
  timestamp: number;
  read?: boolean;
};

interface FloatingChatWidgetProps {
  bookingId?: number;
  partnerName?: string;
}

const MessageBubble = memo(function MessageBubble({ 
  message, 
  isOwn 
}: { 
  message: ChatMessage; 
  isOwn: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm
          ${isOwn 
            ? "bg-gradient-to-br from-[#ffb400] to-[#e6a300] text-black rounded-br-sm" 
            : "bg-[#1a1a1a] border border-[#ffb400]/20 text-[#f5f5f5] rounded-bl-sm"
          }
        `}
      >
        {/* Sender label */}
        <div className={`text-[10px] mb-1 font-medium ${isOwn ? "text-black/60" : "text-[#ffb400]/70"}`}>
          {isOwn ? "Siz" : "Partner"}
        </div>
        
        {/* Message text */}
        <p className="leading-relaxed">{message.text}</p>
        
        {/* Timestamp */}
        <div className={`text-[9px] mt-1 ${isOwn ? "text-black/50" : "text-[#666]"}`}>
          {new Date(message.timestamp).toLocaleTimeString("tr-TR", { 
            hour: "2-digit", 
            minute: "2-digit" 
          })}
        </div>
      </div>
    </motion.div>
  );
});

export function FloatingChatWidget({ bookingId, partnerName = "Partner" }: FloatingChatWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen, messages.length, scrollToBottom]);

  // Socket connection
  useEffect(() => {
    const socket = getSocket();

    const handleMessage = (payload: any) => {
      if (!payload?.text) return;
      
      const newMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: payload.from || "partner",
        text: payload.text,
        timestamp: Date.now(),
        read: isOpen,
      };

      setMessages((prev) => [...prev, newMessage]);
      
      if (!isOpen && payload.from !== "driver") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleTyping = (payload: any) => {
      if (payload?.from === "partner") {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socket.on("driver_chat_message", handleMessage);
    socket.on("chat_typing", handleTyping);

    return () => {
      socket.off("driver_chat_message", handleMessage);
      socket.off("chat_typing", handleTyping);
    };
  }, [isOpen]);

  // Load older messages (lazy loading)
  const loadOlderMessages = useCallback(async () => {
    if (isLoading || messages.length === 0) return;
    
    setIsLoading(true);
    // Simulate API call for older messages
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsLoading(false);
  }, [isLoading, messages.length]);

  // Handle scroll for lazy loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && !isLoading) {
      loadOlderMessages();
    }
  }, [loadOlderMessages, isLoading]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!input.trim()) return;

    const socket = getSocket();
    const newMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: "driver",
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("driver_chat_message", { 
      from: "driver", 
      text: input.trim(),
      booking_id: bookingId,
      driver_id: user?.id,
    });
    setInput("");
  }, [input, bookingId, user?.id]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="
              fixed bottom-20 right-4 z-50
              w-14 h-14 rounded-full
              bg-gradient-to-br from-[#ffb400] to-[#e6a300]
              shadow-[0_0_25px_rgba(255,180,0,0.4)]
              flex items-center justify-center
              hover:shadow-[0_0_35px_rgba(255,180,0,0.6)]
              transition-shadow duration-300
              lg:bottom-6 lg:right-6
            "
            aria-label="Sohbeti aç"
          >
            <MessageSquare className="w-6 h-6 text-black" />
            
            {/* Unread badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="
                  absolute -top-1 -right-1
                  w-5 h-5 rounded-full
                  bg-rose-500 text-white text-xs font-bold
                  flex items-center justify-center
                  shadow-lg
                "
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-[#ffb400]"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="
              fixed z-50
              bottom-0 right-0 left-0 h-[50vh]
              lg:bottom-6 lg:right-6 lg:left-auto
              lg:w-[380px] lg:h-[500px] lg:max-h-[70vh]
              lg:rounded-2xl
              bg-[#0a0a0a]/98 backdrop-blur-xl
              border border-[#ffb400]/20
              shadow-[0_0_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,180,0,0.1)]
              flex flex-col overflow-hidden
            "
            role="dialog"
            aria-label="Sohbet paneli"
          >
            {/* Header */}
            <div className="
              flex items-center justify-between px-4 py-3
              bg-gradient-to-r from-[#0d0d0d] to-[#111]
              border-b border-[#ffb400]/20
            ">
              <div className="flex items-center gap-3">
                <div className="
                  w-9 h-9 rounded-full
                  bg-gradient-to-br from-[#ffb400]/30 to-[#ffb400]/10
                  border border-[#ffb400]/30
                  flex items-center justify-center
                ">
                  <User className="w-4 h-4 text-[#ffb400]" />
                </div>
                <div>
                  <h3 className="font-cinzel text-sm text-[#f5f5f5]">{partnerName}</h3>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-[10px] text-[#666]">Çevrimiçi</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="
                  p-2 rounded-lg
                  hover:bg-[#ffb400]/10 
                  text-[#888] hover:text-[#ffb400]
                  transition-colors
                "
                aria-label="Sohbeti kapat"
              >
                <ChevronDown className="w-5 h-5 lg:hidden" />
                <X className="w-5 h-5 hidden lg:block" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-5 h-5 text-[#ffb400] animate-spin" />
                </div>
              )}

              {/* Empty state */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="
                    w-16 h-16 rounded-full mb-4
                    bg-[#ffb400]/10 border border-[#ffb400]/20
                    flex items-center justify-center
                  ">
                    <MessageSquare className="w-7 h-7 text-[#ffb400]/50" />
                  </div>
                  <p className="text-sm text-[#666]">Henüz mesaj yok</p>
                  <p className="text-xs text-[#444] mt-1">Partner ile iletişime geçin</p>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.from === "driver"}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-[#666]"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#ffb400]/50"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <span>Partner yazıyor...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="
              p-3 
              bg-gradient-to-t from-[#0a0a0a] to-transparent
              border-t border-[#ffb400]/10
            ">
              <div className="
                flex items-center gap-2 p-1.5
                bg-[#111] rounded-xl
                border border-[#ffb400]/20
                focus-within:border-[#ffb400]/40
                focus-within:shadow-[0_0_15px_rgba(255,180,0,0.1)]
                transition-all
              ">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Mesaj yaz..."
                  className="
                    flex-1 px-3 py-2.5
                    bg-transparent text-[#f5f5f5] text-sm
                    placeholder-[#666]
                    outline-none
                  "
                  aria-label="Mesaj yazın"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="
                    p-2.5 rounded-lg
                    bg-gradient-to-br from-[#ffb400] to-[#e6a300]
                    text-black
                    disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-[0_0_15px_rgba(255,180,0,0.3)]
                    hover:shadow-[0_0_20px_rgba(255,180,0,0.5)]
                    transition-all
                  "
                  aria-label="Mesaj gönder"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Gold accent line */}
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#ffb400]/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

