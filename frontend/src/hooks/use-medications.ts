import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type {
  Medication,
  PaginatedMedications,
  MedicationFilters,
  CreateMedicationPayload,
  UpdateMedicationPayload,
} from "@/types/medication";

// ── Query keys ────────────────────────────────────────────────────────────────
const KEYS = {
  all: ["medications"] as const,
  list: (filters: MedicationFilters) => ["medications", "list", filters] as const,
  detail: (id: number) => ["medications", id] as const,
};

// ── List (paginated + filtered) ───────────────────────────────────────────────
export function useMedications(filters: MedicationFilters = {}) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: async () => {
      const params: Record<string, unknown> = { per_page: 30, ...filters };
      if (filters.low_stock) params.low_stock = "1";
      if (filters.expiring_soon) params.expiring_soon = "1";
      const resp = await api.get<PaginatedMedications>("/doctor/medications", { params });
      return resp.data;
    },
    staleTime: 30_000,
  });
}

// ── Single medication ─────────────────────────────────────────────────────────
export function useMedication(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: async () => {
      const resp = await api.get<{ data: Medication }>(`/doctor/medications/${id}`);
      return resp.data.data;
    },
    enabled: id > 0,
  });
}

// ── Create ────────────────────────────────────────────────────────────────────
export function useCreateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMedicationPayload) => {
      const resp = await api.post<{ data: Medication }>("/doctor/medications", payload);
      return resp.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Médicament ajouté au catalogue");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du médicament");
    },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────
export function useUpdateMedication(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateMedicationPayload) => {
      const resp = await api.put<{ data: Medication }>(`/doctor/medications/${id}`, payload);
      return resp.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Médicament mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

// ── Deactivate (soft delete) ──────────────────────────────────────────────────
export function useDeactivateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/doctor/medications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Médicament désactivé");
    },
    onError: () => {
      toast.error("Erreur lors de la désactivation");
    },
  });
}

// ── Adjust stock inline (PATCH partial update) ────────────────────────────────
export function useAdjustStock(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (qty: number) => {
      const resp = await api.put<{ data: Medication }>(`/doctor/medications/${id}`, {
        stock_qty: qty,
      });
      return resp.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success("Stock mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajustement du stock");
    },
  });
}
