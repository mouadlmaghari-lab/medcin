"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Plus,
  FileText,
  Gavel,
  Share2,
  EyeOff,
  Printer,
  Trash2,
  Paperclip,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useReports,
  useToggleReportShare,
  useDeleteReport,
  useExpertises,
  useDeleteExpertise,
} from "@/hooks/use-documents";
import api from "@/lib/api";
import { toast } from "sonner";
import type { MedicalReport, Expertise } from "@/types/document";

// ── Tab type ──────────────────────────────────────────────────────────────────
type Tab = "reports" | "expertises";

// ── Statut badge for expertises ───────────────────────────────────────────────
function ExpertiseStatutBadge({ statut }: { statut: string }) {
  return statut === "termine" ? (
    <Badge variant="default" className="gap-1">
      <CheckCircle2 className="h-3 w-3" />
      Terminée
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <Clock className="h-3 w-3" />
      En cours
    </Badge>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reports");
  const [reportPage, setReportPage] = useState(1);
  const [expertisePage, setExpertisePage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "report" | "expertise";
    id: number;
    titre: string;
  } | null>(null);

  // ── Reports ─────────────────────────────────────────────────────────────
  const { data: reportsData, isLoading: reportsLoading } = useReports({
    page: reportPage,
    per_page: 15,
  });
  const toggleShare = useToggleReportShare(deleteTarget?.id ?? 0);
  const deleteReport = useDeleteReport();

  // ── Expertises ──────────────────────────────────────────────────────────
  const { data: expertisesData, isLoading: expertisesLoading } = useExpertises({
    page: expertisePage,
    per_page: 15,
  });
  const deleteExpertise = useDeleteExpertise();

  // ── Print / PDF helpers ─────────────────────────────────────────────────
  async function handlePrintReport(id: number) {
    try {
      const resp = await api.get(`/doctor/pdf/rapport/${id}`, {
        responseType: "blob",
      });
      window.open(URL.createObjectURL(resp.data as Blob), "_blank");
    } catch {
      toast.error("Impossible de générer le PDF");
    }
  }

  // ── Reports columns ─────────────────────────────────────────────────────
  const reportColumns: Column<MedicalReport>[] = [
    {
      key: "date_rapport",
      header: "Date",
      cell: (r) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(r.date_rapport), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
      headerClassName: "w-[120px]",
    },
    {
      key: "patient",
      header: "Patient",
      cell: (r) =>
        r.patient ? (
          <div>
            <p className="font-medium">{r.patient.nom_complet}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {r.patient.numero_dossier}
            </p>
          </div>
        ) : null,
    },
    {
      key: "titre",
      header: "Titre",
      cell: (r) => <span className="font-medium">{r.titre}</span>,
    },
    {
      key: "partage",
      header: "Partage",
      cell: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Directly toggle — useToggleReportShare needs the report ID
            api
              .patch(`/doctor/reports/${r.id}/toggle-share`)
              .then(() => {
                toast.success(
                  r.partage_patient
                    ? "Partage retiré"
                    : "Rapport partagé avec le patient",
                );
              })
              .catch(() => toast.error("Erreur lors du changement"));
          }}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            r.partage_patient
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          title={r.partage_patient ? "Retirer le partage" : "Partager avec le patient"}
        >
          {r.partage_patient ? (
            <>
              <Share2 className="h-3 w-3" />
              Partagé
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3" />
              Privé
            </>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      cell: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrintReport(r.id);
            }}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Générer PDF"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({ type: "report", id: r.id, titre: r.titre });
            }}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // ── Expertises columns ──────────────────────────────────────────────────
  const expertiseColumns: Column<Expertise>[] = [
    {
      key: "date_expertise",
      header: "Date",
      cell: (e) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(e.date_expertise), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
      headerClassName: "w-[120px]",
    },
    {
      key: "patient",
      header: "Patient",
      cell: (e) =>
        e.patient ? (
          <div>
            <p className="font-medium">{e.patient.nom_complet}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {e.patient.numero_dossier}
            </p>
          </div>
        ) : null,
    },
    {
      key: "titre",
      header: "Titre",
      cell: (e) => <span className="font-medium">{e.titre}</span>,
    },
    {
      key: "statut",
      header: "Statut",
      cell: (e) => <ExpertiseStatutBadge statut={e.statut} />,
    },
    {
      key: "attachments",
      header: "PJ",
      cell: (e) =>
        e.attachments?.length > 0 ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            {e.attachments.length}
          </span>
        ) : null,
      headerClassName: "w-[60px]",
    },
    {
      key: "actions",
      header: "",
      className: "w-14",
      cell: (e) => (
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            setDeleteTarget({ type: "expertise", id: e.id, titre: e.titre });
          }}
          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  const reportsMeta = reportsData?.meta;
  const expertisesMeta = expertisesData?.meta;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Documents médicaux"
        description="Rapports et expertises du cabinet"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "reports" ? (
              <Button asChild size="sm">
                <Link href="/doctor/documents/reports/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nouveau rapport
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/doctor/documents/expertises/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nouvelle expertise
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        {(
          [
            { id: "reports", label: "Rapports médicaux", icon: FileText },
            { id: "expertises", label: "Expertises", icon: Gavel },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === "reports" && reportsMeta && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                {reportsMeta.total}
              </span>
            )}
            {id === "expertises" && expertisesMeta && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                {expertisesMeta.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Reports tab ──────────────────────────────────────────────────── */}
      {activeTab === "reports" && (
        <>
          <DataTable
            columns={reportColumns}
            data={reportsData?.data ?? []}
            keyExtractor={(r) => r.id}
            isLoading={reportsLoading}
            emptyState={
              <div className="py-16 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Aucun rapport médical
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/doctor/documents/reports/new">
                    Créer un rapport
                  </Link>
                </Button>
              </div>
            }
          />
          {reportsMeta && reportsMeta.last_page > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{reportsMeta.from}–{reportsMeta.to} sur {reportsMeta.total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={reportPage === 1} onClick={() => setReportPage((p) => p - 1)}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={reportPage === reportsMeta.last_page} onClick={() => setReportPage((p) => p + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Expertises tab ───────────────────────────────────────────────── */}
      {activeTab === "expertises" && (
        <>
          <DataTable
            columns={expertiseColumns}
            data={expertisesData?.data ?? []}
            keyExtractor={(e) => e.id}
            isLoading={expertisesLoading}
            emptyState={
              <div className="py-16 text-center">
                <Gavel className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Aucune expertise
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/doctor/documents/expertises/new">
                    Créer une expertise
                  </Link>
                </Button>
              </div>
            }
          />
          {expertisesMeta && expertisesMeta.last_page > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{expertisesMeta.from}–{expertisesMeta.to} sur {expertisesMeta.total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={expertisePage === 1} onClick={() => setExpertisePage((p) => p - 1)}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={expertisePage === expertisesMeta.last_page} onClick={() => setExpertisePage((p) => p + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Delete confirmation dialog ────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Voulez-vous supprimer définitivement{" "}
              <strong>« {deleteTarget?.titre} »</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={
                deleteReport.isPending || deleteExpertise.isPending
              }
              onClick={() => {
                if (!deleteTarget) return;
                if (deleteTarget.type === "report") {
                  deleteReport.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                } else {
                  deleteExpertise.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
