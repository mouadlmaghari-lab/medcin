"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Invoice, CreateInvoicePayload, Expense, CreateExpensePayload } from "@/types/invoice";

// ── Invoices ──────────────────────────────────────────────
export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (params: object) => ["invoices", "list", params] as const,
  detail: (id: number) => ["invoices", id] as const,
};

export function useInvoices(params: { patient_id?: number; page?: number }) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<{ data: Invoice[]; meta: unknown }>("/doctor/invoices", { params });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Invoice }>(`/doctor/invoices/${id}`);
      return data.data;
    },
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      const { data } = await api.post<{ data: Invoice }>("/doctor/invoices", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      toast.success("Facture créée");
    },
    onError: () => toast.error("Impossible de créer la facture"),
  });
}

// ── Expenses ──────────────────────────────────────────────
export const expenseKeys = {
  all: ["expenses"] as const,
  list: (params: object) => ["expenses", "list", params] as const,
};

export function useExpenses(params: { page?: number; categorie?: string; start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<{ data: Expense[]; meta: unknown }>("/doctor/expenses", { params });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const { data } = await api.post<{ data: Expense }>("/doctor/expenses", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success("Dépense enregistrée");
    },
    onError: () => toast.error("Impossible d'enregistrer la dépense"),
  });
}
