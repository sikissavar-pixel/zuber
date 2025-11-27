"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { getErrorMessage } from "../lib/utils";
import { toast } from "sonner";

export type Reservation = {
  id: number;
  guest_id?: number | null;
  driver_id?: number | null;
  partner_id?: number | null;
  created_by_user_id?: number | null;
  guest_name?: string | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_time: string;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  payment_status: "unpaid" | "paid";
  total_amount?: number | string;
  payment_reference?: string | null;
  created_at: string;
};

export function useMyReservations() {
  return useQuery<Reservation[]>({
    queryKey: ["reservations", "me"],
    queryFn: async () => {
      const { data } = await api.get("/api/reservations/me");
      return data;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminReservations() {
  return useQuery<Reservation[]>({
    queryKey: ["reservations", "admin"],
    queryFn: async () => {
      const { data } = await api.get("/api/reservations/admin");
      return data;
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { pickup_location: string; dropoff_location: string; pickup_time: string; guest_name?: string }) => {
      const { data } = await api.post("/api/reservations", payload);
      return data as Reservation;
    },
    onSuccess: (res: Reservation) => {
      toast.success("Reservation created successfully");
      // Update my list immediately
      qc.setQueryData<Reservation[]>(["reservations", "me"], (prev) => (prev ? [res, ...prev] : [res]));
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Reservation["status"] }) => {
      const { data } = await api.patch(`/api/reservations/${id}/status`, { status });
      return data as Reservation;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["reservations", "me"] });
      const prev = qc.getQueryData<Reservation[]>(["reservations", "me"]);
      qc.setQueryData<Reservation[]>(["reservations", "me"], (list) =>
        list ? list.map((r) => (r.id === id ? { ...r, status } : r)) : list
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["reservations", "me"], ctx.prev);
      toast.error(getErrorMessage(_err));
    },
    onSuccess: (res) => {
      qc.setQueryData<Reservation[]>(["reservations", "me"], (list) =>
        list ? list.map((r) => (r.id === res.id ? res : r)) : list
      );
      toast.success("Status updated");
    },
  });
}

export function useAssignDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, driver_id }: { id: number; driver_id?: number | null }) => {
      const { data } = await api.patch(`/api/reservations/${id}/assign_driver`, { driver_id });
      return data as Reservation;
    },
    onSuccess: (res) => {
      toast.success("Driver assigned");
      qc.setQueryData<Reservation[]>(["reservations", "admin"], (list) =>
        list ? list.map((r) => (r.id === res.id ? res : r)) : list
      );
    },
    onError: (err: any) => {
      toast.error(getErrorMessage(err));
    },
  });
}

// Drivers list (filtered from users)
export type Driver = {
  id: number;
  full_name: string;
  email?: string;
  contact_phone?: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  role?: string;
};

export function useDrivers() {
  return useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data } = await api.get("/api/users/");
      return (data || []).filter((u: any) => u.role === "driver");
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

// Partners list
export type Partner = {
  id: number;
  name: string;
  contact_email?: string;
  contact_phone?: string;
};

export function usePartners() {
  return useQuery<Partner[]>({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data } = await api.get("/api/partners/");
      return data || [];
    },
    staleTime: 15_000,
    refetchInterval: 25_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}