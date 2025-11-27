"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAdminReservations } from "../../../../hooks/useReservations";
import { useLiveReservations } from "../../../../hooks/useAdmin";
import { getSocket } from "../../../../lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Calendar, MapPin, Clock, DollarSign, User, Car } from "lucide-react";
import clsx from "clsx";

type ReservationStatus = "all" | "pending" | "assigned" | "in_progress" | "completed" | "cancelled";

export default function AdminReservations() {
  const qc = useQueryClient();
  const { data: allReservations = [], isLoading: allLoading } = useAdminReservations();
  const { data: liveReservations = [], isLoading: liveLoading } = useLiveReservations();
  const [statusFilter, setStatusFilter] = useState<ReservationStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"all" | "live">("all");

  useEffect(() => {
    const socket = getSocket();
    socket.emit("admin_join");
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["admin", "live-reservations"] });
    };
    socket.on("reservation:new", refresh);
    socket.on("reservation:update", refresh);
    socket.on("reservation:completed", refresh);
    return () => {
      socket.off("reservation:new", refresh);
      socket.off("reservation:update", refresh);
      socket.off("reservation:completed", refresh);
    };
  }, [qc]);

  const safeAllReservations = Array.isArray(allReservations) ? allReservations : [];
  const safeLiveReservations = Array.isArray(liveReservations) ? liveReservations : [];

  const currentList = activeView === "live" ? safeLiveReservations : safeAllReservations;
  const isLoading = activeView === "live" ? liveLoading : allLoading;

  const filteredReservations = useMemo(() => {
    let filtered = Array.isArray(currentList) ? currentList : [];
    if (statusFilter !== "all") {
      filtered = filtered.filter((r: any) => r.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((r: any) => {
        return [r.guest_name, r.pickup_location, r.dropoff_location, r.driver_id?.toString(), r.id?.toString()].some((v) => v?.toLowerCase().includes(term));
      });
    }
    return filtered;
  }, [safeAllReservations, safeLiveReservations, activeView, statusFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    currentList.forEach((r: any) => {
      counts[r.status || "pending"] = (counts[r.status || "pending"] || 0) + 1;
    });
    return counts;
  }, [currentList]);

  const statusLabels: Record<string, string> = {
    pending: "Beklemede",
    assigned: "Atandı",
    in_progress: "Devam Ediyor",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-200 border-amber-500/30",
    assigned: "bg-blue-500/15 text-blue-200 border-blue-500/30",
    in_progress: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    completed: "bg-zinc-500/15 text-zinc-200 border-zinc-500/30",
    cancelled: "bg-rose-500/15 text-rose-200 border-rose-500/30",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Rezervasyon Yönetimi</h2>
        <p className="text-sm text-zinc-400">Tüm rezervasyonları görüntüleyin ve yönetin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {(["pending", "assigned", "in_progress", "completed", "cancelled"] as string[]).map((status) => (
          <div key={status} className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
            <div className="text-xs text-zinc-400 mb-2">{statusLabels[status] || status}</div>
            <div className="text-2xl font-cinzel text-white">{statusCounts[status] || 0}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-2 backdrop-blur-xl">
          <button
            onClick={() => setActiveView("all")}
            className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition", activeView === "all" ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]")}
          >
            Tümü
          </button>
          <button
            onClick={() => setActiveView("live")}
            className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition", activeView === "live" ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]")}
          >
            Canlı
          </button>
        </div>

        <div className="flex gap-2 rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-2 backdrop-blur-xl">
          {(["all", "pending", "assigned", "in_progress", "completed", "cancelled"] as ReservationStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-semibold transition capitalize",
                statusFilter === status ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]"
              )}
            >
              {status === "all" ? "Tümü" : statusLabels[status] || status}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#f5c76a]" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <p className="text-center py-20 text-zinc-500">Rezervasyon bulunamadı.</p>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation: any) => (
              <div key={reservation.id} className="rounded-2xl border border-[#4a340f]/60 bg-black/40 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white">#{reservation.id}</span>
                      <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-semibold border", statusColors[reservation.status] || statusColors.pending)}>
                        {statusLabels[reservation.status] || reservation.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <User className="h-4 w-4" />
                        {reservation.guest_name || "Misafir yok"}
                      </div>
                      {reservation.driver_id && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Car className="h-4 w-4" />
                          Sürücü #{reservation.driver_id}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Clock className="h-4 w-4" />
                        {new Date(reservation.pickup_time).toLocaleString("tr-TR")}
                      </div>
                      {reservation.total_amount && (
                        <div className="flex items-center gap-2 text-[#f5c76a]">
                          <DollarSign className="h-4 w-4" />
                          {typeof reservation.total_amount === "string" ? reservation.total_amount : `${reservation.total_amount} ₺`}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2 text-zinc-300">
                        <MapPin className="h-4 w-4 mt-0.5 text-emerald-400" />
                        <span>
                          <span className="text-zinc-500">Alış:</span> {reservation.pickup_location}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-zinc-300">
                        <MapPin className="h-4 w-4 mt-0.5 text-rose-400" />
                        <span>
                          <span className="text-zinc-500">Bırakış:</span> {reservation.dropoff_location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

