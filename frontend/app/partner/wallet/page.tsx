"use client";
import React, { useCallback, useMemo, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import WalletCard from "@/components/wallet/WalletCard";

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
  const [topUpLoading, setTopUpLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/wallet/me");
      const s: WalletSummary = data?.summary || data;
      const transactions: Tx[] = data?.transactions || [];
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
  }, []);

  React.useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const partnerBalance = useMemo(() => Number(summary?.partner_balance ?? summary?.available_balance ?? 0), [summary]);
  const tripPool = useMemo(() => Number(summary?.trip_pool ?? summary?.blocked_balance ?? 0), [summary]);
  const driverBalance = useMemo(() => Number(summary?.driver_balance ?? 0), [summary]);

  const handleTestTopUp = async () => {
    if (topUpLoading) return;
    try {
      setTopUpLoading(true);
      await api.post("/api/wallet/add-test-balance", { amount: 500 });
      await fetchWallet();
      toast.success("500 ₺ başarıyla eklendi.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "Test bakiyesi eklenemedi.");
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <main className="min-h-screen bg-gradient-to-b from-[#050402] via-[#070606] to-[#000] text-white py-10">
        <div className="dashboard-shell space-y-10">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-[var(--font-display)] text-[#ffcc33]">Partner Cüzdanı</h1>
            <p className="text-sm text-zinc-400">Canlı rezervasyon akışı için minimum {MIN_REQUIRED_AMOUNT} ₺ bakiye önerilir.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <WalletCard
              title="Partner Balance"
              subtitle="Kullanılabilir bakiye"
              value={partnerBalance}
              gradient="from-[#ffcc33]/20 via-[#2b2100]/30 to-transparent"
            />
            <WalletCard
              title="Trip Pool"
              subtitle="Bloke tutar"
              value={tripPool}
              gradient="from-[#d4a200]/15 via-[#1c1500]/40 to-transparent"
            />
            <WalletCard
              title="Driver Balance"
              subtitle="Sürücü ödemeleri"
              value={driverBalance}
              gradient="from-[#ffefc2]/10 via-[#2f2000]/40 to-transparent"
            />
          </div>

          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleTestTopUp}
              disabled={topUpLoading}
              className="w-full max-w-md rounded-2xl bg-gradient-to-r from-[#ffb400] via-[#ffd966] to-[#ffb400] text-black font-semibold tracking-wide py-4 shadow-[0_0_35px_rgba(255,204,51,0.35)] hover:shadow-[0_0_45px_rgba(255,204,51,0.5)] transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {topUpLoading ? "Bakiye ekleniyor..." : "+ 500 ₺ Test Bakiye Ekle"}
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-[#ffcc33]/20 bg-black/60 backdrop-blur-xl shadow-[0_0_55px_rgba(255,204,51,0.08)]"
          >
            <div className="flex flex-col gap-2 border-b border-[#ffcc33]/15 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-yellow-500/70">Transactions</p>
                <h2 className="text-2xl font-[var(--font-display)] text-yellow-100">İşlem Geçmişi</h2>
              </div>
              <span className="text-xs text-zinc-400">Son güncelleme: {new Date().toLocaleString("tr-TR")}</span>
            </div>
            <div className="p-6 overflow-x-auto">
              {loading && <div className="text-yellow-200">Yükleniyor...</div>}
              {error && <div className="text-rose-400">{error}</div>}
              {!loading && !error && txs.length === 0 && <div className="text-yellow-200">Kayıt bulunamadı.</div>}
              {!loading && !error && txs.length > 0 && (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-zinc-400">
                      <th className="text-left px-3 py-2 font-semibold">Tür</th>
                      <th className="text-left px-3 py-2 font-semibold">Tarih</th>
                      <th className="text-left px-3 py-2 font-semibold">Açıklama</th>
                      <th className="text-left px-3 py-2 font-semibold">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map((t) => (
                      <tr key={t.id} className="border-t border-yellow-500/10 text-zinc-200">
                        <td className="px-3 py-3 text-yellow-200 font-medium">{t.type}</td>
                        <td className="px-3 py-3">{new Date(t.date).toLocaleString("tr-TR")}</td>
                        <td className="px-3 py-3 text-zinc-400">{t.description || "-"}</td>
                        <td className="px-3 py-3 text-yellow-100">{t.amount} ₺</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}