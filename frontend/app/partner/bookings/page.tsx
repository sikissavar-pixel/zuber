"use client";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useMyReservations, useDrivers } from "@/hooks/useReservations";

export default function PartnerBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const { data: reservations } = useMyReservations();
  const { data: drivers } = useDrivers();

  const statusColor = (s: string) => s === "pending" ? "text-yellow-400" : s === "assigned" ? "text-green-400" : s === "completed" ? "text-blue-400" : "text-yellow-200";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-400">Rezervasyonlarım</h1>
        <Link className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition" href="/partner/bookings/new">Yeni Rezervasyon Oluştur</Link>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-black/60 backdrop-blur border border-yellow-500/40">
        <table className="min-w-full text-sm text-yellow-200">
          <thead className="text-yellow-300">
            <tr>
              <th className="px-4 py-3 text-left">Tarih</th>
              <th className="px-4 py-3 text-left">Araç</th>
              <th className="px-4 py-3 text-left">Sürücü</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3 text-left">Ücret</th>
              <th className="px-4 py-3 text-left">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {(reservations || []).map((r) => {
              const driver = drivers?.find((d) => d.id === r.driver_id);
              return (
                <tr key={r.id} className="border-t border-yellow-500/20">
                  <td className="px-4 py-3">{new Date(r.pickup_time || r.created_at || Date.now()).toLocaleString()}</td>
                  <td className="px-4 py-3">{driver?.vehicle_model || driver?.vehicle_plate || "-"}</td>
                  <td className="px-4 py-3">{driver?.full_name || "Atanmadı"}</td>
                  <td className={`px-4 py-3 font-medium ${statusColor(r.status)}`}>{r.status === "pending" ? "Bekliyor" : r.status === "assigned" ? "Atandı" : r.status === "completed" ? "Tamamlandı" : r.status}</td>
                  <td className="px-4 py-3">{r.total_amount ? `${r.total_amount} ₺` : "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/partner/bookings/${r.id}`} className="px-3 py-1 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 transition">Detay Gör</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(reservations || []).length === 0 && (
          <div className="p-4 text-yellow-200">Hiç rezervasyon bulunmuyor.</div>
        )}
      </div>
    </div>
  );
}