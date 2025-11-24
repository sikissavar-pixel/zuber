"use client";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <main className="container pt-20 pb-16 md:pt-24 md:pb-24">
        {/* Hero Section */}
        <section className="w-full rounded-2xl backdrop-blur-md bg-[#FFD54F]/90 border border-[#FFE082]/30 shadow-[0_0_50px_rgba(255,200,0,0.3)] p-8 md:p-16 text-black text-center transition-colors duration-300 hover:bg-[#FFD54F] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="font-cinzel text-4xl md:text-6xl lg:text-7xl leading-tight font-bold tracking-wide mb-6">
              Zuber • VIP Araç Transfer
            </h1>
            <p className="text-lg md:text-xl font-medium text-[#111] max-w-2xl mx-auto mb-10">
              Premium, rezervasyonlu şoför hizmeti. Önceden planlayın, sürücünüzü canlı takip edin ve lüksle yolculuk edin.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <button className="w-full sm:w-auto bg-black text-yellow-400 px-8 py-4 rounded-lg font-bold hover:bg-zinc-900 hover:scale-105 transition-all shadow-xl">
                  Giriş Yap
                </button>
              </Link>
              <Link href="/partner/apply">
                <button className="w-full sm:w-auto bg-white/90 text-black px-8 py-4 rounded-lg font-bold hover:bg-white hover:scale-105 transition-all shadow-xl">
                  Partner Başvurusu
                </button>
              </Link>
              <Link href="/driver/apply">
                <button className="w-full sm:w-auto bg-black/80 text-white px-8 py-4 rounded-lg font-bold hover:bg-black hover:scale-105 transition-all shadow-xl">
                  Sürücü Başvurusu
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Info Strip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 border-y border-yellow-500/20 bg-zinc-900/30 backdrop-blur-sm py-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-yellow-400 font-semibold text-lg">
              🚗 Sadece İstanbul’da Hizmet
            </div>
            <div className="text-yellow-400 font-semibold text-lg">
              💼 Kurumsal & Otel Entegrasyonu
            </div>
            <div className="text-yellow-400 font-semibold text-lg">
              ⭐ 7/24 VIP Rezervasyon Desteği
            </div>
          </div>
        </motion.section>

        {/* Feature Cards */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-3xl md:text-4xl text-yellow-400 title-glow mb-4">
              Zuber İstanbul’da Lüks & Akıllı Ulaşım
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Şehir içi ve havaalanı transferlerinde premium sürücüler, QR ödeme sistemi ve anlık takip özellikleriyle yanınızdayız.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div className="vip-card p-8 text-center">
              <div className="text-4xl mb-4">🚘</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">VIP Araçlar</h3>
              <p className="text-zinc-400 text-sm">Sadece seçilmiş premium araçlar, profesyonel sürücülerle hizmetinizde.</p>
            </motion.div>

            <motion.div className="vip-card p-8 text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Partner Paneli</h3>
              <p className="text-zinc-400 text-sm">Oteller ve işletmeler için özel rezervasyon ve filo yönetimi.</p>
            </motion.div>

            <motion.div className="vip-card p-8 text-center">
              <div className="text-4xl mb-4">🪙</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">QR Cüzdan</h3>
              <p className="text-zinc-400 text-sm">Güvenli ödeme, bakiye yönetimi ve temassız işlem kolaylığı.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Process Flow */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t border-zinc-800 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm md:text-base font-medium text-zinc-300">
            <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-700">🪙 Bakiye Yükle</div>
            <span className="text-yellow-500">➜</span>
            <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-700">📍 Rezervasyon Yap</div>
            <span className="text-yellow-500">➜</span>
            <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-700">🚘 Sürüş Keyfi</div>
            <span className="text-yellow-500">➜</span>
            <div className="bg-zinc-900 px-4 py-2 rounded-full border border-zinc-700">🔳 QR Onay</div>
          </div>
          
          <div className="mt-16 text-zinc-600 text-sm">
            Zuber © 2025 — İstanbul’un Akıllı VIP Transfer Platformu
          </div>
        </motion.section>
      </main>
    </div>
  );
}
