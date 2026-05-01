"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMinutes, parse, format as dateFnsFormat } from "date-fns";
import { Loader2, Clock } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PatientCombobox } from "@/components/appointments/patient-combobox";
import { useCreatePatient } from "@/hooks/use-patients";
import type { StoreAppointmentPayload } from "@/types/appointment";
import { buildStorePayload } from "@/types/appointment";

const DUREES = [15, 20, 30, 45, 60, 90, 120];

export const appointmentSchema = z.object({
  patient_id: z
    .number({ message: "Sélectionnez un patient" })
    .positive("Sélectionnez un patient"),
  date: z.string().min(1, "Date requise"),
  heure: z.string().min(1, "Heure requise"),
  duree: z.number().min(15).max(240),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentFormValues>;
  patientId?: number;
  defaultDate?: string;
  defaultHeure?: string;
  onSubmit: (values: StoreAppointmentPayload) => void;
  isPending: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function AppointmentForm({
  defaultValues,
  patientId,
  defaultDate,
  defaultHeure,
  onSubmit,
  isPending,
  submitLabel = "Enregistrer",
  onCancel,
}: AppointmentFormProps) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: patientId ?? defaultValues?.patient_id ?? undefined,
      date: defaultDate ?? defaultValues?.date ?? "",
      heure: defaultHeure ?? defaultValues?.heure ?? "",
      duree: defaultValues?.duree ?? 30,
      description: defaultValues?.description ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  const dateValue = form.watch("date");
  const heureValue = form.watch("heure");
  const dureeValue = form.watch("duree");

  const endTime = useMemo(() => {
    if (!dateValue || !heureValue || !dureeValue) return null;
    try {
      const start = parse(
        `${dateValue} ${heureValue}`,
        "yyyy-MM-dd HH:mm",
        new Date(),
      );
      return dateFnsFormat(addMinutes(start, dureeValue), "HH:mm");
    } catch {
      return null;
    }
  }, [dateValue, heureValue, dureeValue]);

  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [quickNomComplet, setQuickNomComplet] = useState("");
  const [quickTel, setQuickTel] = useState("");
  const createPatient = useCreatePatient();

  function handleQuickCreate() {
    if (!quickNomComplet || !quickTel) return;
    createPatient.mutate(
      { nom_complet: quickNomComplet, telephone: quickTel },
      {
        onSuccess: (patient) => {
          form.setValue("patient_id", patient.id, { shouldValidate: true });
          setSelectedPatientName(patient.nom_complet);
          setQuickCreateOpen(false);
          setQuickNomComplet("");
          setQuickTel("");
        },
      },
    );
  }

  function handleFormSubmit(values: AppointmentFormValues) {
    const payload = buildStorePayload({
      patient_id: values.patient_id,
      date: values.date,
      heure: values.heure,
      duree: values.duree,
      description: values.description,
      is_walk_in: false,
    });
    onSubmit(payload);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure *</FormLabel>
                <FormControl>
                  <Input {...field} type="time" step={900} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée *</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DUREES.map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {endTime && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3 shrink-0 text-primary" />
                    Fin :{" "}
                    <span className="font-semibold text-foreground">
                      {endTime}
                    </span>
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="patient_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient *</FormLabel>
              <FormControl>
                <PatientCombobox
                  value={field.value}
                  selectedPatientName={selectedPatientName}
                  onChange={(id, patient) => {
                    form.setValue("patient_id", id, { shouldValidate: true });
                    setSelectedPatientName(patient.nom_complet);
                  }}
                  onCreateNew={() => setQuickCreateOpen(true)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-1" />

        {/* Quick-create patient dialog */}
        <Dialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau patient rapide</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Nom complet *</label>
                <Input
                  value={quickNomComplet}
                  onChange={(e) => setQuickNomComplet(e.target.value)}
                  placeholder="Prénom et nom"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone *</label>
                <Input
                  value={quickTel}
                  onChange={(e) => setQuickTel(e.target.value)}
                  placeholder="06XXXXXXXX"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuickCreateOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={handleQuickCreate}
                  disabled={
                    createPatient.isPending || !quickNomComplet || !quickTel
                  }
                >
                  {createPatient.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Créer et sélectionner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif de la consultation</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: douleurs abdominales..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes internes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={2}
                  placeholder="Notes optionnelles..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
