"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Prescription, CreatePrescriptionPayload } from "@/types/prescription";

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
  list: (params: object) => ["prescriptions", "list", params] as const,
  detail: (id: number) => ["prescriptions", id] as const,
};

export function usePrescriptions(params: { patient_id?: number; consultation_id?: number; page?: number }) {
  return useQuery({
    queryKey: prescriptionKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<{ data: Prescription[]; meta: unknown }>("/doctor/prescriptions", { params });
      return data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function usePrescription(id: number) {
  return useQuery({
    queryKey: prescriptionKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Prescription }>(`/doctor/prescriptions/${id}`);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePrescriptionPayload) => {
      const { data } = await api.post<{ data: Prescription }>("/doctor/prescriptions", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      toast.success("Ordonnance créée");
    },
    onError: () => toast.error("Impossible de créer l'ordonnance"),
  });
}

export function useDeletePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/doctor/prescriptions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      toast.success("Ordonnance supprimée");
    },
    onError: () => toast.error("Impossible de supprimer l'ordonnance"),
  });
}
