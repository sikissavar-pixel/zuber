"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
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
];

export default function DriverEarnings() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-4 hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip contentStyle={{ background: "#000", border: "1px solid #facc15", color: "#facc15" }} />
              <Line type="monotone" dataKey="amount" stroke="#facc15" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-4 hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">
        <div className="text-xl mb-3">Toplam Kazanç: ₺24.600</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-300">
              <tr className="text-left">
                <th className="p-2">Tarih</th>
                <th className="p-2">Tutar</th>
                <th className="p-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-yellow-500/10">
                  <td className="p-2">0{7-i}/11/2025</td>
                  <td className="p-2">₺{2600 + i*150}</td>
                  <td className="p-2">Tamamlandı</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}