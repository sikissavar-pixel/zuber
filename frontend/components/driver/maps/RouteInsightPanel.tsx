"use client";

import type { RouteEstimate } from "@/hooks/useRouteEstimate";
import type { DriverLocation } from "@/hooks/useDriverLocation";

type RouteInsightPanelProps = {
  route?: RouteEstimate | null;
  driverLocation?: DriverLocation | null;
  isLoading?: boolean;
};

export function RouteInsightPanel({ route, driverLocation, isLoading }: RouteInsightPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#ffcc33]/15 bg-[#050505]/60 p-4 text-sm text-[#bcbcbc]">
        Rota hesaplanıyor...
      </div>
    );
  }

  if (!route) {
    return (
      <div className="rounded-2xl border border-[#ffcc33]/15 bg-[#050505]/60 p-4 text-sm text-[#bcbcbc]">
        Aktif bir rota bulunamadı. İlk rezervasyonunuzu bekliyoruz.
      </div>
    );
  }

  const distanceKm = route.distance_meters / 1000;
  const durationMin = route.duration_seconds / 60;
  const updatedAt = driverLocation?.updated_at
    ? new Date(driverLocation.updated_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#ffcc33]/20 bg-[#050505]/80 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-[#777] mb-2">Rota özeti</p>
        <div className="space-y-3">
          <InsightRow label="Mesafe" value={`${distanceKm.toFixed(1)} km`} />
          <InsightRow label="Tahmini Süre" value={`${Math.round(durationMin)} dk`} />
          <InsightRow
            label="Tahmini Gelir"
            value={`₺${route.fare.partner_price.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`}
          />
          <InsightRow
            label="Sürücü Payı"
            value={`₺${route.fare.driver_payout.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`}
            highlight
          />
        </div>
      </div>
      <div className="rounded-2xl border border-[#ffcc33]/10 bg-[#050505]/60 p-4 text-sm text-[#bcbcbc]">
        <p className="text-xs uppercase tracking-[0.4em] text-[#555] mb-1">
          canlı durum
        </p>
        {updatedAt ? (
          <p className="text-white text-lg font-semibold">Son konum güncellemesi: {updatedAt}</p>
        ) : (
          <p>Konum paylaşımı bekleniyor...</p>
        )}
      </div>
    </div>
  );
}

function InsightRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#bcbcbc]">{label}</span>
      <span className={`font-semibold ${highlight ? "text-[#ffcc33]" : "text-white"}`}>{value}</span>
    </div>
  );
}

