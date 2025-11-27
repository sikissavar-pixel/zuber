"use client";

import { motion } from "framer-motion";
import { Inbox, Radio, MapPin } from "lucide-react";

export function EmptyFeedState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="
        flex flex-col items-center justify-center 
        py-16 px-6 text-center
        bg-gradient-to-br from-[#0d0d0d]/80 via-[#111]/60 to-[#0a0a0a]/80
        border border-[#ffb400]/15
        rounded-2xl
        backdrop-blur-sm
      ">
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-full h-full rounded-full bg-[#ffb400]/10 blur-3xl" />
          </motion.div>
        </div>

        {/* Icon container */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-6"
        >
          <div className="
            p-6 rounded-2xl
            bg-gradient-to-br from-[#ffb400]/15 to-[#ffb400]/5
            border border-[#ffb400]/20
            shadow-[0_0_40px_rgba(255,180,0,0.15)]
          ">
            <Inbox className="w-14 h-14 text-[#ffb400]/70" strokeWidth={1} />
          </div>

          {/* Orbiting elements */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="p-2 rounded-full bg-[#0d0d0d] border border-[#ffb400]/30">
              <Radio className="w-4 h-4 text-[#ffb400]/60" />
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -left-2"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="p-2 rounded-full bg-[#0d0d0d] border border-[#ffb400]/30">
              <MapPin className="w-4 h-4 text-[#ffb400]/60" />
            </div>
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-cinzel text-2xl text-[#ffcc33] mb-3"
        >
          Bekleyen Rezervasyon Yok
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-inter text-[#888] max-w-sm leading-relaxed"
        >
          Şu an için bölgenizde yeni bir talep bulunmuyor. 
          Yeni rezervasyonlar geldiğinde burada anlık olarak görüntülenecek.
        </motion.p>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-2 text-sm text-[#666]"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-500"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span>Canlı bağlantı aktif</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

