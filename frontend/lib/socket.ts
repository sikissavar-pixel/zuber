import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  const base = process.env.NEXT_PUBLIC_API_URL || "";
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
  driverId: string;
  lat: number;
  lng: number;
  updatedAt: string;
};