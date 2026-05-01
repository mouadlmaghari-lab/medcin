"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCreateExpertise } from "@/hooks/use-documents";
import { usePatients } from "@/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  patient_id: z.number({ error: "Patient requis" }).int().positive("Patient requis"),
  titre: z.string().min(1, "Titre requis").max(200),
  contenu: z.string().optional(),
  date_expertise: z.string().min(1, "Date requise"),
  statut: z.enum(["en_cours", "termine"]),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────
export default function NewExpertisePage() {
  const router = useRouter();
  const createExpertise = useCreateExpertise();
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
      date_expertise: format(new Date(), "yyyy-MM-dd"),
      statut: "en_cours",
    },
  });

  async function onSubmit(values: FormValues) {
    createExpertise.mutate(
      {
        patient_id: values.patient_id,
        titre: values.titre,
        contenu: values.contenu || undefined,
        date_expertise: values.date_expertise,
        statut: values.statut,
      },
      { onSuccess: () => router.push("/doctor/documents?tab=expertises") },
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
            Nouvelle expertise médicale
          </h1>
          <p className="text-sm text-muted-foreground">
            Expertise judiciaire ou médico-légale
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-lg border bg-card p-6 shadow-sm space-y-5">

            {/* Patient */}
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

            {/* Date + Titre + Statut */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="date_expertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de l'expertise *</FormLabel>
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
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Expertise psychiatrique — Madame X..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Statut */}
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem className="w-[200px]">
                  <FormLabel>Statut</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="termine">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Contenu */}
            <FormField
              control={form.control}
              name="contenu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu de l'expertise</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={14}
                      placeholder="Rédigez le rapport d'expertise ici..."
                      className="font-mono text-sm leading-relaxed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={createExpertise.isPending}>
              {createExpertise.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer l'expertise
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
