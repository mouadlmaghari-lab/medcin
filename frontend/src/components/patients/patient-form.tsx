"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Wand2 } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Patient, CreatePatientPayload } from "@/types/patient";

// ── Schema ────────────────────────────────────────────────
export const patientSchema = z.object({
  nom_complet: z.string().min(2, "Le nom complet est obligatoire"),
  cin: z.string().optional(),
  id_dossier: z.string().optional(),
  type_dossier: z.string().optional(),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  ville: z.string().optional(),
  profession: z.string().optional(),
  telephone: z
    .string()
    .min(10, "Numéro de téléphone invalide")
    .regex(/^[0-9+\s-]+$/, "Format invalide"),
  genre: z.enum(["Homme", "Femme", "Autre"]).optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  type_couverture: z.string().optional(),
  adresse: z.string().optional(),
  observation: z.string().optional(),
  consent_signed: z.boolean().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

const COUVERTURE_OPTIONS = [
  "CNSS",
  "CNOPS",
  "FAR",
  "RAMed",
  "Mutuelle",
  "Autre",
  "Aucune",
];

function generateDossierId(): string {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `D-${rand}`;
}

interface PatientFormProps {
  defaultValues?: Partial<Patient>;
  onSubmit: (values: CreatePatientPayload) => void;
  isPending: boolean;
  submitLabel?: string;
}

export function PatientForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Enregistrer",
}: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nom_complet: defaultValues?.nom_complet ?? "",
      cin: defaultValues?.cin ?? "",
      id_dossier: defaultValues?.id_dossier ?? "",
      type_dossier: defaultValues?.type_dossier ?? "",
      date_naissance: defaultValues?.date_naissance ?? "",
      lieu_naissance: defaultValues?.lieu_naissance ?? "",
      ville: defaultValues?.ville ?? "",
      profession: defaultValues?.profession ?? "",
      telephone: defaultValues?.telephone ?? "",
      genre: defaultValues?.genre ?? undefined,
      email: defaultValues?.email ?? "",
      type_couverture: defaultValues?.type_couverture ?? undefined,
      adresse: defaultValues?.adresse ?? "",
      observation: defaultValues?.observation ?? "",
      consent_signed: !!defaultValues?.consent_signed_at,
    },
  });

  function handleSubmit(values: PatientFormValues) {
    const payload: CreatePatientPayload = {
      ...values,
      email: values.email || undefined,
      cin: values.cin || undefined,
      id_dossier: values.id_dossier || undefined,
      type_dossier: values.type_dossier || undefined,
      lieu_naissance: values.lieu_naissance || undefined,
      ville: values.ville || undefined,
      profession: values.profession || undefined,
      type_couverture: values.type_couverture || undefined,
      adresse: values.adresse || undefined,
      observation: values.observation || undefined,
    };
    onSubmit(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* ── Identité ─────────────────────────────────────── */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Identité
          </h3>

          {/* Row 1: Nom Complet (full width) */}
          <FormField
            control={form.control}
            name="nom_complet"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Nom Complet *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="BENSALEM Ahmed" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Row 2: CIN | N°Dossier | Type */}
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="cin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CIN</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="AB123456"
                      className="uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_dossier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N°Dossier</FormLabel>
                  <div className="flex gap-1">
                    <FormControl>
                      <Input {...field} placeholder="D-XXXX" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      title="Générer un numéro"
                      onClick={() =>
                        form.setValue("id_dossier", generateDossierId())
                      }
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type_dossier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Consultation" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3: Date Naissance | Lieu Naissance | Ville */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="date_naissance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Naissance</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lieu_naissance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu Naissance</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Casablanca" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ville"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Rabat" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 4: Profession | Téléphone | Genre */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enseignant" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone *</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="0600000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="— sélectionner —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Homme">Homme</SelectItem>
                      <SelectItem value="Femme">Femme</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Contact ──────────────────────────────────────── */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Contact
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="patient@email.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type_couverture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couverture sociale</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="— sélectionner —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUVERTURE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Rue, quartier..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Observation ──────────────────────────────────── */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Observation
          </h3>
          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Notes, remarques cliniques..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Consent — Law 09-08 ──────────────────────────── */}
        {!defaultValues?.consent_signed_at && (
          <FormField
            control={form.control}
            name="consent_signed"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-lg border bg-amber-50 p-4 dark:bg-amber-900/10">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div>
                  <FormLabel className="text-sm font-medium">
                    Consentement du patient (Loi 09-08)
                  </FormLabel>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Le patient a été informé de l&apos;utilisation de ses
                    données personnelles et a donné son accord pour leur
                    traitement dans le cadre du suivi médical.
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
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
