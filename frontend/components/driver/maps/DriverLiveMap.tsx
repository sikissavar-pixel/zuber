"use client";

import { memo, useCallback, useMemo, useRef } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import type { RouteEstimate } from "@/hooks/useRouteEstimate";
import type { DriverLocation } from "@/hooks/useDriverLocation";
import { decodePolyline } from "@/lib/polyline";

type DriverLiveMapProps = {
  apiKey?: string;
  route?: RouteEstimate | null;
  driverLocation?: DriverLocation | null;
  pickupLabel?: string;
  dropoffLabel?: string;
  isLoading?: boolean;
};

const containerStyle = { width: "100%", height: "320px" } as const;

const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#050505" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#050505" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c7a545" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#222222" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
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
];

export const DriverLiveMap = memo(function DriverLiveMap({
  apiKey,
  route,
  driverLocation,
  pickupLabel,
  dropoffLabel,
  isLoading,
}: DriverLiveMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "driver-live-map",
    googleMapsApiKey: apiKey || "",
  });
  const mapRef = useRef<google.maps.Map | null>(null);

  const path = useMemo(() => decodePolyline(route?.polyline), [route?.polyline]);

  const pickup = useMemo(() => {
    if (route?.origin) return { lat: route.origin.lat, lng: route.origin.lng };
    return null;
  }, [route?.origin]);
  const dropoff = useMemo(() => {
    if (route?.destination) return { lat: route.destination.lat, lng: route.destination.lng };
    return null;
  }, [route?.destination]);
  const driver = useMemo(() => {
    if (!driverLocation) return null;
    return { lat: driverLocation.latitude, lng: driverLocation.longitude };
  }, [driverLocation]);

  const center = driver || pickup || dropoff || { lat: 41.0082, lng: 28.9784 };

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      const bounds = new window.google.maps.LatLngBounds();
      let hasPoint = false;
      if (path.length) {
        path.forEach((coord) => bounds.extend(coord));
        hasPoint = true;
      }
      [driver, pickup, dropoff].forEach((point) => {
        if (point) {
          bounds.extend(point);
          hasPoint = true;
        }
      });
      if (hasPoint) {
        map.fitBounds(bounds, 48);
      }
    },
    [driver, pickup, dropoff, path]
  );

  if (!apiKey) {
    return (
      <div className="h-80 flex items-center justify-center text-sm text-[#bcbcbc]">
        Google Maps API anahtarı tanımlı değil.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-80 flex items-center justify-center text-sm text-rose-300">
        Harita yüklenirken hata oluştu.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-80 flex items-center justify-center text-sm text-[#bcbcbc]">
        {isLoading ? "Rota hazırlanıyor..." : "Harita yükleniyor..."}
      </div>
    );
  }

  return (
    <div className="relative">
      <GoogleMap
        onLoad={handleMapLoad}
        options={{ styles: mapStyles, disableDefaultUI: true, clickableIcons: false }}
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {path.length > 0 && (
          <Polyline
            path={path}
            options={{
              strokeColor: "#ffcc33",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
        {pickup && (
          <Marker
            position={pickup}
            label={{
              text: "P",
              color: "#050301",
              fontWeight: "bold",
            }}
            title={pickupLabel || "Kalkış"}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#ffcc33",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#050301",
            }}
          />
        )}
        {dropoff && (
          <Marker
            position={dropoff}
            label={{
              text: "D",
              color: "#050301",
              fontWeight: "bold",
            }}
            title={dropoffLabel || "Varış"}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#f97316",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#050301",
            }}
          />
        )}
        {driver && (
          <Marker
            position={driver}
            title="Sürücü Konumu"
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 4,
              fillColor: "#10b981",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#03312c",
            }}
          />
        )}
      </GoogleMap>
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.45)]" />
    </div>
  );
});

