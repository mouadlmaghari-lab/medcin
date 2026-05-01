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
  Appointment,
  RawAppointment,
  AppointmentListResponse,
  StoreAppointmentPayload,
  UpdateAppointmentPayload,
} from "@/types/appointment";
import { mapAppointment } from "@/types/appointment";

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params: object) => ["appointments", "list", params] as const,
  detail: (id: number) => ["appointments", id] as const,
  calendar: (start: string, end: string) =>
    ["appointments", "calendar", start, end] as const,
};

// ── List with filters ─────────────────────────────────────
export function useAppointments(params: {
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  patient_id?: number;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: async () => {
      // Map frontend param names → backend param names
      const backendParams: Record<string, string | number | undefined> = {
        date: params.date,
        date_from: params.start_date,
        date_to: params.end_date,
        etat: params.status,
        patient_id: params.patient_id,
        page: params.page,
        per_page: params.per_page,
      };
      // Remove undefined values
      Object.keys(backendParams).forEach(
        (k) => backendParams[k] === undefined && delete backendParams[k],
      );

      const { data } = await api.get<AppointmentListResponse>(
        "/doctor/appointments",
        { params: backendParams },
      );
      return {
        data: data.data.map(mapAppointment),
        meta: data.meta,
      };
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

// ── Calendar range query ──────────────────────────────────
export function useCalendarAppointments(start: string, end: string) {
  return useQuery({
    queryKey: appointmentKeys.calendar(start, end),
    queryFn: async () => {
      const { data } = await api.get<AppointmentListResponse>(
        "/doctor/appointments",
        {
          params: {
            date_from: start,
            date_to: end,
            per_page: 200,
          },
        },
      );
      return data.data.map(mapAppointment);
    },
    staleTime: 30_000,
    enabled: !!start && !!end,
  });
}

// ── Single ────────────────────────────────────────────────
export function useAppointment(id: number) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: RawAppointment }>(
        `/doctor/appointments/${id}`,
      );
      return mapAppointment(data.data);
    },
    staleTime: 60_000,
  });
}

// ── Create ────────────────────────────────────────────────
export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StoreAppointmentPayload) => {
      const { data } = await api.post<{ data: RawAppointment }>(
        "/doctor/appointments",
        payload,
      );
      return mapAppointment(data.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success("Rendez-vous créé");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg =
        err?.response?.data?.message ??
        "Impossible de créer le rendez-vous (conflit horaire ?)";
      toast.error(msg);
    },
  });
}

// ── Update ────────────────────────────────────────────────
export function useUpdateAppointment(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateAppointmentPayload) => {
      const { data } = await api.put<{ data: RawAppointment }>(
        `/doctor/appointments/${id}`,
        payload,
      );
      return mapAppointment(data.data);
    },
    onSuccess: (appt) => {
      qc.setQueryData(appointmentKeys.detail(id), appt);
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success("Rendez-vous mis à jour");
    },
    onError: () => {
      toast.error("Impossible de mettre à jour le rendez-vous");
    },
  });
}

// ── Cancel ────────────────────────────────────────────────
export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api.patch(`/doctor/appointments/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success("Rendez-vous annulé");
    },
    onError: () => {
      toast.error("Impossible d'annuler le rendez-vous");
    },
  });
}

// ── Status change ─────────────────────────────────────────
export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: string;
    }) => api.patch(`/doctor/appointments/${id}/status`, { etat: status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: () => {
      toast.error("Impossible de changer le statut");
    },
  });
}
