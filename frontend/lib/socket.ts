import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:8000";
  const socketPath = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

  let urlForClient = socketUrl;
  let pathForClient = socketPath;

  if (socketUrl.startsWith("/")) {
    urlForClient = appUrl.replace("localhost", "127.0.0.1");
    pathForClient = socketUrl;
  } else if (socketUrl.includes("localhost")) {
    urlForClient = socketUrl.replace("localhost", "127.0.0.1");
  }

  socket = io(urlForClient, {
    path: pathForClient,
    transports: ["websocket", "polling"],
    autoConnect: true,
    withCredentials: false,
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
