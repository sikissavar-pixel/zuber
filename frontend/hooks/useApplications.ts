"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export type PartnerApplyInput = {
  company_name: string;
  tax_office: string;
  tax_number: string;
  company_type: string;
  contact_full_name: string;
  tc_no: string;
  contact_email: string;
  contact_phone: string;
  total_vehicles: number;
  fleet_type: string;
  kvkk_consent: boolean;
  commercial_contract_approved: boolean;
};

export type DriverApplyInput = {
  full_name: string;
  tc_no: string;
  birth_year: number;
  email: string;
  phone: string;
  city: string;
  driver_license_class: string;
  driver_license_year: number;
  criminal_record_confirmed: boolean;
  kvkk_consent: boolean;
  data_processing_consent: boolean;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  plate_number: string;
  fuel_type: string;
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

type ApplicationStatus = "pending" | "approved" | "rejected" | "all";

function buildStatusQuery(status: ApplicationStatus) {
  if (status === "all") return "";
  return `?status=${status}`;
}

export function useAdminPartnerApplications(status: ApplicationStatus = "pending") {
  return useQuery({
    queryKey: ["applications", "partners", status],
    queryFn: async () => {
      const { data } = await api.get(`/api/applications/partners${buildStatusQuery(status)}`);
      return (data?.items || data || []) as any[];
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useAdminDriverApplications(status: ApplicationStatus = "pending") {
  return useQuery({
    queryKey: ["applications", "drivers", status],
    queryFn: async () => {
      const { data } = await api.get(`/api/applications/drivers${buildStatusQuery(status)}`);
      return (data?.items || data || []) as any[];
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
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
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
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
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
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
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
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}
