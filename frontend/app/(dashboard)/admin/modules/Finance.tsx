"use client";

import React, { useMemo, useState } from "react";
import { useFinanceSummary, useFinanceTransactions } from "../../../../hooks/useAdmin";
import { Loader2, Search, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import clsx from "clsx";

export default function AdminFinance() {
  const { data: summary, isLoading: summaryLoading } = useFinanceSummary();
  const { data: transactions = [], isLoading: transactionsLoading } = useFinanceTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "payment" | "refund" | "commission">("all");

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeSummary = summary || {
    daily_revenue: 0,
    weekly_revenue: 0,
    monthly_revenue: 0,
    yearly_revenue: 0,
    total_transactions: 0,
    total_wallet_balance: 0,
    driver_earnings: 0,
    partner_earnings: 0,
  };

  const filteredTransactions = useMemo(() => {
    let filtered = safeTransactions;
    if (typeFilter !== "all") {
      filtered = filtered.filter((t: any) => t.type === typeFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((t: any) => {
        return [t.id?.toString(), t.user_id?.toString(), t.amount?.toString(), t.description, t.reference].some((v) => v?.toLowerCase().includes(term));
      });
    }
    return filtered;
  }, [safeTransactions, typeFilter, searchTerm]);

  const stats = [
    {
      title: "Toplam Cüzdan Bakiyesi",
      value: safeSummary.total_wallet_balance || 0,
      icon: DollarSign,
      accent: "gold",
      loading: summaryLoading,
    },
    {
      title: "Sürücü Kazançları",
      value: safeSummary.driver_earnings || 0,
      icon: TrendingUp,
      accent: "emerald",
      loading: summaryLoading,
    },
    {
      title: "Partner Kazançları",
      value: safeSummary.partner_earnings || 0,
      icon: TrendingUp,
      accent: "amber",
      loading: summaryLoading,
    },
    {
      title: "Platform Komisyonu",
      value: summary?.platform_commission || 0,
      icon: DollarSign,
      accent: "gold",
      loading: summaryLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Finans Paneli</h2>
        <p className="text-sm text-zinc-400">Gelir, ödeme ve işlem yönetimi</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const palette: Record<string, string> = {
            gold: "from-[#fbd483] to-[#f3b94f]",
            emerald: "from-emerald-400/70 to-emerald-500/50",
            amber: "from-amber-300/70 to-amber-500/50",
          };
          return (
            <div key={stat.title} className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-[#b18a39] mb-3">
                <Icon className="h-4 w-4 text-[#f5c76a]" />
                {stat.title}
              </div>
              <div className="text-3xl font-cinzel text-white mb-3">
                {stat.loading ? <Loader2 className="h-6 w-6 animate-spin text-[#f5c76a]" /> : `${(stat.value || 0).toLocaleString("tr-TR")} ₺`}
              </div>
              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${palette[stat.accent]}`} />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-2 backdrop-blur-xl">
          {(["all", "payment", "refund", "commission"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-semibold transition capitalize",
                typeFilter === type ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]"
              )}
            >
              {type === "all" ? "Tümü" : type === "payment" ? "Ödeme" : type === "refund" ? "İade" : "Komisyon"}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c79a3a]" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-[#3a2a0f] bg-transparent py-2 pl-11 pr-4 text-sm text-white placeholder:text-[#8b7442] focus:border-[#f5c76a] focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#f5c76a]" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center py-20 text-zinc-500">İşlem bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2b1d07] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.4em] text-[#8c6a29]">
                  <th className="py-3 pr-4">ID</th>
                  <th className="py-3 pr-4">Tip</th>
                  <th className="py-3 pr-4">Tutar</th>
                  <th className="py-3 pr-4">Açıklama</th>
                  <th className="py-3 pr-4">Referans</th>
                  <th className="py-3 pr-4">Tarih</th>
                  <th className="py-3 text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1405]">
                {filteredTransactions.map((tx: any) => {
                  const isPositive = tx.type === "payment" || tx.type === "commission";
                  return (
                    <tr key={tx.id} className="text-zinc-200">
                      <td className="py-3 pr-4 text-[#f5c76a]">#{tx.id}</td>
                      <td className="py-3 pr-4 capitalize">{tx.type === "payment" ? "Ödeme" : tx.type === "refund" ? "İade" : "Komisyon"}</td>
                      <td className={clsx("py-3 pr-4 font-semibold flex items-center gap-1", isPositive ? "text-emerald-400" : "text-rose-400")}>
                        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {Math.abs(tx.amount || 0).toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-3 pr-4 text-zinc-400">{tx.description || "—"}</td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">{tx.reference || "—"}</td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs">{tx.created_at ? new Date(tx.created_at).toLocaleString("tr-TR") : "—"}</td>
                      <td className="py-3 text-right">
                        <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-semibold border", tx.status === "success" || tx.status === "completed" ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" : tx.status === "failed" ? "bg-rose-500/15 text-rose-200 border-rose-500/30" : "bg-amber-500/15 text-amber-200 border-amber-500/30")}>
                          {tx.status === "success" || tx.status === "completed" ? "Başarılı" : tx.status === "failed" ? "Başarısız" : "Beklemede"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

