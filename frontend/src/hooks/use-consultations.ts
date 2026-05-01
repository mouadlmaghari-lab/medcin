"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type {
  Consultation,
  ConsultationListResponse,
  CreateConsultationPayload,
} from "@/types/consultation";

export const consultationKeys = {
  all: ["consultations"] as const,
  list: (params: object) => ["consultations", "list", params] as const,
  detail: (id: number) => ["consultations", id] as const,
  forPatient: (patientId: number) =>
    ["consultations", "patient", patientId] as const,
};

export function useConsultations(params: {
  patient_id?: number;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: consultationKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<ConsultationListResponse>(
        "/doctor/consultations",
        { params },
      );
      return data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useConsultation(id: number) {
  return useQuery({
    queryKey: consultationKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Consultation }>(
        `/doctor/consultations/${id}`,
      );
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useCreateConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateConsultationPayload) => {
      const { data } = await api.post<{ data: Consultation }>(
        "/doctor/consultations",
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: consultationKeys.all });
      toast.success("Consultation enregistrée");
    },
    onError: () => {
      toast.error("Impossible d'enregistrer la consultation");
    },
  });
}

export function useUpdateConsultation(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CreateConsultationPayload>) => {
      const { data } = await api.put<{ data: Consultation }>(
        `/doctor/consultations/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: (c) => {
      qc.setQueryData(consultationKeys.detail(id), c);
      qc.invalidateQueries({ queryKey: consultationKeys.all });
      toast.success("Consultation mise à jour");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour la consultation");
    },
  });
}
