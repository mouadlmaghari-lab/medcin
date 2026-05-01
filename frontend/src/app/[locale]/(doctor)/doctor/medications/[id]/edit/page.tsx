"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { useMedication, useUpdateMedication } from "@/hooks/use-medications";
import {
  MEDICATION_CATEGORIES,
  MEDICATION_FORMES,
  MEDICATION_UNITES,
} from "@/types/medication";

// ── Schema (same as new) ──────────────────────────────────────────────────────
const schema = z.object({
  nom: z.string().min(1, "Nom requis").max(200),
  nom_generique: z.string().max(200).optional(),
  categorie: z.string().optional(),
  forme: z.string().optional(),
  unite: z.string().optional(),
  prix_achat: z.number({ error: "Prix invalide" }).min(0).optional().nullable(),
  prix_vente: z.number({ error: "Prix invalide" }).min(0).optional().nullable(),
  stock_qty: z.number().int().min(0).optional(),
  stock_alerte_min: z.number().int().min(0).optional(),
  date_expiration: z.string().optional(),
  code_barre: z.string().max(50).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────
export default function MedicationEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const numId = Number(id);

  const { data: medication, isLoading } = useMedication(numId);
  const updateMutation = useUpdateMedication(numId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: "",
      nom_generique: "",
      stock_qty: 0,
      stock_alerte_min: 5,
    },
  });

  // Populate form once data is loaded
  useEffect(() => {
    if (!medication) return;
    form.reset({
      nom: medication.nom,
      nom_generique: medication.nom_generique ?? "",
      categorie: medication.categorie ?? undefined,
      forme: medication.forme ?? undefined,
      unite: medication.unite ?? undefined,
      prix_achat: medication.prix_achat ?? undefined,
      prix_vente: medication.prix_vente ?? undefined,
      stock_qty: medication.stock_qty,
      stock_alerte_min: medication.stock_alerte_min,
      date_expiration: medication.date_expiration ?? "",
      code_barre: medication.code_barre ?? "",
      notes: medication.notes ?? "",
    });
  }, [medication, form]);

  const errors = form.formState.errors;

  async function onSubmit(values: FormValues) {
    const payload = {
      nom: values.nom,
      nom_generique: values.nom_generique || undefined,
      categorie: values.categorie || undefined,
      forme: values.forme || undefined,
      unite: values.unite || undefined,
      prix_achat: values.prix_achat ?? undefined,
      prix_vente: values.prix_vente ?? undefined,
      stock_qty: values.stock_qty,
      stock_alerte_min: values.stock_alerte_min,
      date_expiration: values.date_expiration || undefined,
      code_barre: values.code_barre || undefined,
      notes: values.notes || undefined,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => router.push("/doctor/medications"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-[600px] animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground">Médicament introuvable</p>
        <Button
          variant="link"
          onClick={() => router.push("/doctor/medications")}
          className="mt-2"
        >
          Retour au catalogue
        </Button>
      </div>
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
            Modifier — {medication.nom}
          </h1>
          <p className="text-sm text-muted-foreground">
            Mise à jour du catalogue
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Identification ──────────────────────────────────────────────── */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Identification
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nom">Nom commercial *</Label>
              <Input
                id="nom"
                {...form.register("nom")}
                className={errors.nom ? "border-destructive" : ""}
              />
              {errors.nom && (
                <p className="text-xs text-destructive">{errors.nom.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nom_generique">Nom générique (DCI)</Label>
              <Input id="nom_generique" {...form.register("nom_generique")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="code_barre">Code-barres</Label>
              <Input id="code_barre" {...form.register("code_barre")} />
            </div>
          </div>

          <Separator className="my-5" />

          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Classification
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select
                value={form.watch("categorie") ?? ""}
                onValueChange={(v) =>
                  form.setValue("categorie", v === "__none__" ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune catégorie</SelectItem>
                  {MEDICATION_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Forme</Label>
              <Select
                value={form.watch("forme") ?? ""}
                onValueChange={(v) =>
                  form.setValue("forme", v === "__none__" ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Forme..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {MEDICATION_FORMES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Unité</Label>
              <Select
                value={form.watch("unite") ?? ""}
                onValueChange={(v) =>
                  form.setValue("unite", v === "__none__" ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unité..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {MEDICATION_UNITES.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Tarifs ──────────────────────────────────────────────────────── */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tarifs (MAD)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prix_achat">Prix d'achat HT</Label>
              <Input
                id="prix_achat"
                type="number"
                min={0}
                step="0.01"
                {...form.register("prix_achat", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prix_vente">Prix de vente TTC</Label>
              <Input
                id="prix_vente"
                type="number"
                min={0}
                step="0.01"
                {...form.register("prix_vente", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        {/* ── Stock ───────────────────────────────────────────────────────── */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Stock
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="stock_qty">Quantité en stock</Label>
              <Input
                id="stock_qty"
                type="number"
                min={0}
                {...form.register("stock_qty", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock_alerte_min">Seuil d'alerte</Label>
              <Input
                id="stock_alerte_min"
                type="number"
                min={0}
                {...form.register("stock_alerte_min", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_expiration">Date d'expiration</Label>
              <Input
                id="date_expiration"
                type="date"
                {...form.register("date_expiration")}
              />
            </div>
          </div>
        </div>

        {/* ── Notes ───────────────────────────────────────────────────────── */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              {...form.register("notes")}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
