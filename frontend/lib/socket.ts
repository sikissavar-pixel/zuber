import { io, Socket } from "socket.io-client";

export type SocketConnectionStatus = "idle" | "connecting" | "connected" | "error";

export type SocketConnectionState = {
  status: SocketConnectionStatus;
  error?: string;
};

let socket: Socket | null = null;
let connectionState: SocketConnectionState = { status: "idle" };
const subscribers = new Set<(state: SocketConnectionState) => void>();

function normalizeUrl(raw: string) {
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function resolveSocketUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SOCKET_URL;
  const fallback = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return normalizeUrl(fromEnv || fallback);
}

function emitState(patch: Partial<SocketConnectionState>) {
  const next: SocketConnectionState = {
    ...connectionState,
    ...patch,
  };
  if (patch.status && patch.status !== "error") {
    next.error = undefined;
  }
  connectionState = next;
  subscribers.forEach((listener) => listener(connectionState));
}

export function subscribeToSocketState(listener: (state: SocketConnectionState) => void) {
  subscribers.add(listener);
  listener(connectionState);
  return () => {
    subscribers.delete(listener);
  };
}

export function getSocketState() {
  return connectionState;
}

const handleError = (err?: Error) => {
  emitState({ status: "error", error: err?.message || "Socket bağlantısı kurulamadı" });
};

function attachLifecycleEvents(target: Socket) {
  target.on("connect", () => emitState({ status: "connected" }));
  target.on("connect_error", handleError);
  target.on("error", handleError);
  target.io.on("reconnect_attempt", () => emitState({ status: "connecting" }));
  target.io.on("reconnect", () => emitState({ status: "connected" }));
  target.on("disconnect", () => emitState({ status: "connecting" }));
}

export function getSocket() {
  if (socket) return socket;
  if (typeof window === "undefined") {
    throw new Error("Socket connections are only available in the browser.");
  }
  socket = io(resolveSocketUrl(), {
    transports: ["websocket"],
    reconnection: true,
    withCredentials: true,
  });
  emitState({ status: "connecting", error: undefined });
  attachLifecycleEvents(socket);
  return socket;
}

export function reconnectSocket() {
  if (!socket) return getSocket();
  emitState({ status: "connecting", error: undefined });
  socket.connect();
  return socket;
}

export function waitForSocketConnection(timeoutMs = 10000) {
  if (connectionState.status === "connected" && socket) {
    return Promise.resolve(socket);
  }
  return new Promise<Socket>((resolve, reject) => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsubscribe = subscribeToSocketState((state) => {
      if (state.status === "connected" && socket) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(socket);
      } else if (state.status === "error") {
        clearTimeout(timeout);
        unsubscribe();
        reject(new Error(state.error || "Socket bağlantısı başarısız"));
      }
    });
    timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("Socket bağlantısı zaman aşımına uğradı"));
    }, timeoutMs);
  });
}

export type DriverLocation = {
  driverId: string;
  lat: number;
  lng: number;
  updatedAt: string;
};