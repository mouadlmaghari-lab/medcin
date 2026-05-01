"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
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
import { useCreateInvoice } from "@/hooks/use-invoices";
import { usePatients } from "@/hooks/use-patients";
import { format } from "date-fns";

// ── Zod schema ──────────────────────────────────────────────────────────────
const lineSchema = z.object({
  description: z.string().min(1, "Description requise"),
  quantite: z.number().min(1, "≥ 1"),
  prix_unitaire_ht: z.number().min(0, "≥ 0"),
  tva: z.number().min(0).max(100),
});

const schema = z.object({
  patient_id: z.number({ error: "Sélectionnez un patient" }),
  date_facture: z.string().min(1, "Requis"),
  echeance: z.string().optional(),
  lignes: z.array(lineSchema).min(1, "Au moins une ligne"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Helpers ─────────────────────────────────────────────────────────────────
const TVA_OPTIONS = [0, 7, 10, 20] as const;

function lineHT(l: { quantite: number; prix_unitaire_ht: number }) {
  return (l.quantite || 0) * (l.prix_unitaire_ht || 0);
}
function lineTTC(l: { quantite: number; prix_unitaire_ht: number; tva: number }) {
  return lineHT(l) * (1 + (l.tva || 0) / 100);
}

// ── Component ────────────────────────────────────────────────────────────────
export default function InvoiceNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patient_id");

  const { data: patientsData } = usePatients({ page: 1 });
  const createInvoice = useCreateInvoice();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: patientIdParam ? Number(patientIdParam) : undefined,
      date_facture: format(new Date(), "yyyy-MM-dd"),
      echeance: "",
      lignes: [{ description: "", quantite: 1, prix_unitaire_ht: 0, tva: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lignes",
  });

  // Live totals
  const lignes = useWatch({ control: form.control, name: "lignes" }) ?? [];
  const totalHT = lignes.reduce((sum, l) => sum + lineHT(l), 0);
  const totalTVA = lignes.reduce((sum, l) => sum + (lineTTC(l) - lineHT(l)), 0);
  const totalTTC = lignes.reduce((sum, l) => sum + lineTTC(l), 0);

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      echeance: values.echeance || undefined,
      notes: values.notes || undefined,
    };
    const invoice = await createInvoice.mutateAsync(payload);
    router.push(`/doctor/invoices/${invoice.id}`);
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
          <h1 className="text-xl font-bold tracking-tight">Nouvelle facture</h1>
          <p className="text-sm text-muted-foreground">
            Facturation avec calcul HT / TVA / TTC
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {/* Patient + Dates */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-3">
              <Label>Patient *</Label>
              <Select
                value={form.watch("patient_id")?.toString() ?? ""}
                onValueChange={(v) =>
                  form.setValue("patient_id", Number(v), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  className={
                    form.formState.errors.patient_id
                      ? "border-destructive"
                      : ""
                  }
                >
                  <SelectValue placeholder="Sélectionner un patient..." />
                </SelectTrigger>
                <SelectContent>
                  {(patientsData?.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nom_complet}{" "}
                      <span className="text-muted-foreground">
                        · {p.numero_dossier}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.patient_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.patient_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_facture">Date de facture *</Label>
              <Input
                id="date_facture"
                type="date"
                {...form.register("date_facture")}
                className={
                  form.formState.errors.date_facture ? "border-destructive" : ""
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="echeance">Date d'échéance</Label>
              <Input
                id="echeance"
                type="date"
                {...form.register("echeance")}
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Lignes de facturation</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    description: "",
                    quantite: 1,
                    prix_unitaire_ht: 0,
                    tva: 0,
                  })
                }
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Ajouter une ligne
              </Button>
            </div>

            {/* Column headers */}
            <div className="hidden grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
              <div className="col-span-5">Description</div>
              <div className="col-span-1 text-end">Qté</div>
              <div className="col-span-2 text-end">P.U HT</div>
              <div className="col-span-1 text-end">TVA %</div>
              <div className="col-span-2 text-end">TTC</div>
              <div className="col-span-1" />
            </div>

            {fields.map((field, i) => {
              const l = lignes[i] ?? {
                quantite: 0,
                prix_unitaire_ht: 0,
                tva: 0,
              };
              const ht = lineHT(l);
              const ttc = lineTTC(l);
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-12 items-start gap-2"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      placeholder="Description de la prestation..."
                      {...form.register(`lignes.${i}.description`)}
                      className={
                        form.formState.errors.lignes?.[i]?.description
                          ? "border-destructive"
                          : ""
                      }
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-1">
                    <Input
                      type="number"
                      min={1}
                      className="text-end"
                      {...form.register(`lignes.${i}.quantite`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="text-end"
                      placeholder="0.00"
                      {...form.register(`lignes.${i}.prix_unitaire_ht`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-1">
                    <Select
                      value={String(
                        form.watch(`lignes.${i}.tva`) ?? 0,
                      )}
                      onValueChange={(v) =>
                        form.setValue(`lignes.${i}.tva`, Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TVA_OPTIONS.map((r) => (
                          <SelectItem key={r} value={String(r)}>
                            {r}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-10 sm:col-span-2 flex items-center justify-end">
                    <div className="text-end">
                      <p className="tabular-nums font-semibold">
                        {ttc.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        HT: {ht.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(i)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <Separator className="my-6" />
          <div className="ms-auto max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total HT</span>
              <span className="tabular-nums font-medium">
                {totalHT.toFixed(2)} MAD
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total TVA</span>
              <span className="tabular-nums font-medium">
                {totalTVA.toFixed(2)} MAD
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total TTC</span>
              <span className="tabular-nums text-primary">
                {totalTTC.toFixed(2)} MAD
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (facultatif)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Conditions de paiement, remarques..."
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
          <Button type="submit" disabled={createInvoice.isPending}>
            {createInvoice.isPending ? "Enregistrement..." : "Créer la facture"}
          </Button>
        </div>
      </form>
    </div>
  );
}
