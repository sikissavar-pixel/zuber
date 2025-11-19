"use client";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto w-full max-w-[100vw] sm:max-w-7xl px-4 sm:px-5 pt-[env(safe-area-inset-top)] py-10 sm:py-12 md:py-16 overflow-x-hidden">
        <section className="w-full rounded-2xl backdrop-blur-md bg-[#FFD54F]/85 border border-[#FFE082]/30 shadow-[0_0_40px_rgba(255,200,0,0.25)] p-6 sm:p-8 md:p-12 text-black transition-colors duration-300 hover:bg-[#FFD54F]/92 overflow-hidden">
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl lg:text-5xl leading-tight font-bold tracking-wide">Zuber • VIP Araç Transfer</h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-[#222] max-w-2xl">
            Premium, rezervasyonlu şoför hizmeti. Önceden planlayın, sürücünüzü canlı takip edin ve lüksle yolculuk edin.
          </p>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6">
            <Link href="/login"><button className="w-full md:w-auto bg-black text-yellow-300 px-6 py-3 rounded-lg hover:bg-zinc-900 transition">Giriş Yap</button></Link>
            <Link href="/partner/apply"><button className="w-full md:w-auto bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition">Partner Başvurusu</button></Link>
            <Link href="/driver/apply"><button className="w-full md:w-auto bg-black text-yellow-300 px-6 py-3 rounded-lg hover:bg-zinc-900 transition">Sürücü Başvurusu</button></Link>
          </div>
        </section>
        {/* Info Strip (Istanbul-focused) */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 sm:mt-16 bg-neutral-950/70 border-t border-yellow-500/20 rounded-2xl"
        >
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
              <div className="min-w-[220px] text-yellow-400 font-semibold text-base sm:text-lg">
                🚗 Sadece İstanbul’da Hizmet
              </div>
              <div className="min-w-[220px] text-yellow-400 font-semibold text-base sm:text-lg">
                💼 Kurumsal Partnerler ve Otellerle Entegre
              </div>
              <div className="min-w-[220px] text-yellow-400 font-semibold text-base sm:text-lg">
                ⭐ Yüksek Memnuniyet • 7/24 Rezervasyon Desteği
              </div>
            </div>
          </div>
        </motion.section>

        {/* Informational Footer (Istanbul-focused) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mt-8 relative overflow-hidden bg-gradient-to-b from-black to-[#1a1300] border-t border-yellow-900/20"
        >
          {/* Reflection overlay at the top */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#facc15]/10 to-transparent pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 py-14 relative">
            {/* Parallax glow behind title */}
            <motion.div
              initial={{ y: -10, opacity: 0.35 }}
              whileInView={{ y: 0, opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="absolute left-1/2 -translate-x-1/2 top-6 w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl"
            />

            <h2 className="relative font-[var(--font-display)] title-glow text-xl sm:text-2xl md:text-3xl text-yellow-300 text-center">
              Zuber İstanbul’da Lüks, Güvenli ve Akıllı Ulaşım
            </h2>
            <p className="mt-2 sm:mt-3 text-center text-zinc-300 max-w-3xl mx-auto text-sm sm:text-base">
              Şehir içi ve havaalanı transferlerinde premium sürücüler, QR ödeme sistemi ve anlık takip özellikleriyle yanınızdayız.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-5 sm:p-6 hover:shadow-[0_0_20px_#facc15]/30 hover:scale-105 transition"
              >
                <div className="text-xl sm:text-2xl">
                  🚘 <span className="text-yellow-400 font-semibold">VIP Araçlar</span>
                </div>
                <div className="mt-2 text-zinc-300 text-sm sm:text-base">Sadece seçilmiş premium araçlar, profesyonel sürücülerle.</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-5 sm:p-6 hover:shadow-[0_0_20px_#facc15]/30 hover:scale-105 transition"
              >
                <div className="text-xl sm:text-2xl">
                  💼 <span className="text-yellow-400 font-semibold">Partner Paneli</span>
                </div>
                <div className="mt-2 text-zinc-300 text-sm sm:text-base">Oteller ve işletmeler için özel rezervasyon yönetimi.</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-5 sm:p-6 hover:shadow-[0_0_20px_#facc15]/30 hover:scale-105 transition"
              >
                <div className="text-xl sm:text-2xl">
                  🪙 <span className="text-yellow-400 font-semibold">Cüzdan & QR Onay Sistemi</span>
                </div>
                <div className="mt-2 text-zinc-300 text-sm sm:text-base">
                  Partnerler bakiyelerini önceden yükler, her rezervasyon bu bakiyeden düşülür.
                  Sürüş tamamlandığında yolcu QR kodu okutarak işlemi onaylar, ücret otomatik olarak sürücüye aktarılır.
                </div>
              </motion.div>
            </div>

            {/* QR Flow Mini-Diagram */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm"
            >
              <div className="px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm text-yellow-300 hover:shadow-[0_0_20px_#facc15]/30">🪙 Partner Bakiye Yükler</div>
              <span className="text-yellow-400">➜</span>
              <div className="px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm text-yellow-300 hover:shadow-[0_0_20px_#facc15]/30">📍 Rezervasyon Oluşur (Bloke)</div>
              <span className="text-yellow-400">➜</span>
              <div className="px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm text-yellow-300 hover:shadow-[0_0_20px_#facc15]/30">🚘 Sürüş Tamamlanır</div>
              <span className="text-yellow-400">➜</span>
              <div className="px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm text-yellow-300 hover:shadow-[0_0_20px_#facc15]/30">🔳 Yolcu QR ile Onaylar</div>
              <span className="text-yellow-400">➜</span>
              <div className="px-3 py-2 rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm text-yellow-300 hover:shadow-[0_0_20px_#facc15]/30">💰 Ücret Sürücüye Aktarılır</div>
            </motion.div>
            <span className="text-gray-500 text-xs block mt-2 text-center">İşlemler otomatik olarak partner cüzdanından yönetilir.</span>

            <div className="mt-10 text-center text-sm text-gray-500 py-6 border-t border-yellow-900/20">
              Zuber © 2025 — İstanbul’un Akıllı VIP Transfer Platformu
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
