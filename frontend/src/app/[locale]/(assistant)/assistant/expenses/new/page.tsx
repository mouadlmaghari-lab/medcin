"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCreateExpense } from "@/hooks/use-invoices";
import { format } from "date-fns";
import type { ExpenseCategory } from "@/types/invoice";

// ── Category metadata ────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  loyer: "Loyer",
  charges: "Charges",
  materiel: "Matériel médical",
  consommables: "Consommables",
  formation: "Formation / Congrès",
  logiciel: "Logiciel / Abonnement",
  assurance: "Assurance",
  personnel: "Personnel",
  autre: "Autre",
};

// ── Zod schema ───────────────────────────────────────────────────────────────
const schema = z.object({
  categorie: z.enum([
    "loyer",
    "charges",
    "materiel",
    "consommables",
    "formation",
    "logiciel",
    "assurance",
    "personnel",
    "autre",
  ] as const, { error: "Sélectionnez une catégorie" }),
  description: z.string().min(1, "Description requise"),
  montant: z.number({ error: "Montant requis" }).min(0.01, "Montant > 0"),
  date_depense: z.string().min(1, "Date requise"),
  fournisseur: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ────────────────────────────────────────────────────────────────
export default function AssistantExpenseNewPage() {
  const router = useRouter();
  const createExpense = useCreateExpense();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categorie: undefined,
      description: "",
      montant: undefined,
      date_depense: format(new Date(), "yyyy-MM-dd"),
      fournisseur: "",
      reference: "",
      notes: "",
    },
  });

  const errors = form.formState.errors;

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      fournisseur: values.fournisseur || undefined,
      reference: values.reference || undefined,
      notes: values.notes || undefined,
    };
    await createExpense.mutateAsync(payload);
    router.push("/assistant/expenses");
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
            Nouvelle dépense
          </h1>
          <p className="text-sm text-muted-foreground">
            Enregistrement d'une charge du cabinet
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {/* Section: Classification */}
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Classification
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Catégorie *</Label>
              <Select
                value={form.watch("categorie") ?? ""}
                onValueChange={(v) =>
                  form.setValue("categorie", v as ExpenseCategory, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  className={errors.categorie ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              {errors.categorie && (
                <p className="text-xs text-destructive">
                  {errors.categorie.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_depense">Date de la dépense *</Label>
              <Input
                id="date_depense"
                type="date"
                {...form.register("date_depense")}
                className={errors.date_depense ? "border-destructive" : ""}
              />
              {errors.date_depense && (
                <p className="text-xs text-destructive">
                  {errors.date_depense.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Section: Details */}
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Détails
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Ex: Loyer cabinet janvier 2026..."
                {...form.register("description")}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="montant">Montant (MAD) *</Label>
              <Input
                id="montant"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...form.register("montant", { valueAsNumber: true })}
                className={errors.montant ? "border-destructive" : ""}
              />
              {errors.montant && (
                <p className="text-xs text-destructive">
                  {errors.montant.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fournisseur">Fournisseur</Label>
              <Input
                id="fournisseur"
                placeholder="Nom du fournisseur..."
                {...form.register("fournisseur")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reference">Référence / N° facture</Label>
              <Input
                id="reference"
                placeholder="REF-2026-001..."
                {...form.register("reference")}
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (facultatif)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Remarques supplémentaires..."
              {...form.register("notes")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createExpense.isPending}>
            {createExpense.isPending
              ? "Enregistrement..."
              : "Enregistrer la dépense"}
          </Button>
        </div>
      </form>
    </div>
  );
}
