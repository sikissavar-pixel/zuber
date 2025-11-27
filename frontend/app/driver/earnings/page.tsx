"use client";

import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard, GradientText, AnimatedCounter } from "@/components/driver/ui";
import { TrendingUp } from "lucide-react";

const DATA_BY_YEAR: Record<string, { month: string; amount: number }[]> = {
  "2025": [
    { month: "Oca", amount: 3200 },
    { month: "Şub", amount: 2800 },
    { month: "Mar", amount: 3500 },
    { month: "Nis", amount: 4100 },
    { month: "May", amount: 4600 },
    { month: "Haz", amount: 4900 },
    { month: "Tem", amount: 5200 },
    { month: "Ağu", amount: 4800 },
    { month: "Eyl", amount: 5300 },
    { month: "Eki", amount: 5100 },
    { month: "Kas", amount: 5400 },
    { month: "Ara", amount: 5500 },
  ],
  "2024": [
    { month: "Oca", amount: 2100 },
    { month: "Şub", amount: 2600 },
    { month: "Mar", amount: 3000 },
    { month: "Nis", amount: 3300 },
    { month: "May", amount: 3700 },
    { month: "Haz", amount: 4200 },
    { month: "Tem", amount: 4500 },
    { month: "Ağu", amount: 4300 },
    { month: "Eyl", amount: 4700 },
    { month: "Eki", amount: 4800 },
    { month: "Kas", amount: 5000 },
    { month: "Ara", amount: 5200 },
  ],
};

const TABLE_DATA = [
  { id: 1, date: "03/11/2025", amount: 2650, route: "Çırağan → IST", status: "completed" },
  { id: 2, date: "04/11/2025", amount: 1980, route: "Swissôtel → SAW", status: "processing" },
  { id: 3, date: "05/11/2025", amount: 3120, route: "Raffles → IST", status: "completed" },
  { id: 4, date: "06/11/2025", amount: 2750, route: "The Peninsula → IST", status: "pending" },
  { id: 5, date: "07/11/2025", amount: 2880, route: "Mandarin → IST", status: "completed" },
  { id: 6, date: "08/11/2025", amount: 3010, route: "Bosphorus Palace → SAW", status: "completed" },
];

export default function DriverEarnings() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [range, setRange] = useState("year");

  const chartData = useMemo(() => DATA_BY_YEAR[selectedYear], [selectedYear]);
  const total = useMemo(() => chartData.reduce((sum, item) => sum + item.amount, 0), [chartData]);

  return (
    <div className="space-y-6">
      <GlassCard variant="premium" glowIntensity="strong" className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-[#ffcc33]">kazanç raporu</p>
            <h1 className="font-cinzel text-3xl md:text-4xl mt-2">
              <span className="text-[#f5f5f5]">Toplam </span>
              <GradientText variant="gold">kazanç</GradientText>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <AnimatedCounter value={total} suffix="₺" className="text-4xl font-cinzel text-[#ffcc33]" />
              <span className="flex items-center gap-1 text-emerald-400 text-sm">
                <TrendingUp className="w-4 h-4" /> %18
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="space-y-1 text-[#bdbdbd]">
              <span>Yıl</span>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="bg-[#050505]/90 border border-[#ffcc33]/30 rounded-xl px-3 py-2 focus:border-[#ffcc33]/70 outline-none"
              >
                {Object.keys(DATA_BY_YEAR).map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-[#bdbdbd]">
              <span>Aralık</span>
              <select
                value={range}
                onChange={(event) => setRange(event.target.value)}
                className="bg-[#050505]/90 border border-[#ffcc33]/30 rounded-xl px-3 py-2 focus:border-[#ffcc33]/70 outline-none"
              >
                <option value="year">Yıllık</option>
                <option value="quarter">Çeyreklik</option>
                <option value="month">Aylık</option>
              </select>
            </label>
          </div>
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-cinzel text-lg">Aylık Trend</p>
          <span className="text-xs text-[#888]">{selectedYear}</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="month" stroke="#777" />
              <YAxis stroke="#777" />
              <Tooltip contentStyle={{ background: "#050505", border: "1px solid #ffcc33", color: "#ffcc33" }} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#ffcc33"
                strokeWidth={3}
                dot={{ stroke: "#ffcc33", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard variant="default" className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ffcc33]/15 flex items-center justify-between">
          <p className="font-cinzel text-lg">Son Transferler</p>
          <span className="text-xs uppercase tracking-[0.3em] text-[#888]">gelir kaydı</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-[#050505] text-[#a1a1a1] uppercase text-xs tracking-[0.3em]">
              <tr>
                <th className="px-5 py-3 text-left">Tarih</th>
                <th className="px-5 py-3 text-left">Güzergah</th>
                <th className="px-5 py-3 text-left">Tutar</th>
                <th className="px-5 py-3 text-left">Durum</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_DATA.map((row) => (
                <tr key={row.id} className="border-t border-[#ffcc33]/10 hover:bg-[#0b0b0b] transition-colors">
                  <td className="px-5 py-4">{row.date}</td>
                  <td className="px-5 py-4 text-[#f5f5f5]">{row.route}</td>
                  <td className="px-5 py-4 font-semibold text-[#ffcc33]">₺{row.amount.toLocaleString("tr-TR")}</td>
                  <td className="px-5 py-4">
                    <EarningStatusBadge status={row.status as EarningStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

type EarningStatus = "completed" | "pending" | "processing";

function EarningStatusBadge({ status }: { status: EarningStatus }) {
  const map: Record<EarningStatus, { label: string; classes: string }> = {
    completed: { label: "Tamamlandı", classes: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" },
    pending: { label: "Beklemede", classes: "bg-amber-500/10 text-amber-300 border border-amber-500/30" },
    processing: { label: "İşleniyor", classes: "bg-blue-500/10 text-blue-200 border border-blue-500/30" },
  };
  const { label, classes } = map[status];
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${classes}`}>{label}</span>;
}
