"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export const Providers: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster richColors theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;