import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";

type CreateIntentPayload = {
  reservation_id: number;
  amount: number;
  currency?: string;
};

export function useCreateStripeIntent() {
  return useMutation({
    mutationFn: async (payload: CreateIntentPayload) => {
      const { data } = await api.post("/api/payments/create_intent", payload);
      return data as { client_secret: string; payment_intent_id: string };
    },
  });
}