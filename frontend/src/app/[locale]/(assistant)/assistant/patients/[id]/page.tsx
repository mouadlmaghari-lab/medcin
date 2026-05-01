"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Pencil,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Upload,
  Briefcase,
  Heart,
} from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePatient, useUploadPatientPhoto } from "@/hooks/use-patients";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function AssistantPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { data: patient, isLoading } = usePatient(Number(id));
  const uploadPhoto = useUploadPatientPhoto(Number(id));

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-muted-foreground">Patient introuvable</p>
        <Button
          variant="link"
          onClick={() => router.push("/assistant/patients")}
          className="mt-2"
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header — no "Nouvelle consultation" button for assistant */}
      <div className="flex items-center justify-between gap-4">
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {patient.nom_complet}
              </h1>
              {patient.consent_signed_at && (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <p className="font-mono text-sm text-primary">
              {patient.numero_dossier}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/assistant/patients/${id}/edit`)}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left — photo + quick info */}
        <div className="space-y-4">
          {/* Avatar / Photo */}
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {patient.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={patient.photo_url}
                    alt={patient.nom_complet}
                    className="h-24 w-24 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {patient.nom_complet?.charAt(0) ?? "?"}
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold">{patient.nom_complet}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.genre ?? "—"}
                  {patient.age && ` · ${patient.age} ans`}
                </p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPhoto.mutate(file);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadPhoto.isPending}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {patient.photo_url ? "Changer la photo" : "Ajouter une photo"}
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Résumé</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultations</span>
                <span className="font-semibold">
                  {patient.consultations_count ?? 0}
                </span>
              </div>
              {patient.type_dossier && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type dossier</span>
                  <span>{patient.type_dossier}</span>
                </div>
              )}
              {patient.type_couverture && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Couverture</span>
                  <span>{patient.type_couverture}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dossier créé</span>
                <span>
                  {format(new Date(patient.created_at), "dd MMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>
              {patient.derniere_consultation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Dernière consultation
                  </span>
                  <span>
                    {format(
                      new Date(patient.derniere_consultation),
                      "dd MMM yyyy",
                      { locale: fr },
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — details */}
        <div className="space-y-4 lg:col-span-2">
          {/* Contact & Identity */}
          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Coordonnées</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={Phone}
                label="Téléphone"
                value={
                  <a
                    href={`tel:${patient.telephone}`}
                    className="hover:underline"
                  >
                    {patient.telephone}
                  </a>
                }
              />
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow icon={MapPin} label="Adresse" value={patient.adresse} />
              <InfoRow icon={MapPin} label="Ville" value={patient.ville} />
              <InfoRow
                icon={Calendar}
                label="Date de naissance"
                value={
                  patient.date_naissance
                    ? format(new Date(patient.date_naissance), "dd MMMM yyyy", {
                        locale: fr,
                      })
                    : null
                }
              />
              <InfoRow
                icon={MapPin}
                label="Lieu de naissance"
                value={patient.lieu_naissance}
              />
              {patient.cin && (
                <InfoRow
                  icon={FileText}
                  label="CIN"
                  value={<span className="font-mono">{patient.cin}</span>}
                />
              )}
              <InfoRow
                icon={Briefcase}
                label="Profession"
                value={patient.profession}
              />
              <InfoRow
                icon={Heart}
                label="Couverture sociale"
                value={patient.type_couverture}
              />
            </div>
          </div>

          {/* Observation */}
          {patient.observation && (
            <>
              <Separator />
              <div className="rounded-lg border bg-card p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">Observation</h3>
                <p className="whitespace-pre-wrap text-sm">
                  {patient.observation}
                </p>
              </div>
            </>
          )}

          {/* Consent (Law 09-08) */}
          <div
            className={`flex items-center gap-3 rounded-lg border p-4 ${
              patient.consent_signed_at
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/10"
                : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/10"
            }`}
          >
            {patient.consent_signed_at ? (
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium">
                {patient.consent_signed_at
                  ? "Consentement signé (Loi 09-08)"
                  : "Consentement non encore enregistré"}
              </p>
              {patient.consent_signed_at && (
                <p className="text-xs text-muted-foreground">
                  Le{" "}
                  {format(
                    new Date(patient.consent_signed_at),
                    "dd MMMM yyyy",
                    { locale: fr },
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
