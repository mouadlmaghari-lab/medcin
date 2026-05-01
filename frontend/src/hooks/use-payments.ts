"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Payment, CreatePaymentPayload } from "@/types/payment";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params: object) => ["payments", "list", params] as const,
  detail: (id: number) => ["payments", id] as const,
};

export function usePayments(params: { patient_id?: number; page?: number; per_page?: number; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<{ data: Payment[]; meta: unknown }>("/doctor/payments", { params });
      return data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePaymentPayload) => {
      const { data } = await api.post<{ data: Payment }>("/doctor/payments", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      toast.success("Règlement enregistré");
    },
    onError: () => toast.error("Impossible d'enregistrer le règlement"),
  });
}
