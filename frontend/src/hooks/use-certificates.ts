"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Certificate, CreateCertificatePayload } from "@/types/certificate";

export const certKeys = {
  all: ["certificates"] as const,
  list: (params: object) => ["certificates", "list", params] as const,
  detail: (id: number) => ["certificates", id] as const,
};

export function useCertificates(params: { patient_id?: number; page?: number }) {
  return useQuery({
    queryKey: certKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<{ data: Certificate[]; meta: unknown }>(
        "/doctor/certificates",
        { params },
      );
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCertificate(id: number) {
  return useQuery({
    queryKey: certKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Certificate }>(
        `/doctor/certificates/${id}`,
      );
      return data.data;
    },
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCertificatePayload) => {
      const { data } = await api.post<{ data: Certificate }>(
        "/doctor/certificates",
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: certKeys.all });
      toast.success("Certificat créé");
    },
    onError: () => toast.error("Impossible de créer le certificat"),
  });
}
