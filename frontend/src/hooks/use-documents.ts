import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type {
  MedicalReport,
  PaginatedReports,
  CreateReportPayload,
  Expertise,
  PaginatedExpertises,
  CreateExpertisePayload,
} from "@/types/document";

// ── Query keys ────────────────────────────────────────────────────────────────
const REPORT_KEYS = {
  all: ["reports"] as const,
  list: (params: Record<string, unknown>) => ["reports", "list", params] as const,
  detail: (id: number) => ["reports", id] as const,
};

const EXPERTISE_KEYS = {
  all: ["expertises"] as const,
  list: (params: Record<string, unknown>) => ["expertises", "list", params] as const,
  detail: (id: number) => ["expertises", id] as const,
};

// ── Medical Reports ───────────────────────────────────────────────────────────

export function useReports(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: REPORT_KEYS.list(params),
    queryFn: async () => {
      const resp = await api.get<PaginatedReports>("/doctor/reports", { params });
      return resp.data;
    },
    staleTime: 30_000,
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: REPORT_KEYS.detail(id),
    queryFn: async () => {
      const resp = await api.get<{ data: MedicalReport }>(`/doctor/reports/${id}`);
      return resp.data.data;
    },
    enabled: id > 0,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReportPayload) => {
      const resp = await api.post<{ data: MedicalReport }>("/doctor/reports", payload);
      return resp.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REPORT_KEYS.all });
      toast.success("Rapport médical créé");
    },
    onError: () => {
      toast.error("Erreur lors de la création du rapport");
    },
  });
}

export function useUpdateReport(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CreateReportPayload>) => {
      const resp = await api.put<{ data: MedicalReport }>(`/doctor/reports/${id}`, payload);
      return resp.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REPORT_KEYS.all });
      toast.success("Rapport mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useToggleReportShare(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const resp = await api.patch<{ data: MedicalReport }>(
        `/doctor/reports/${id}/toggle-share`,
      );
      return resp.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: REPORT_KEYS.all });
      toast.success(
        data.partage_patient
          ? "Rapport partagé avec le patient"
          : "Partage retiré",
      );
    },
    onError: () => {
      toast.error("Erreur lors du changement de partage");
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/doctor/reports/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REPORT_KEYS.all });
      toast.success("Rapport supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

// ── Expertises ────────────────────────────────────────────────────────────────

export function useExpertises(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: EXPERTISE_KEYS.list(params),
    queryFn: async () => {
      const resp = await api.get<PaginatedExpertises>("/doctor/expertises", { params });
      return resp.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateExpertise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExpertisePayload) => {
      const resp = await api.post<{ data: Expertise }>("/doctor/expertises", payload);
      return resp.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPERTISE_KEYS.all });
      toast.success("Expertise créée");
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'expertise");
    },
  });
}

export function useDeleteExpertise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/doctor/expertises/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPERTISE_KEYS.all });
      toast.success("Expertise supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}
