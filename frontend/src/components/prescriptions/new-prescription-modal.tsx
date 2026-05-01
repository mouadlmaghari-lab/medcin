"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PatientCombobox } from "@/components/appointments/patient-combobox";
import { useCreatePrescription } from "@/hooks/use-prescriptions";
import type { Patient } from "@/types/patient";

const itemSchema = z.object({
  medication_name: z.string().min(1, "Médicament requis"),
  dosage: z.string().min(1, "Dosage requis"),
  frequence: z.string().min(1, "Fréquence requise"),
  duree: z.string().min(1, "Durée requise"),
  instructions: z.string().nullable(),
});

const schema = z.object({
  patient_id: z.number().min(1, "Sélectionnez un patient"),
  date_ordonnance: z.string().min(1, "Date requise"),
  items: z.array(itemSchema).min(1, "Au moins un médicament"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface NewPrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: number | null;
  consultationId?: number | null;
}

export function NewPrescriptionModal({
  open,
  onOpenChange,
  patientId,
  consultationId,
}: NewPrescriptionModalProps) {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const createMutation = useCreatePrescription();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: patientId ?? 0,
      date_ordonnance: new Date().toISOString().split("T")[0],
      items: [
        {
          medication_name: "",
          dosage: "",
          frequence: "",
          duree: "",
          instructions: null,
        },
      ],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function handleOpenChange(val: boolean) {
    if (!val) {
      form.reset({
        patient_id: patientId ?? 0,
        date_ordonnance: new Date().toISOString().split("T")[0],
        items: [
          { medication_name: "", dosage: "", frequence: "", duree: "", instructions: null },
        ],
        notes: "",
      });
      setSelectedPatient(null);
    }
    onOpenChange(val);
  }

  function handleSubmit(values: FormValues) {
    createMutation.mutate(
      {
        patient_id: values.patient_id,
        consultation_id: consultationId ?? null,
        date_ordonnance: values.date_ordonnance,
        items: values.items.map((item) => ({
          ...item,
          instructions: item.instructions || null,
        })),
        notes: values.notes || undefined,
      },
      {
        onSuccess: (p) => {
          handleOpenChange(false);
          router.push(`/doctor/prescriptions/${p.id}`);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Nouvelle ordonnance</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="p-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="patient_id"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Patient *</FormLabel>
                        <FormControl>
                          <PatientCombobox
                            value={field.value || null}
                            selectedPatientName={selectedPatient?.nom_complet}
                            onChange={(id, patient) => {
                              field.onChange(id);
                              setSelectedPatient(patient);
                            }}
                            disabled={!!patientId}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_ordonnance"
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
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Médicaments
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          medication_name: "",
                          dosage: "",
                          frequence: "",
                          duree: "",
                          instructions: null,
                        })
                      }
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, i) => (
                      <div
                        key={field.id}
                        className="relative rounded-lg border bg-muted/20 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Médicament {i + 1}
                          </span>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(i)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <FormField
                            control={form.control}
                            name={`items.${i}.medication_name`}
                            render={({ field: f }) => (
                              <FormItem className="lg:col-span-2">
                                <FormLabel>Médicament *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...f}
                                    placeholder="Ex: Metformine 500mg"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${i}.dosage`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>Dosage *</FormLabel>
                                <FormControl>
                                  <Input {...f} value={f.value ?? ""} placeholder="1 cp" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${i}.frequence`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>Fréquence *</FormLabel>
                                <FormControl>
                                  <Input {...f} value={f.value ?? ""} placeholder="2x/jour" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${i}.duree`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>Durée *</FormLabel>
                                <FormControl>
                                  <Input {...f} value={f.value ?? ""} placeholder="30 jours" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${i}.instructions`}
                            render={({ field: f }) => (
                              <FormItem className="lg:col-span-3">
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                  <Input
                                    {...f}
                                    value={f.value ?? ""}
                                    onChange={(e) =>
                                      f.onChange(e.target.value || null)
                                    }
                                    placeholder="Avant les repas, avec de l'eau..."
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.items?.root && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.items.root.message}
                    </p>
                  )}
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={2}
                          placeholder="Notes optionnelles..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pb-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Créer l&apos;ordonnance
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
