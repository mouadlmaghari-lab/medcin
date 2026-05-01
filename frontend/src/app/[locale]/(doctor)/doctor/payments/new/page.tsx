"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";

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
import { useCreatePayment } from "@/hooks/use-payments";

const MODES = [
  { value: "especes", label: "Espèces" },
  { value: "carte", label: "Carte bancaire" },
  { value: "cheque", label: "Chèque" },
  { value: "virement", label: "Virement" },
  { value: "assurance", label: "Assurance" },
];

const schema = z.object({
  montant_du: z.number().positive("Montant requis"),
  montant_paye: z.number().min(0),
  mode_paiement: z.enum(["especes", "carte", "cheque", "virement", "assurance"]),
  date_paiement: z.string().min(1),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewPaymentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const patientId = Number(params.get("patient_id") ?? 0);
  const consultationId = params.get("consultation_id")
    ? Number(params.get("consultation_id"))
    : null;

  const createMutation = useCreatePayment();
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      montant_du: 0,
      montant_paye: 0,
      mode_paiement: "especes",
      date_paiement: today,
      reference: "",
      notes: "",
    },
  });

  const montantDu = form.watch("montant_du");
  const montantPaye = form.watch("montant_paye");
  const solde = Math.max(0, (montantDu ?? 0) - (montantPaye ?? 0));

  function handleSubmit(values: FormValues) {
    createMutation.mutate(
      {
        patient_id: patientId,
        consultation_id: consultationId,
        montant_du: values.montant_du,
        montant_paye: values.montant_paye,
        mode_paiement: values.mode_paiement,
        date_paiement: values.date_paiement,
        reference: values.reference || undefined,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => router.push("/doctor/payments"),
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
        <h1 className="text-xl font-bold tracking-tight">Nouveau règlement</h1>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="date_paiement"
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="montant_du"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant dû (MAD) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="montant_paye"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant payé (MAD) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Solde restant</p>
                <p
                  className={`text-xl font-bold ${solde > 0 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {solde.toLocaleString("fr-MA")} MAD
                </p>
                {solde === 0 && (
                  <p className="text-xs text-emerald-600">Soldé</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mode_paiement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de paiement *</FormLabel>
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
                        {MODES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence (chèque/virement)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="N° de chèque / référence" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
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
                Enregistrer le règlement
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
