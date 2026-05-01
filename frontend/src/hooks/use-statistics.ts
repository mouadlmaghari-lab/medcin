import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  patients: {
    total: number;
    active: number;
    inactive: number;
  };
  appointments: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    no_show: number;
  };
  consultations: {
    total: number;
    by_type: Record<string, number>;
    average_time: number;
  };
  revenue: {
    total_payments: number;
    payment_count: number;
    total_invoiced: number;
    invoice_count: number;
    pending_payments: number;
  };
  prescriptions: {
    total: number;
    by_type: Record<string, number>;
  };
  certificates: {
    total: number;
    by_type: Record<string, number>;
  };
}

export interface AppointmentTrendPoint {
  date: string;
  total: number;
  by_status: Record<string, number>;
}

export interface RevenueTrendPoint {
  date: string;
  amount: number;
}

// ── Query keys ────────────────────────────────────────────────────────────────
const KEYS = {
  dashboard: (from: string, to: string) =>
    ["statistics", "dashboard", from, to] as const,
  appointments: (from: string, to: string) =>
    ["statistics", "appointments", from, to] as const,
  revenue: (from: string, to: string) =>
    ["statistics", "revenue", from, to] as const,
  topProcedures: () => ["statistics", "top-procedures"] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDashboardStats(from: string, to: string) {
  return useQuery({
    queryKey: KEYS.dashboard(from, to),
    queryFn: async () => {
      const resp = await api.get<DashboardStats>("/doctor/statistics/dashboard", {
        params: { from, to },
      });
      return resp.data;
    },
    staleTime: 60_000,
    enabled: !!from && !!to,
  });
}

export function useAppointmentTrends(from: string, to: string) {
  return useQuery({
    queryKey: KEYS.appointments(from, to),
    queryFn: async () => {
      const resp = await api.get<{ data: AppointmentTrendPoint[] }>(
        "/doctor/statistics/appointments",
        { params: { from, to } },
      );
      return resp.data.data;
    },
    staleTime: 60_000,
    enabled: !!from && !!to,
  });
}

export function useRevenueTrends(from: string, to: string) {
  return useQuery({
    queryKey: KEYS.revenue(from, to),
    queryFn: async () => {
      const resp = await api.get<{ data: RevenueTrendPoint[] }>(
        "/doctor/statistics/revenue",
        { params: { from, to } },
      );
      return resp.data.data;
    },
    staleTime: 60_000,
    enabled: !!from && !!to,
  });
}

export function useTopProcedures(limit = 8) {
  return useQuery({
    queryKey: KEYS.topProcedures(),
    queryFn: async () => {
      const resp = await api.get<{ data: Record<string, number> }>(
        "/doctor/statistics/top-procedures",
        { params: { limit } },
      );
      return Object.entries(resp.data.data).map(([name, count]) => ({
        name,
        count,
      }));
    },
    staleTime: 300_000,
  });
}
