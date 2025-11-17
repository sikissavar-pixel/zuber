"use client";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "sonner";
import { getSocket } from "../lib/socket";
import { useAuth } from "../hooks/useAuth";

const queryClient = new QueryClient();

export const Providers: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  function RoleRoomJoiner() {
    const { user, ready } = useAuth();
    useEffect(() => {
      if (!ready || !user) return;
      const s = getSocket();
      s.emit("role_join", { role: user.role, user_id: user.id });
    }, [user, ready]);
    return null;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleRoomJoiner />
        {children}
        <Toaster richColors theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;