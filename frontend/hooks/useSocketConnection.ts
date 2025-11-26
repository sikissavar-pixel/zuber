"use client";
import { useEffect, useState } from "react";
import { getSocket, getSocketState, subscribeToSocketState, type SocketConnectionState } from "@/lib/socket";

export function useSocketConnection(autoConnect = true) {
  const [state, setState] = useState<SocketConnectionState>(() => getSocketState());

  useEffect(() => {
    if (autoConnect) {
      try {
        getSocket();
      } catch {
        // noop: getSocket only works in browser environments
      }
    }
    const unsubscribe = subscribeToSocketState(setState);
    return () => {
      unsubscribe();
    };
  }, [autoConnect]);

  return state;
}
