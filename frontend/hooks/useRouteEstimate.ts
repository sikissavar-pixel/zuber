"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

type RouteWaypoint = {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type RouteEstimate = {
  distance_meters: number;
  duration_seconds: number;
  polyline?: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  fare: {
    currency: string;
    partner_price: number;
    driver_payout: number;
    base_fare: number;
    per_km: number;
    per_minute: number;
    system_fee_percent: number;
  };
};

export function useRouteEstimate(origin?: RouteWaypoint, destination?: RouteWaypoint, enabled = true) {
  const canRequest =
    Boolean(enabled) &&
    Boolean(origin && (origin.address || (origin.latitude != null && origin.longitude != null))) &&
    Boolean(destination && (destination.address || (destination.latitude != null && destination.longitude != null)));

  return useQuery<RouteEstimate>({
    queryKey: ["maps", "route", origin, destination],
    queryFn: async () => {
      const { data } = await api.post("/api/maps/route/estimate", {
        origin,
        destination,
      });
      return data;
    },
    enabled: canRequest,
    staleTime: 60_000,
  });
}

