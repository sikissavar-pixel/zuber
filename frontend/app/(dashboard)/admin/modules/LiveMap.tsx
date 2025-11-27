"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDriverLocations } from "../../../../hooks/useAdmin";
import { getSocket } from "../../../../lib/socket";
import { Loader2, Car } from "lucide-react";
import { Loader } from "@googlemaps/js-api-loader";

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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    setDrivers(initialLocations);
  }, [initialLocations]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const loadMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["marker"],
        });

        const { Map } = await loader.importLibrary("maps");
        const { AdvancedMarkerElement } = await loader.importLibrary("marker");

        const mapInstance = new Map(mapRef.current!, {
          center: { lat: 41.0082, lng: 28.9784 },
          zoom: 12,
          mapId: "ZUBER_ADMIN_MAP",
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
        });

        setMap(mapInstance);
        setMapLoading(false);
      } catch (err) {
        console.error("Map load error:", err);
        setMapLoading(false);
      }
    };

    loadMap();
  }, []);

  useEffect(() => {
    if (!map || typeof window === "undefined" || drivers.length === 0) return;

    const updateMarkers = async () => {
      const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current.clear();

      drivers.forEach((driver) => {
        const statusColor = driver.status === "on_ride" ? "#ef4444" : driver.status === "idle" ? "#10b981" : "#6b7280";

        const markerElement = document.createElement("div");
        markerElement.style.width = "20px";
        markerElement.style.height = "20px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.background = statusColor;
        markerElement.style.border = "3px solid #f5c76a";
        markerElement.style.boxShadow = `0 0 10px ${statusColor}40`;
        markerElement.style.cursor = "pointer";

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: driver.lat, lng: driver.lng },
          content: markerElement,
          title: `Sürücü #${driver.driver_id} - Hız: ${driver.speed || 0} km/h`,
        });

        markerElement.addEventListener("click", () => {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="color: #000; padding: 8px;"><strong>Sürücü #${driver.driver_id}</strong><br/>Hız: ${driver.speed || 0} km/h<br/>Durum: ${driver.status || "offline"}</div>`,
          });
          infoWindow.open(map, marker);
        });

        markersRef.current.set(driver.driver_id, marker);
      });
    };

    updateMarkers();
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
          {(isLoading || mapLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[1000]">
              <Loader2 className="h-8 w-8 animate-spin text-[#f5c76a]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
