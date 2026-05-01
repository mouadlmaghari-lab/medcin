"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateReport } from "@/hooks/use-documents";
import { usePatients } from "@/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  patient_id: z.number({ error: "Patient requis" }).int().positive("Patient requis"),
  titre: z.string().min(1, "Titre requis").max(200),
  contenu: z.string().min(1, "Contenu requis"),
  date_rapport: z.string().min(1, "Date requise"),
  partage_patient: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────
export default function NewReportPage() {
  const router = useRouter();
  const createReport = useCreateReport();
  const [patientSearch, setPatientSearch] = useState("");
  const debouncedSearch = useDebounce(patientSearch, 300);

  const { data: patientsData } = usePatients({
    q: debouncedSearch || undefined,
    per_page: 20,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: undefined,
      titre: "",
      contenu: "",
      date_rapport: format(new Date(), "yyyy-MM-dd"),
      partage_patient: false,
    },
  });

  async function onSubmit(values: FormValues) {
    createReport.mutate(
      {
        patient_id: values.patient_id,
        titre: values.titre,
        contenu: values.contenu,
        date_rapport: values.date_rapport,
        partage_patient: values.partage_patient,
      },
      { onSuccess: () => router.push("/doctor/documents") },
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Nouveau rapport médical
          </h1>
          <p className="text-sm text-muted-foreground">
            Rapport, synthèse ou compte-rendu médical
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-lg border bg-card p-6 shadow-sm space-y-5">

            {/* Patient select */}
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient *</FormLabel>
                  <div className="space-y-2">
                    <Input
                      placeholder="Rechercher un patient..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un patient..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(patientsData?.data ?? []).map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.prenom} {p.nom} — {p.numero_dossier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date + Titre */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date_rapport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du rapport *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Compte-rendu de consultation..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contenu */}
            <FormField
              control={form.control}
              name="contenu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu du rapport *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={12}
                      placeholder="Rédigez le rapport médical ici..."
                      className="font-mono text-sm leading-relaxed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partage */}
            <FormField
              control={form.control}
              name="partage_patient"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="partage"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border"
                    />
                  </FormControl>
                  <Label htmlFor="partage" className="font-normal cursor-pointer">
                    Partager ce rapport avec le patient (visible dans l'application mobile)
                  </Label>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={createReport.isPending}>
              {createReport.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer le rapport
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
