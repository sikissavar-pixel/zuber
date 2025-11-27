import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  
  // Use Railway backend URL for socket connection
  let base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Remove trailing slash to ensure clean URL
  base = base.endsWith("/") ? base.slice(0, -1) : base;
  
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || base;
  const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

  socket = io(socketUrl, {
    path: socketPath,
    transports: ["websocket", "polling"],
    autoConnect: true,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
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