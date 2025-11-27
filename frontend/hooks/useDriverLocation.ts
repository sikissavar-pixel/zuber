"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type DriverLocation = {
  driver_id: number;
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  updated_at: string;
};

async function fetchMyLocation(): Promise<DriverLocation | null> {
  try {
    const { data } = await api.get("/api/driver/location/me");
    return data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export function useMyDriverLocation(enabled = true) {
  return useQuery<DriverLocation | null>({
    queryKey: ["driver", "location", "me"],
    queryFn: fetchMyLocation,
    enabled,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

