"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDriverLocations } from "../../../../hooks/useAdmin";
import { getSocket } from "../../../../lib/socket";
import { Loader2, Car, Navigation } from "lucide-react";

type DriverLocation = {
  driver_id: number;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  status?: string;
};

export default function AdminLiveMap() {
  const { data: initialLocations = [], isLoading } = useDriverLocations();
  const [drivers, setDrivers] = useState<DriverLocation[]>(initialLocations);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    setDrivers(initialLocations);
  }, [initialLocations]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const loadMap = async () => {
      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");

        const mapInstance = L.map(mapRef.current!).setView([41.0082, 28.9784], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
        }).addTo(mapInstance);

        setMap(mapInstance);
      } catch (err) {
        console.error("Map load error:", err);
      }
    };

    loadMap();
  }, []);

  useEffect(() => {
    if (!map || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      drivers.forEach((driver) => {
        const statusColor = driver.status === "on_ride" ? "#ef4444" : driver.status === "idle" ? "#10b981" : "#6b7280";
        const icon = L.default.divIcon({
          className: "custom-marker",
          html: `<div style="background: ${statusColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #f5c76a; box-shadow: 0 0 10px ${statusColor}40;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.default.marker([driver.lat, driver.lng], { icon })
          .addTo(map)
          .bindPopup(`Sürücü #${driver.driver_id}<br/>Hız: ${driver.speed || 0} km/h`);

        markersRef.current.set(driver.driver_id, marker);
      });
    });
  }, [map, drivers]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join:drivers_live");

    const handleLocationUpdate = (data: DriverLocation) => {
      setDrivers((prev) => {
        const existing = prev.findIndex((d) => d.driver_id === data.driver_id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [...prev, data];
      });
    };

    socket.on("driver:location:update", handleLocationUpdate);

    return () => {
      socket.off("driver:location:update", handleLocationUpdate);
    };
  }, []);

  const statusCounts = drivers.reduce(
    (acc, d) => {
      const status = d.status || "offline";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Canlı Harita</h2>
        <p className="text-sm text-zinc-400">Gerçek zamanlı sürücü konumları ve durumları</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Car className="h-4 w-4 text-[#f5c76a]" />
            Toplam Sürücü
          </div>
          <div className="text-2xl font-cinzel text-white">{drivers.length}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            Boşta
          </div>
          <div className="text-2xl font-cinzel text-white">{statusCounts.idle || 0}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            Yolculukta
          </div>
          <div className="text-2xl font-cinzel text-white">{statusCounts.on_ride || 0}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <div className="h-3 w-3 rounded-full bg-zinc-400" />
            Çevrimdışı
          </div>
          <div className="text-2xl font-cinzel text-white">{statusCounts.offline || 0}</div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="h-[600px] relative" ref={mapRef}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[1000]">
              <Loader2 className="h-8 w-8 animate-spin text-[#f5c76a]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

