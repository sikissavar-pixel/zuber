"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "sonner";
import SocketGate from "@/components/SocketGate";

const queryClient = new QueryClient();

export const Providers: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketGate>{children}</SocketGate>
        <Toaster richColors theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;