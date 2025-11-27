import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const PROD_SOCKET_FALLBACK = "https://zuber-backend-production-071e.up.railway.app";
const isDev = process.env.NODE_ENV === "development";

function normalizeUrl(value: string) {
  let url = value.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/^\/+/, "")}`;
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSocket() {
  if (socket) return socket;

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const socketEnv = process.env.NEXT_PUBLIC_SOCKET_URL;
  const defaultBase = isDev ? "http://localhost:8000" : PROD_SOCKET_FALLBACK;

  const target = normalizeUrl(socketEnv || apiBase || defaultBase);
  const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

  if (typeof window !== "undefined" && !socketEnv && !apiBase && !isDev) {
    console.warn("⚠️ NEXT_PUBLIC_SOCKET_URL not set! Falling back to production socket endpoint.");
  }

  socket = io(target, {
    path: socketPath,
    transports: ["websocket", "polling"],
    autoConnect: true,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    secure: target.startsWith("https"),
  });
  return socket;
}

export type DriverLocation = {
  driverId?: number | string;
  driver_id?: number;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  heading?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  updatedAt?: string;
  updated_at?: string;
};