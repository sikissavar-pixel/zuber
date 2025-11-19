"use client";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/Button";
import { motion } from "framer-motion";

export default function BasvuruPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="card rounded-2xl p-8 gold-glass"
        >
          <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--gold)] title-glow">Başvuru Merkezi</h1>
          <p className="mt-3 max-w-2xl text-zinc-200">Zuber ağına katılmak için aşağıdaki seçeneklerden size uygun olanı seçin.</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="card gold-glass p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-xl text-[var(--gold)]">Partner Başvurusu</h3>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M6 21V7h12v14M8 11h3M13 11h3" stroke="#FFCA28" strokeWidth="1.5"/></svg>
              </div>
              <p className="mt-2 text-sm text-zinc-300">Otel veya rezidans olarak misafirlerinize VIP transfer ayrıcalığı sunmak için başvurun.</p>
              <div className="mt-4">
                <Link href="/partner/apply"><Button className="btn-shimmer">Partner Başvurusu</Button></Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="card gold-glass p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel text-xl text-[var(--gold)]">Sürücü Başvurusu</h3>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#FFCA28" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="#FFCA28"/><path d="M6 12h4M14 12h4" stroke="#FFCA28" strokeWidth="1.5"/></svg>
              </div>
              <p className="mt-2 text-sm text-zinc-300">Zuber Sürücü Ağı’na katılıp premium misafirlere özel sürüş deneyimi yaşatın.</p>
              <div className="mt-4">
                <Link href="/driver/apply"><Button className="btn-shimmer">Sürücü Başvurusu</Button></Link>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}