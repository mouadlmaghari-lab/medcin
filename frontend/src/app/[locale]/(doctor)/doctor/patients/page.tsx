"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  SlidersHorizontal,
  UserRound,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardDataTable, type Column } from "@/components/ui/card-data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePatients, useDeletePatient } from "@/hooks/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import type { Patient } from "@/types/patient";

// ── Page ─────────────────────────────────────────────────
export default function PatientsPage() {
  const router = useRouter();
  const t = useTranslations("patients");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locale === "ar" ? ar : locale === "en" ? enUS : fr;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = usePatients({
    q: debouncedSearch || undefined,
    page,
    per_page: 20,
  });

  const deleteMutation = useDeletePatient();

  const patients = data?.data ?? [];
  const meta = data?.meta;

  // ── Columns ──────────────────────────────────────────────
  const columns: Column<Patient>[] = [
    {
      key: "numero_dossier",
      header: t("dossierNumber"),
      cell: (p) => (
        <Badge variant="secondary" className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-50 border border-emerald-200 px-2 py-0.5 shadow-none">
          {p.numero_dossier}
        </Badge>
      ),
      headerClassName: "w-[130px] uppercase text-[11px] font-bold text-muted-foreground tracking-wider py-4",
    },
    {
      key: "nom_complet",
      header: tCommon("patient"),
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-100">
            {p.nom_complet?.charAt(0) ?? "?"}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-foreground leading-none">{p.nom_complet}</span>
            {p.cin ? (
              <span className="text-xs text-muted-foreground mt-1 leading-none">{p.cin}</span>
            ) : null}
          </div>
        </div>
      ),
      headerClassName: "uppercase text-[11px] font-bold text-muted-foreground tracking-wider py-4",
    },
    {
      key: "telephone",
      header: t("phone"),
      cell: (p) => (
        <a
          href={`tel:${p.telephone}`}
          className="text-[13px] font-medium text-foreground hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {p.telephone}
        </a>
      ),
      headerClassName: "uppercase text-[11px] font-bold text-muted-foreground tracking-wider py-4",
    },
    {
      key: "date_naissance",
      header: t("ageAndBirth"),
      cell: (p) =>
        p.date_naissance ? (
          <span className="text-[13px] text-muted-foreground font-medium">
            {p.age ? <span>{p.age} {t("years")}</span> : <span className="text-muted-foreground">—</span>}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      headerClassName: "uppercase text-[11px] font-bold text-muted-foreground tracking-wider py-4",
    },
    {
      key: "genre",
      header: t("gender"),
      cell: (p) =>
        p.genre ? (
          <span className="text-[13px] text-muted-foreground font-medium">
            {p.genre === "Homme" ? t("male") : p.genre === "Femme" ? t("female") : p.genre}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      headerClassName: "w-[90px] uppercase text-[11px] font-bold text-muted-foreground tracking-wider py-4",
    },
    {
      key: "ville",
      header: t("city"),
      cell: (p) => <span className="text-[13px] text-muted-foreground font-medium">{p.ville ? p.ville : "—"}</span>,
      headerClassName: "uppercase text-[11px] font-bold text-muted-foreground tracking-wider py-4",
    },
    {
      key: "derniere_consultation",
      header: t("lastConsultation"),
      cell: (p) =>
        p.derniere_consultation ? (
          <span className="text-[13px] text-muted-foreground font-medium">
            {format(new Date(p.derniere_consultation), "dd MMM yyyy", {
              locale: dateLocale,
            })}
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground font-medium">{tCommon("none")}</span>
        ),
      headerClassName: "uppercase text-[11px] font-bold text-muted-foreground tracking-wider py-4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 pb-1">
        <h1 className="text-lg font-bold uppercase tracking-wide text-foreground">
          {t("title")}
        </h1>
        <Button
          variant="outline"
          className="rounded-full border-muted-foreground/30 font-bold text-[11px] tracking-wider uppercase h-9 px-5 shadow-sm hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-colors"
          onClick={() => router.push(`/${locale}/doctor/patients/new`)}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          {t("newPatient")}
        </Button>
      </div>

      <CardDataTable
        columns={columns}
        data={patients}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        onRowClick={(p) => router.push(`/${locale}/doctor/patients/${p.id}`)}
        selectable={true}
        selectedIds={new Set()}
        onSelectionChange={() => { }}
        topBar={
          <div className="flex items-center">
            <span className="text-[13px] font-medium text-muted-foreground mr-3">Show</span>
            <select
              className="w-[70px] bg-background border border-muted-foreground/20 px-3 py-1.5 rounded-md text-[13px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
              defaultValue="20"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-[13px] font-medium text-muted-foreground ml-3">entries</span>
          </div>
        }
        filters={
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4 w-full">
            <div className="space-y-1.5 min-w-[200px] flex-grow ml-auto sm:flex-grow-0">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                {tCommon("search")}
              </label>
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t("searchPlaceholder")}
                className="bg-transparent h-9 text-[13px] w-full"
              />
            </div>
          </div>
        }
        rowActions={(p) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-primary border-primary/30 hover:bg-primary hover:text-white transition-colors rounded-full shadow-none"
              onClick={() => router.push(`/${locale}/doctor/patients/${p.id}/edit`)}
              title={tCommon("edit")}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">{tCommon("edit")}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7 text-muted-foreground border-muted-foreground/30 hover:bg-muted-foreground hover:text-white transition-colors rounded-full shadow-none">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">{tCommon("options")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>{tCommon("exportCsv")}</DropdownMenuItem>
                <DropdownMenuItem>{tCommon("print")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 text-destructive border-destructive/30 hover:bg-destructive hover:text-white transition-colors rounded-full shadow-none"
              onClick={() => setDeleteTarget(p)}
              title={tCommon("delete")}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">{tCommon("delete")}</span>
            </Button>
          </div>
        )}
        emptyState={
          <EmptyState
            icon={UserRound}
            title={t("noPatients")}
            description={
              search
                ? t("noResultsFor", { query: search })
                : t("startByAdding")
            }
            action={
              search ? null : (
                <Button
                  size="sm"
                  onClick={() => router.push(`/${locale}/doctor/patients/new`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("newPatient")}
                </Button>
              )
            }
          />
        }
        pagination={{
          currentPage: meta?.current_page ?? 1,
          lastPage: meta?.last_page ?? 1,
          onPageChange: setPage,
          from: meta?.from,
          to: meta?.to,
          total: meta?.total,
        }}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open ? setDeleteTarget(null) : undefined}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("deletePatient")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("deleteConfirmMessage", { name: deleteTarget?.nom_complet || "" })}
            {" "}
            <span className="font-medium text-foreground">
              {t("actionIrreversible")}
            </span>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              {tCommon("delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
