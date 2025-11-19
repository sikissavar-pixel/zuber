"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../lib/api";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, Coins, ChartBar, ArrowDownUp } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { getSocket } from "../../../lib/socket";

type Stats = {
  available_balance: string;
  blocked_balance: string;
  updated_at: string;
  total_commission: number;
  total_payouts: number;
  total_holds: number;
  daily_chart: { date: string; amount: number }[];
};

type Tx = { id: number; date: string; type: string; category?: string | null; amount: number; description?: string | null; icon?: string };

const GOLD = "#FFD166";
const GOLD_DARK = "#C5A052";
const BLUE = "#72A6FF";
const GREEN = "#5AD68A";
const ORANGE = "#FFB562";
const BG = "#0a0a0a";
const BG2 = "#1a1100";

const MIN_REQUIRED_AMOUNT = 500;

function CountUp({ value }: { value: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const step = Math.max(16, duration / 60);
    const inc = (value - start) / (duration / step);
    const i = setInterval(() => {
      start += inc;
      if ((inc >= 0 && start >= value) || (inc < 0 && start <= value)) {
        setV(value);
        clearInterval(i);
      } else setV(start);
    }, step);
    return () => clearInterval(i);
  }, [value]);
  return <span>{v.toFixed(2)}</span>;
}

