import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_URL;

  socket = io(SOCKET_URL, {
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
