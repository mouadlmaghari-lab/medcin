"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";
import { Plus, Award } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { CertificateFormModal } from "@/components/certificates/certificate-form-modal";
import { useCertificates } from "@/hooks/use-certificates";
import type { Certificate, CertificateType } from "@/types/certificate";

export default function CertificatesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("certificates");
  const [createOpen, setCreateOpen] = useState(false);

  const dateLocale = locale === "ar" ? ar : locale === "en" ? enUS : fr;

  const TYPE_LABELS: Record<CertificateType, string> = {
    repos: t("typeRest"),
    aptitude: t("typeAptitude"),
    inapatitude: t("typeInapt"),
    hospitalisation: t("typeHospitalization"),
    custom: t("typeCustom"),
  };

  const columns: Column<Certificate>[] = [
    {
      key: "numero",
      header: t("certificateNumber"),
      cell: (c) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {c.numero}
        </span>
      ),
    },
    {
      key: "date",
      header: t("dateLabel"),
      cell: (c) =>
        format(new Date(c.date_certificat), "dd MMM yyyy", {
          locale: dateLocale,
        }),
    },
    {
      key: "patient",
      header: t("patientColumn"),
      cell: (c) =>
        c.patient ? (
          <div>
            <p className="font-medium">{c.patient.nom_complet}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {c.patient.numero_dossier}
            </p>
          </div>
        ) : null,
    },
    {
      key: "type",
      header: t("typeColumn"),
      cell: (c) => (
        <span className="rounded-full border px-2.5 py-0.5 text-xs">
          {TYPE_LABELS[c.type]}
        </span>
      ),
    },
    {
      key: "duree",
      header: t("durationColumn"),
      cell: (c) =>
        c.nombre_jours ? (
          <span className="text-sm font-medium">
            {c.nombre_jours} {t("days")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  const { data, isLoading } = useCertificates({});

  return (
    <>
      <div className="space-y-5">
        <PageHeader
          title={t("title")}
          actions={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t("newCertificate")}
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(c) => c.id}
          isLoading={isLoading}
          onRowClick={(c) => router.push(`/doctor/certificates/${c.id}`)}
          emptyState={
            <EmptyState
              icon={Award}
              title={t("noCertificates")}
              description={t("noCertificatesDescription")}
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  {t("newCertificate")}
                </Button>
              }
            />
          }
        />
      </div>

      <CertificateFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
