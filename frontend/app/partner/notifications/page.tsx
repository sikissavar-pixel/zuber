"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getSocket } from "@/lib/socket";
import { motion } from "framer-motion";
import { Bell, MessageSquare, Car, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DASHBOARD_THEME as THEME } from "@/components/dashboard/theme";

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  ts: number;
  read: boolean;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "chat_message":
      return <MessageSquare className="h-5 w-5" />;
    case "reservation_assigned":
      return <Car className="h-5 w-5" />;
    case "booking_completed":
      return <CheckCircle className="h-5 w-5" />;
    case "booking_update":
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "chat_message":
      return "from-blue-500/20 to-blue-600/10 border-blue-500/30";
    case "reservation_assigned":
      return "from-green-500/20 to-green-600/10 border-green-500/30";
    case "booking_completed":
      return "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30";
    case "booking_update":
      return "from-amber-500/20 to-amber-600/10 border-amber-500/30";
    default:
      return "from-[#ffcc33]/20 to-[#ffb400]/10 border-[#ffcc33]/30";
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "chat_message":
      return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    case "reservation_assigned":
      return "text-green-400 bg-green-500/20 border-green-500/30";
    case "booking_completed":
      return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    case "booking_update":
      return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    default:
      return "text-[#ffcc33] bg-[#ffcc33]/20 border-[#ffcc33]/30";
  }
};

export default function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const socket = getSocket();
    
    const addNotification = (type: string, message: string) => {
      const newNotification: NotificationItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        message,
        ts: Date.now(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
    };

    const onUpdate = (payload: any) =>
      addNotification("booking_update", payload?.message || "Rezervasyon güncellendi");
    const onMsg = (payload: any) =>
      addNotification("chat_message", `Yeni mesaj geldi (#${payload?.booking_id})`);
    const onAssigned = (payload: any) =>
      addNotification("reservation_assigned", `Sürücü atandı - Rezervasyon #${payload?.id}`);
    const onCompleted = (payload: any) =>
      addNotification("booking_completed", `Sürüş tamamlandı (#${payload?.id})`);

    socket.on("booking_update", onUpdate);
    socket.on("chat_message", onMsg);
    socket.on("reservation_assigned", onAssigned);
    socket.on("booking_completed", onCompleted);

    return () => {
      socket.off("booking_update", onUpdate);
      socket.off("chat_message", onMsg);
      socket.off("reservation_assigned", onAssigned);
      socket.off("booking_completed", onCompleted);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className={`min-h-screen ${THEME.bg} text-white font-inter`}>
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/partner/dashboard"
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-[#ffcc33]/30 bg-[#ffcc33]/10 text-[#ffcc33] hover:bg-[#ffcc33]/20 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className={`${THEME.fontHead} text-2xl md:text-3xl ${THEME.gold}`}>
                  Bildirimler
                </h1>
                <p className={`${THEME.textSecondary} text-sm mt-1`}>
                  {unreadCount > 0
                    ? `${unreadCount} okunmamış bildirim`
                    : "Tüm bildirimler okundu"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm rounded-xl border border-[#ffcc33]/30 bg-[#ffcc33]/10 text-[#ffcc33] hover:bg-[#ffcc33]/20 transition-all"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${THEME.cardBg} ${THEME.borderGlow} rounded-2xl p-12 text-center`}
              >
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full border border-[#ffcc33]/30 bg-[#ffcc33]/10 flex items-center justify-center">
                    <Bell className="h-8 w-8 text-[#ffcc33]" />
                  </div>
                </div>
                <h3 className={`${THEME.fontHead} text-xl ${THEME.textMain} mb-2`}>
                  Bildirim Yok
                </h3>
                <p className={`${THEME.textSecondary} text-sm max-w-md mx-auto`}>
                  Yeni rezervasyonlar, mesajlar ve güncellemeler burada görünecek.
                  Şu anda hiç bildiriminiz yok.
                </p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`
                    relative rounded-xl border p-5 cursor-pointer transition-all duration-300
                    bg-gradient-to-r ${getNotificationColor(notification.type)}
                    ${notification.read ? "opacity-60" : "hover:scale-[1.01]"}
                    hover:shadow-lg
                  `}
                >
                  {!notification.read && (
                    <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-[#ffcc33] animate-pulse" />
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-xl border flex items-center justify-center ${getIconColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`${THEME.fontBody} text-base ${THEME.textMain} ${!notification.read ? "font-medium" : ""}`}>
                        {notification.message}
                      </p>
                      <p className={`${THEME.textSecondary} text-xs mt-2`}>
                        {new Date(notification.ts).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-[#ffcc33]/20 bg-[#ffcc33]/5 p-4 text-center"
          >
            <p className={`${THEME.textSecondary} text-sm`}>
              💡 Bildirimler anlık olarak güncellenir. Sayfayı açık tutarak yeni bildirimleri anında görebilirsiniz.
            </p>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

