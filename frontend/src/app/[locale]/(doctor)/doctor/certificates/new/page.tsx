"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { differenceInDays, addDays, format, isValid, parseISO } from "date-fns";

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
import { useCreateCertificate } from "@/hooks/use-certificates";

const TYPES = [
  { value: "repos", label: "Repos médical" },
  { value: "aptitude", label: "Certificat d'aptitude" },
  { value: "inapatitude", label: "Certificat d'inaptitude" },
  { value: "hospitalisation", label: "Hospitalisation" },
  { value: "custom", label: "Personnalisé" },
];

const schema = z
  .object({
    type: z.enum(["repos", "aptitude", "inapatitude", "hospitalisation", "custom"]),
    date_certificat: z.string().min(1),
    date_debut: z.string().optional(),
    date_fin: z.string().optional(),
    nombre_jours: z.number().positive().nullable(),
    contenu: z.string().min(1, "Le contenu est obligatoire"),
  })
  .superRefine((data, ctx) => {
    if (data.date_debut && data.date_fin) {
      const d1 = parseISO(data.date_debut);
      const d2 = parseISO(data.date_fin);
      if (isValid(d1) && isValid(d2) && differenceInDays(d2, d1) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La date de fin doit être au moins un jour après la date de début",
          path: ["date_fin"],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

export default function NewCertificatePage() {
  const router = useRouter();
  const params = useSearchParams();
  const patientId = Number(params.get("patient_id") ?? 0);
  const consultationId = params.get("consultation_id")
    ? Number(params.get("consultation_id"))
    : null;

  const createMutation = useCreateCertificate();
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "repos",
      date_certificat: today,
      date_debut: today,
      date_fin: "",
      nombre_jours: null,
      contenu: "",
    },
  });

  const type = form.watch("type");
  const dateDebut = form.watch("date_debut");
  const minDateFin =
    dateDebut && isValid(parseISO(dateDebut))
      ? format(addDays(parseISO(dateDebut), 1), "yyyy-MM-dd")
      : undefined;

  function toDate(str: string | undefined): Date | null {
    if (!str) return null;
    const d = parseISO(str);
    return isValid(d) ? d : null;
  }

  function calcJoursFromDates(debut: string | undefined, fin: string | undefined) {
    const d1 = toDate(debut);
    const d2 = toDate(fin);
    if (!d1 || !d2) return;
    const diff = differenceInDays(d2, d1);
    if (diff > 0) form.setValue("nombre_jours", diff, { shouldValidate: false });
  }

  function calcFinFromJours(debut: string | undefined, jours: number | null) {
    const d1 = toDate(debut);
    if (!d1 || !jours || jours <= 0) return;
    form.setValue("date_fin", format(addDays(d1, jours), "yyyy-MM-dd"), {
      shouldValidate: false,
    });
  }

  function handleSubmit(values: FormValues) {
    createMutation.mutate(
      {
        patient_id: patientId,
        consultation_id: consultationId,
        type: values.type,
        date_certificat: values.date_certificat,
        date_debut: values.date_debut || undefined,
        date_fin: values.date_fin || undefined,
        nombre_jours: values.nombre_jours ?? undefined,
        contenu: values.contenu,
      },
      {
        onSuccess: (c) => router.push(`/doctor/certificates/${c.id}`),
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">
          Nouveau certificat médical
        </h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de certificat *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_certificat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du certificat *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {(type === "repos" || type === "hospitalisation") && (
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="date_debut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          onChange={(e) => {
                            field.onChange(e);
                            const debut = e.target.value;
                            const fin = form.getValues("date_fin");
                            const jours = form.getValues("nombre_jours");
                            const d1 = toDate(debut);
                            const d2 = toDate(fin);
                            // If existing fin is now ≤ debut, clear it
                            if (d1 && d2 && differenceInDays(d2, d1) < 1) {
                              form.setValue("date_fin", "", { shouldValidate: false });
                              form.setValue("nombre_jours", null, { shouldValidate: false });
                              return;
                            }
                            if (fin) {
                              calcJoursFromDates(debut, fin);
                            } else if (jours) {
                              calcFinFromJours(debut, jours);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date_fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          min={minDateFin}
                          onChange={(e) => {
                            field.onChange(e);
                            calcJoursFromDates(
                              form.getValues("date_debut"),
                              e.target.value,
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nombre_jours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de jours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const jours = e.target.value
                              ? Number(e.target.value)
                              : null;
                            field.onChange(jours);
                            calcFinFromJours(form.getValues("date_debut"), jours);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="contenu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu du certificat *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder={
                        type === "repos"
                          ? "Je soussigné Dr. [...] certifie avoir examiné le patient [...] qui présente [...] nécessitant un repos de [...] jours."
                          : type === "aptitude"
                            ? "Je soussigné Dr. [...] certifie que le patient [...] est apte à [...]."
                            : "Contenu du certificat..."
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Émettre le certificat
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
