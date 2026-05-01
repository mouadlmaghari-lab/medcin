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
  Patient,
  PatientListResponse,
  CreatePatientPayload,
  UpdatePatientPayload,
} from "@/types/patient";

// ── Query keys ────────────────────────────────────────────
export const patientKeys = {
  all: ["patients"] as const,
  list: (params: object) => ["patients", "list", params] as const,
  detail: (id: number) => ["patients", id] as const,
};

// ── List + search ─────────────────────────────────────────
export function usePatients(params: {
  q?: string;
  page?: number;
  per_page?: number;
  ville?: string;
  sexe?: string;
}) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: async () => {
      // Map frontend param names → backend param names
      const { q, ...rest } = params;
      const backendParams = { ...rest, search: q };
      const { data } = await api.get<PatientListResponse>("/doctor/patients", {
        params: backendParams,
      });
      return data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

// ── Single patient ────────────────────────────────────────
export function usePatient(id: number) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Patient }>(
        `/doctor/patients/${id}`,
      );
      return data.data;
    },
    staleTime: 60_000,
  });
}

// ── Create ────────────────────────────────────────────────
export function useCreatePatient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePatientPayload) => {
      // Build nom_complet from nom+prenom if not provided directly
      const backendPayload = { ...payload };
      if (!backendPayload.nom_complet && backendPayload.nom) {
        backendPayload.nom_complet = [backendPayload.prenom, backendPayload.nom]
          .filter(Boolean)
          .join(" ");
      }
      // Remove fields the backend doesn't accept
      delete backendPayload.nom;
      delete backendPayload.prenom;
      delete backendPayload.sexe;

      const { data } = await api.post<{ data: Patient }>(
        "/doctor/patients",
        backendPayload,
      );
      return data.data;
    },
    onSuccess: (patient) => {
      qc.invalidateQueries({ queryKey: patientKeys.all });
      toast.success(`Patient ${patient.nom_complet} créé avec succès`);
    },
    onError: () => {
      toast.error("Impossible de créer le patient");
    },
  });
}

// ── Update ────────────────────────────────────────────────
export function useUpdatePatient(id: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePatientPayload) => {
      const { data } = await api.put<{ data: Patient }>(
        `/doctor/patients/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: (patient) => {
      qc.setQueryData(patientKeys.detail(id), patient);
      qc.invalidateQueries({ queryKey: patientKeys.all });
      toast.success("Fiche patient mise à jour");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le patient");
    },
  });
}

// ── Delete ────────────────────────────────────────────────
export function useDeletePatient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`/doctor/patients/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.all });
      toast.success("Patient supprimé");
    },
    onError: () => {
      toast.error("Impossible de supprimer le patient");
    },
  });
}

// ── Upload photo ──────────────────────────────────────────
export function useUploadPatientPhoto(id: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("photo", file);
      const { data } = await api.post<{ data: Patient }>(
        `/doctor/patients/${id}/photo`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data.data;
    },
    onSuccess: (patient) => {
      qc.setQueryData(patientKeys.detail(id), patient);
      toast.success("Photo mise à jour");
    },
    onError: () => {
      toast.error("Impossible de télécharger la photo");
    },
  });
}