export default function PartnerWalletPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [topupOpen, setTopupOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("1000");
  const [topupDesc, setTopupDesc] = useState("");
  const [payoutDriverId, setPayoutDriverId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("500");
  const [payoutDesc, setPayoutDesc] = useState("");

  const fetchAll = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    setError(null);
    try {
      const sRes = await api.get("/api/partner/wallet/stats");
      setStats(sRes.data);
      const tRes = await api.get(`/api/partner/wallet/transactions?page=${p}&limit=${l}`);
      setTxs(tRes.data.items);
      setTotal(tRes.data.total);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Cüzdan bilgileri alınamadı");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const socket = getSocket();
    if (user?.id) socket.emit("role_join", { role: "partner", user_id: user.id });
    const handler = () => fetchAll(1, limit);
    socket.on("wallet_updated", handler);
    return () => { socket.off("wallet_updated", handler); };
  }, [user?.id, limit, fetchAll]);

  const partnerBalance = useMemo(() => Number(stats?.available_balance ?? 0), [stats]);
  const tripPool = useMemo(() => Number(stats?.blocked_balance ?? 0), [stats]);
  const driverBalance = useMemo(() => 0, []); // placeholder
  const canCreateReservation = partnerBalance >= MIN_REQUIRED_AMOUNT;

  const handleNewReservation = (e: React.MouseEvent) => {
    if (!canCreateReservation) {
      e.preventDefault();
      toast.error("Bakiye yetersiz. Lütfen cüzdanınıza bakiye ekleyin.");
    }
  };

  const filteredSorted = useMemo(() => {
    let arr = [...txs];
    if (typeFilter) arr = arr.filter((t) => t.type === typeFilter || t.category === typeFilter);
    arr.sort((a, b) => {
      if (sortBy === "date") {
        const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
        return sortDir === "asc" ? da - db : db - da;
      }
      return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
    });
    return arr;
  }, [txs, typeFilter, sortBy, sortDir]);

  const exportCsv = async () => {
    try {
      const res = await api.get(`/api/partner/wallet/transactions?page=1&limit=1000`);
      const rows: Tx[] = res.data.items || [];
      const header = "id,type,category,amount,date,description\n";
      const body = rows.map((t) => `${t.id},${t.type},${t.category || ""},${t.amount},${t.date},"${(t.description || "").replace(/"/g, '"')}"`).join("\n");
      const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `wallet-transactions-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV indirildi");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e?.message || "CSV indirilemedi");
    }
  };

  const pieData = [
    { name: "Komisyon", value: stats?.total_commission || 0, color: ORANGE },
    { name: "Sürücü Ödemesi", value: stats?.total_payouts || 0, color: GREEN },
    { name: "Bloke", value: stats?.total_holds || 0, color: BLUE },
  ];

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <main className="min-h-screen text-gray-200 font-inter" style={{ background: `radial-gradient(circle at 20% 0%, ${BG2}, ${BG} 60%)` }}>
        <div className="mx-auto max-w-7xl px-4 py-10 space-y-10">
          <div className="flex items-center justify-between">
            <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-yellow-300">Partner Cüzdanı</h1>
            <div className="flex gap-3">
              <Link href="/partner" className="px-4 py-2 rounded-xl bg-neutral-900/60 text-zinc-200 border border-yellow-500/30 hover:shadow-[0_0_20px_#facc15]/30">Panel</Link>
              <Link href="/partner/bookings/new" onClick={handleNewReservation} className={`px-4 py-2 rounded-xl transition ${canCreateReservation ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-yellow-900/20 text-yellow-300 cursor-not-allowed"}`}>Yeni Rezervasyon</Link>
            </div>
          </div>

          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Partner Bakiyesi", icon: Wallet, value: partnerBalance, sub: stats?.updated_at },
              { title: "Trip Pool (Bloke)", icon: Coins, value: tripPool, sub: stats?.updated_at },
              { title: "Sürücü Bakiyesi", icon: ArrowDownUp, value: driverBalance, sub: stats?.updated_at },
            ].map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 + i * 0.05 }}
                className="relative rounded-xl border border-yellow-500/20 bg-black/60 backdrop-blur-sm p-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "0 0 40px rgba(255,209,102,0.08) inset" }} />
                <div className="flex items-center gap-3">
                  <c.icon className="w-6 h-6 text-yellow-400" />
                  <div className="text-xl font-semibold text-yellow-300">{c.title}</div>
                </div>
                <div className="mt-2 text-3xl font-bold text-yellow-400">
                  <CountUp value={Number(c.value || 0)} /> ₺
                </div>
                <div className="mt-1 text-xs text-zinc-400">Son güncelleme {c.sub ? new Date(c.sub).toLocaleString() : "-"}</div>
              </motion.div>
            ))}
          </div>

          {/* Analytics Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="rounded-2xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChartBar className="w-6 h-6 text-yellow-400" />
              <div className="text-yellow-300 text-lg font-semibold">Finans Özeti</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111", border: `1px solid ${GOLD_DARK}`, color: "#eee" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-2">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats?.daily_chart || []}>
                    <XAxis dataKey="date" stroke="#bbb" tick={{ fill: "#bbb", fontSize: 12 }} />
                    <YAxis stroke="#bbb" tick={{ fill: "#bbb", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#111", border: `1px solid ${GOLD_DARK}`, color: "#eee" }} />
                    <Bar dataKey="amount" fill={GOLD} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-yellow-500/20 p-4">
                <div className="text-zinc-400 text-xs">Toplam Komisyon</div>
                <div className="text-yellow-300 text-2xl font-bold">₺{(stats?.total_commission || 0).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-yellow-500/20 p-4">
                <div className="text-zinc-400 text-xs">Toplam Sürücü Ödemesi</div>
                <div className="text-yellow-300 text-2xl font-bold">₺{(stats?.total_payouts || 0).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-yellow-500/20 p-4">
                <div className="text-zinc-400 text-xs">Toplam Bloke</div>
                <div className="text-yellow-300 text-2xl font-bold">₺{(stats?.total_holds || 0).toLocaleString()}</div>
              </div>
            </div>
          </motion.div>

          {/* Transactions Table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="rounded-2xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-yellow-500/20 flex items-center justify-between">
              <div className="text-yellow-300 text-lg font-semibold">İşlem Geçmişi</div>
              <div className="flex gap-2">
                <button onClick={() => setTypeFilter(null)} className={`px-3 py-1 rounded-md border ${typeFilter===null?"border-yellow-400 text-yellow-300":"border-zinc-700 text-zinc-300"}`}>Tümü</button>
                <button onClick={() => setTypeFilter("driver_payout")} className={`px-3 py-1 rounded-md border ${typeFilter==="driver_payout"?"border-yellow-400 text-yellow-300":"border-zinc-700 text-zinc-300"}`}>💸</button>
                <button onClick={() => setTypeFilter("commission")} className={`px-3 py-1 rounded-md border ${typeFilter==="commission"?"border-yellow-400 text-yellow-300":"border-zinc-700 text-zinc-300"}`}>⚙️</button>
                <button onClick={() => setTypeFilter("reservation_hold")} className={`px-3 py-1 rounded-md border ${typeFilter==="reservation_hold"?"border-yellow-400 text-yellow-300":"border-zinc-700 text-zinc-300"}`}>🧾</button>
                <button onClick={exportCsv} className="px-3 py-1 rounded-md border border-yellow-600/40 text-yellow-300 hover:bg-yellow-900/20">Tümünü Dışa Aktar</button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs text-zinc-400">Sırala:</label>
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value as any)} className="bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                  <option value="date">Tarih</option>
                  <option value="amount">Tutar</option>
                </select>
                <select value={sortDir} onChange={(e)=>setSortDir(e.target.value as any)} className="bg-black border border-zinc-700 rounded-md px-2 py-1 text-sm">
                  <option value="desc">Azalan</option>
                  <option value="asc">Artan</option>
                </select>
              </div>
              {loading && <div className="text-yellow-200">Yükleniyor...</div>}
              {error && <div className="text-rose-400">{error}</div>}
              {!loading && !error && filteredSorted.length === 0 && <div className="text-yellow-200">Kayıt bulunamadı.</div>}
              {!loading && !error && filteredSorted.length > 0 && (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-zinc-400">
                      <th className="text-left px-3 py-2">Tür</th>
                      <th className="text-left px-3 py-2">Açıklama</th>
                      <th className="text-left px-3 py-2">Tutar</th>
                      <th className="text-left px-3 py-2">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSorted.map((t) => (
                      <tr key={t.id} className="border-t border-yellow-500/20 hover:bg-yellow-950/20">
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-2 ${t.type === "driver_payout" ? "text-green-400" : t.type === "commission" ? "text-orange-300" : t.type === "reservation_hold" ? "text-blue-300" : "text-yellow-300"}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-zinc-300">{t.description || "-"}</td>
                        <td className="px-3 py-2 text-zinc-200">₺{Number(t.amount).toFixed(2)}</td>
                        <td className="px-3 py-2">{new Date(t.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-zinc-400">Toplam {total} kayıt</div>
                <div className="flex items-center gap-2">
                  <button disabled={page<=1} onClick={()=>{const p=page-1; setPage(p); fetchAll(p, limit);}} className="px-3 py-1 rounded-md border border-zinc-700 disabled:opacity-50">Önceki</button>
                  <span className="text-sm">{page}</span>
                  <button disabled={(page*limit)>=total} onClick={()=>{const p=page+1; setPage(p); fetchAll(p, limit);}} className="px-3 py-1 rounded-md border border-zinc-700 disabled:opacity-50">Sonraki</button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            className="rounded-2xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-6">
            <div className="text-yellow-300 text-lg font-semibold mb-4">Hızlı İşlemler</div>
            <div className="flex flex-wrap gap-3">
              <button onClick={()=>setTopupOpen(true)} className="px-4 py-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400">💳 Bakiye Yükle</button>
              <button onClick={()=>setPayoutOpen(true)} className="px-4 py-2 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400">🏦 Sürücü Ödemesi Yap</button>
              <button onClick={exportCsv} className="px-4 py-2 rounded-xl bg-neutral-900/60 text-zinc-200 border border-yellow-500/30">📈 Cüzdan Raporu Al (CSV)</button>
            </div>
            {topupOpen && (
              <div className="mt-4 p-4 rounded-xl border border-yellow-500/30 bg-black/70">
                <div className="text-sm text-zinc-300 mb-2">Bakiye Yükle</div>
                <div className="flex gap-2">
                  <input value={topupAmount} onChange={(e)=>setTopupAmount(e.target.value)} placeholder="Miktar (₺)" className="flex-1 bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200" />
                  <input value={topupDesc} onChange={(e)=>setTopupDesc(e.target.value)} placeholder="Açıklama" className="flex-1 bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200" />
                  <button onClick={async()=>{
                    try { await api.post("/api/partner/wallet/topup", { amount: Number(topupAmount||0), description: topupDesc }); toast.success("Bakiye yüklendi"); setTopupOpen(false); fetchAll(); } catch(e:any){ toast.error(e?.response?.data?.detail||e?.message||"İşlem başarısız"); }
                  }} className="px-4 py-2 rounded-md bg-yellow-500 text-black">Onay</button>
                </div>
              </div>
            )}
            {payoutOpen && (
              <div className="mt-4 p-4 rounded-xl border border-yellow-500/30 bg-black/70">
                <div className="text-sm text-zinc-300 mb-2">Sürücü Ödemesi</div>
                <div className="flex gap-2">
                  <input value={payoutDriverId} onChange={(e)=>setPayoutDriverId(e.target.value)} placeholder="Sürücü ID" className="flex-1 bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200" />
                  <input value={payoutAmount} onChange={(e)=>setPayoutAmount(e.target.value)} placeholder="Miktar (₺)" className="flex-1 bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200" />
                  <input value={payoutDesc} onChange={(e)=>setPayoutDesc(e.target.value)} placeholder="Açıklama" className="flex-1 bg-black border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200" />
                  <button onClick={async()=>{
                    try { await api.post("/api/partner/wallet/payments/manual", { driver_id: Number(payoutDriverId||0), amount: Number(payoutAmount||0), description: payoutDesc }); toast.success("Ödeme yapıldı"); setPayoutOpen(false); fetchAll(); } catch(e:any){ toast.error(e?.response?.data?.detail||e?.message||"İşlem başarısız"); }
                  }} className="px-4 py-2 rounded-md bg-yellow-500 text-black">Onay</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}