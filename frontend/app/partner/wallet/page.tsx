"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

type WalletSummary = {
  available_balance: string | number;
  blocked_balance: string | number;
  partner_balance?: string | number;
  driver_balance?: string | number;
  trip_pool?: string | number;
};

type Tx = { id: number; date: string; type: string; amount: string; description?: string | null };

const MIN_REQUIRED_AMOUNT = 500; // İstanbul mantığı: rezervasyon için min bakiye eşik değeri (₺)

export default function PartnerWalletPage() {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/api/wallet/me");
        const s: WalletSummary = data?.summary || data;
        const transactions: Tx[] = data?.transactions || [];
        // İstanbul'a özel mapping: partner_balance=available_balance, trip_pool=blocked_balance, driver_balance rapor amaçlı (0)
        const mapped: WalletSummary = {
          available_balance: s?.available_balance ?? 0,
          blocked_balance: s?.blocked_balance ?? 0,
          partner_balance: s?.partner_balance ?? s?.available_balance ?? 0,
          driver_balance: s?.driver_balance ?? 0,
          trip_pool: s?.trip_pool ?? s?.blocked_balance ?? 0,
        };
        setSummary(mapped);
        setTxs(transactions);
      } catch (e: any) {
        setError(e?.response?.data?.detail || e?.message || "Cüzdan bilgileri alınamadı");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const partnerBalance = useMemo(() => Number(summary?.partner_balance ?? summary?.available_balance ?? 0), [summary]);
  const tripPool = useMemo(() => Number(summary?.trip_pool ?? summary?.blocked_balance ?? 0), [summary]);
  const driverBalance = useMemo(() => Number(summary?.driver_balance ?? 0), [summary]);

  const canCreateReservation = partnerBalance >= MIN_REQUIRED_AMOUNT;

  const handleNewReservation = (e: React.MouseEvent) => {
    if (!canCreateReservation) {
      e.preventDefault();
      toast.error("Bakiye yetersiz. Lütfen cüzdanınıza bakiye ekleyin.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-10 bg-black min-h-screen text-gray-200 font-inter">
        <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-yellow-300 title-glow">Partner Cüzdanı</h1>

        {/* Balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-6 hover:shadow-[0_0_20px_#facc15]/30">
            <div className="text-xl font-semibold text-yellow-300">🪙 Partner Bakiyesi</div>
            <div className="mt-2 text-3xl font-bold text-yellow-400">{partnerBalance.toFixed(2)} ₺</div>
            <div className="mt-1 text-sm text-zinc-400">Yeni rezervasyonlar için kullanılabilir bakiye</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-6 hover:shadow-[0_0_20px_#facc15]/30">
            <div className="text-xl font-semibold text-yellow-300">🔒 Trip Pool (Bloke)</div>
            <div className="mt-2 text-3xl font-bold text-yellow-400">{tripPool.toFixed(2)} ₺</div>
            <div className="mt-1 text-sm text-zinc-400">Rezerve edilen sürüşler için bloke edilen tutar</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-6 hover:shadow-[0_0_20px_#facc15]/30">
            <div className="text-xl font-semibold text-yellow-300">💰 Sürücü Bakiyesi</div>
            <div className="mt-2 text-3xl font-bold text-yellow-400">{driverBalance.toFixed(2)} ₺</div>
            <div className="mt-1 text-sm text-zinc-400">Tamamlanan sürüşlerden sürücüye aktarılacak toplam</div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/partner/bookings/new" onClick={handleNewReservation} className={`px-5 py-3 rounded-xl transition ${canCreateReservation ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-yellow-900/20 text-yellow-300 cursor-not-allowed"}`}>
            Yeni Rezervasyon
          </Link>
          <Link href="/partner" className="px-5 py-3 rounded-xl bg-neutral-900/60 text-zinc-200 border border-yellow-500/30 hover:shadow-[0_0_20px_#facc15]/30">
            Partner Paneline Dön
          </Link>
          {!canCreateReservation && (
            <span className="text-sm text-yellow-300">Minimum {MIN_REQUIRED_AMOUNT} ₺ bakiye gereklidir.</span>
          )}
        </div>

        {/* Transactions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="rounded-2xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-yellow-500/20">
            <div className="text-yellow-300 text-lg font-semibold">İşlem Geçmişi</div>
          </div>
          <div className="p-6 overflow-x-auto">
            <span className="text-gray-500 text-xs block mt-2">İşlemler otomatik olarak partner cüzdanından yönetilir.</span>
            {loading && <div className="text-yellow-200">Yükleniyor...</div>}
            {error && <div className="text-rose-400">{error}</div>}
            {!loading && !error && txs.length === 0 && <div className="text-yellow-200">Kayıt bulunamadı.</div>}
            {!loading && !error && txs.length > 0 && (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-zinc-400">
                    <th className="text-left px-3 py-2">Tür</th>
                    <th className="text-left px-3 py-2">Tarih</th>
                    <th className="text-left px-3 py-2">Açıklama</th>
                    <th className="text-left px-3 py-2">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((t) => (
                    <tr key={t.id} className="border-t border-yellow-500/20">
                      <td className="px-3 py-2 text-yellow-300 font-medium">{t.type}</td>
                      <td className="px-3 py-2">{new Date(t.date).toLocaleString()}</td>
                      <td className="px-3 py-2 text-zinc-300">{t.description || "-"}</td>
                      <td className="px-3 py-2 text-zinc-200">{t.amount} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </main>
    </ProtectedRoute>
  );
}