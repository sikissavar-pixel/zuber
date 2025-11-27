"use client";

import { useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function DriverLocationReporter() {
  const { user } = useAuth();
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!user?.id || user.role !== "driver" || typeof window === "undefined" || !navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastSentRef.current < 8000) return;
        lastSentRef.current = now;
        api
          .post("/api/driver/location", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
            accuracy: position.coords.accuracy,
          })
          .catch(() => {});
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 8000,
      }
    );
    return () => {
      if (watcher) navigator.geolocation.clearWatch(watcher);
    };
  }, [user?.id]);

  return null;
}

