"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export function useAdminSummary() {
  return useQuery({
    queryKey: ["admin", "summary"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/summary");
      return data;
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useDriverLocations() {
  return useQuery({
    queryKey: ["admin", "driver-locations"],
    queryFn: async () => {
      const { data } = await api.get("/api/driver/locations");
      return data || [];
    },
    staleTime: 2_000,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useLiveReservations() {
  return useQuery({
    queryKey: ["admin", "live-reservations"],
    queryFn: async () => {
      const { data } = await api.get("/api/reservations/live");
      return data || [];
    },
    staleTime: 3_000,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get("/api/users/");
      return data || [];
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useFinanceSummary() {
  return useQuery({
    queryKey: ["admin", "finance", "summary"],
    queryFn: async () => {
      const { data } = await api.get("/api/finance/summary");
      return data;
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useFinanceTransactions() {
  return useQuery({
    queryKey: ["admin", "finance", "transactions"],
    queryFn: async () => {
      const { data } = await api.get("/api/finance/transactions");
      return data || [];
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useSecurityLoginAttempts() {
  return useQuery({
    queryKey: ["admin", "security", "login-attempts"],
    queryFn: async () => {
      const { data } = await api.get("/api/security/login-attempts");
      return data || [];
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useSecuritySessions() {
  return useQuery({
    queryKey: ["admin", "security", "sessions"],
    queryFn: async () => {
      const { data } = await api.get("/api/security/sessions");
      return data || [];
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useSecurityBlockedIPs() {
  return useQuery({
    queryKey: ["admin", "security", "blocked-ips"],
    queryFn: async () => {
      const { data } = await api.get("/api/security/blocked-ips");
      return data || [];
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ["admin", "system", "status"],
    queryFn: async () => {
      const { data } = await api.get("/api/system/status");
      return data;
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["admin", "health"],
    queryFn: async () => {
      const { data } = await api.get("/health");
      return data;
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/api/users/${id}/activate`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch(`/api/users/${id}/deactivate`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useForceLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/users/${id}/force-logout`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "security", "sessions"] });
    },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/users/${id}/reset-password`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

