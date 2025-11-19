"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export type PartnerApplyInput = {
  name: string;
  contact_full_name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  description?: string;
};

export type DriverApplyInput = {
  full_name: string;
  email: string;
  phone: string;
  license_no: string;
  vehicle_plate: string;
  city: string;
  description?: string;
};

export function useApplyPartner() {
  return useMutation({
    mutationFn: async (payload: PartnerApplyInput) => {
      const { data } = await api.post("/api/partners/apply", payload);
      return data;
    },
    retry: 1,
  });
}

export function useApplyDriver() {
  return useMutation({
    mutationFn: async (payload: DriverApplyInput) => {
      const { data } = await api.post("/api/drivers/apply", payload);
      return data;
    },
    retry: 1,
  });
}

export function useAdminPartnerApplications() {
  return useQuery({
    queryKey: ["applications", "partners"],
    queryFn: async () => {
      const { data } = await api.get("/api/applications/partners");
      return data as any[];
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useAdminDriverApplications() {
  return useQuery({
    queryKey: ["applications", "drivers"],
    queryFn: async () => {
      const { data } = await api.get("/api/applications/drivers");
      return data as any[];
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useApprovePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/applications/partners/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications", "partners"] });
    },
  });
}

export function useRejectPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/applications/partners/${id}/reject`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications", "partners"] });
    },
  });
}

export function useApproveDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/applications/drivers/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications", "drivers"] });
    },
  });
}

export function useRejectDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/api/applications/drivers/${id}/reject`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications", "drivers"] });
    },
  });
}