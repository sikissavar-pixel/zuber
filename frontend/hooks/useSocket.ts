"use client";
import { useEffect } from "react";
import { getSocket } from "../lib/socket";

export function useSocket(eventMap: Record<string, (...args: any[]) => void>) {
  useEffect(() => {
    const socket = getSocket();
    Object.entries(eventMap).forEach(([event, handler]) => socket.on(event, handler));
    return () => {
      Object.entries(eventMap).forEach(([event, handler]) => socket.off(event, handler));
    };
  }, []);
}

export function emitDriverLocation(driverId: number, lat: number, lng: number) {
  const socket = getSocket();
  socket.emit("driver_location_update", {
    driverId,
    lat,
    lng,
    updatedAt: new Date().toISOString(),
  });
}