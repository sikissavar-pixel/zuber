"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { loadGoogleMaps } from "@/lib/googleMaps";

type LatLngLiteral = google.maps.LatLngLiteral;
const DEFAULT_CENTER: LatLngLiteral = { lat: 41.0082, lng: 28.9784 };

export type DriverMarker = {
  id: string | number;
  lat: number;
  lng: number;
  heading?: number | null;
  status?: string;
};

export type RouteConfig = {
  origin?: LatLngLiteral | string;
  destination?: LatLngLiteral | string;
  travelMode?: google.maps.TravelMode;
  autoFit?: boolean;
};

type ZuberMapProps = {
  drivers?: DriverMarker[];
  route?: RouteConfig;
  height?: number | string;
  className?: string;
  onRouteMetrics?: (metrics: { distanceKm: number; durationMinutes: number }) => void;
};

export function ZuberMap({
  drivers = [],
  route,
  height = 320,
  className,
  onRouteMetrics,
}: ZuberMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map>();
  const driverMarkersRef = useRef<Record<string | number, google.maps.Marker>>({});
  const userMarkerRef = useRef<google.maps.Marker>();
  const routePolylineRef = useRef<google.maps.Polyline>();
  const routeRendererRef = useRef<google.maps.DirectionsRenderer>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{ distanceKm: number; durationMinutes: number } | null>(null);

  const mapStyles: google.maps.MapTypeStyle[] = useMemo(
    () => [
      { elementType: "geometry", stylers: [{ color: "#050505" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#050505" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#c9a646" }] },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#1a1a1a" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#3b3b3b" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0b0b0b" }],
      },
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }],
      },
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new google.maps.Map(containerRef.current, {
          disableDefaultUI: true,
          gestureHandling: "greedy",
          backgroundColor: "#050505",
          styles: mapStyles,
          center: DEFAULT_CENTER,
          zoom: 12,
        });
        setReady(true);
        containerRef.current.classList.add("opacity-100");
      })
      .catch((err) => {
        console.warn(err);
        setError(err.message || "Harita yüklenirken hata oluştu.");
      });

    return () => {
      cancelled = true;
      Object.values(driverMarkersRef.current).forEach((marker) => marker.setMap(null));
      driverMarkersRef.current = {};
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
      }
      if (routeRendererRef.current) {
        routeRendererRef.current.setMap(null);
      }
    };
  }, [mapStyles]);

  // Track user location
  useEffect(() => {
    if (!ready || typeof window === "undefined" || !navigator.geolocation) return;
    let watchId: number | null = null;

    loadGoogleMaps()
      .then((google) => {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (!mapRef.current) return;
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            if (!userMarkerRef.current) {
              userMarkerRef.current = new google.maps.Marker({
                map: mapRef.current,
                position: coords,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#facc15",
                  fillOpacity: 1,
                  strokeColor: "#050505",
                  strokeWeight: 2,
                },
                title: "Siz",
              });
            } else {
              userMarkerRef.current.setPosition(coords);
            }
          },
          () => {},
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 8000,
          }
        );
      })
      .catch((err) => {
        console.warn(err);
      });

  return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [ready]);

  // Render driver markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    loadGoogleMaps()
      .then((google) => {
        const nextIds = new Set(drivers.map((driver) => driver.id));
        Object.entries(driverMarkersRef.current).forEach(([id, marker]) => {
          if (!nextIds.has(id)) {
            marker.setMap(null);
            delete driverMarkersRef.current[id];
          }
        });

        drivers.forEach((driver) => {
          if (!driverMarkersRef.current[driver.id]) {
            driverMarkersRef.current[driver.id] = new google.maps.Marker({
              map: mapRef.current!,
              position: { lat: driver.lat, lng: driver.lng },
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                fillColor: "#fbbf24",
                fillOpacity: 1,
                strokeColor: "#1f1300",
                strokeWeight: 2,
                scale: 4,
                rotation: driver.heading ?? undefined,
              },
              title: driver.status || `Sürücü #${driver.id}`,
            });
          } else {
            driverMarkersRef.current[driver.id].setPosition({ lat: driver.lat, lng: driver.lng });
            if (driver.heading != null) {
              driverMarkersRef.current[driver.id].setIcon({
                ...(driverMarkersRef.current[driver.id].getIcon() as google.maps.Symbol),
                rotation: driver.heading,
              });
            }
          }
        });
      })
      .catch((err) => {
        console.warn(err);
      });
  }, [drivers, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (!drivers.length) return;
    const primary = drivers[0];
    mapRef.current.panTo({ lat: primary.lat, lng: primary.lng });
  }, [drivers, ready]);

  // Draw route between two points
  useEffect(() => {
    if (!ready || !mapRef.current || !route?.origin || !route?.destination) return;
    loadGoogleMaps()
      .then((google) => {
        const directionsService = new google.maps.DirectionsService();
        if (!routeRendererRef.current) {
          routeRendererRef.current = new google.maps.DirectionsRenderer({
            map: mapRef.current!,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#facc15",
              strokeOpacity: 0.9,
              strokeWeight: 5,
            },
          });
        }

        directionsService.route(
          {
            origin: route.origin!,
            destination: route.destination!,
            travelMode: route.travelMode || google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
            },
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              routeRendererRef.current?.setDirections(result);
              const leg = result.routes[0].legs[0];
              const distanceKm = leg.distance ? leg.distance.value / 1000 : 0;
              const durationMinutes = leg.duration ? leg.duration.value / 60 : 0;
              setMetrics({ distanceKm, durationMinutes });
              onRouteMetrics?.({ distanceKm, durationMinutes });
              if (route.autoFit !== false) {
                const bounds = result.routes[0].bounds;
                mapRef.current?.fitBounds(bounds, 48);
              }
            }
          }
        );
      })
      .catch((err) => {
        console.warn(err);
        setError(err.message || "Rota oluşturulamadı.");
      });
  }, [route?.origin, route?.destination, route?.travelMode, route?.autoFit, ready, onRouteMetrics]);

  const mapHeight = typeof height === "number" ? `${height}px` : height;

  useEffect(() => {
    if (!route?.origin || !route?.destination) {
      setMetrics(null);
    }
  }, [route?.origin, route?.destination]);

  return (
    <div className={clsx("relative overflow-hidden rounded-3xl border border-[#1c1c1c] bg-[#020202]", className)}>
      <div
        ref={containerRef}
        style={{ height: mapHeight }}
        className="w-full opacity-0 transition-opacity duration-700 ease-out"
        aria-label="Zuber haritası"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020202]/40" />
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#888]">Harita yükleniyor...</div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-rose-300 px-4">{error}</div>
      )}
      {metrics && (
        <div className="absolute left-4 top-4 rounded-2xl border border-[#facc15]/30 bg-[#050505]/80 px-4 py-2 text-xs text-[#fcd34d] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <p className="tracking-[0.3em] uppercase text-[10px] text-[#a67c00]">rota</p>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span>{metrics.distanceKm.toFixed(1)} km</span>
            <span className="text-[#666]">•</span>
            <span>{Math.round(metrics.durationMinutes)} dk</span>
          </div>
        </div>
      )}
    </div>
  );
}

