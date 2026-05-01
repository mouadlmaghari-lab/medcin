"use client";

import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  /** Optional card-style header shown above the table */
  title?: string;
  /** Element placed in the top-right of the card header (e.g. a "⋯" menu) */
  headerAction?: React.ReactNode;
  /** Renders an extra "Actions" column at the end of each row */
  rowActions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyState,
  onRowClick,
  className,
  title,
  headerAction,
  rowActions,
}: DataTableProps<T>) {
  const allColumns = rowActions
    ? [
        ...columns,
        {
          key: "__actions__",
          header: "",
          cell: rowActions,
          className: "w-[80px]",
          headerClassName: "w-[80px]",
        } satisfies Column<T>,
      ]
    : columns;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card shadow-sm",
        className,
      )}
    >
      {/* Optional card header */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {headerAction && <div className="ml-auto">{headerAction}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {allColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={allColumns.length}
                  className="px-4 py-16 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={allColumns.length}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  {emptyState ?? "Aucun résultat"}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b last:border-0 transition-colors hover:bg-muted/50",
                    idx % 2 === 1 && "bg-muted/20",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {allColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3", col.className)}
                      onClick={
                        col.key === "__actions__"
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────

interface TablePaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  from?: number;
  to?: number;
  total?: number;
}

/** Generates a page-number array with "…" gaps for large page ranges. */
function buildPages(current: number, last: number): (number | "…")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < last - 2) pages.push("…");
  pages.push(last);

  return pages;
}

export function TablePagination({
  currentPage,
  lastPage,
  onPageChange,
  from,
  to,
  total,
}: TablePaginationProps) {
  if (lastPage <= 1) return null;

  const pages = buildPages(currentPage, lastPage);

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      {/* Count label */}
      {from != null && to != null && total != null ? (
        <span>
          {from}–{to} sur {total}
        </span>
      ) : (
        <span />
      )}

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 px-2.5"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Préc
        </Button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "h-8 min-w-8 rounded-md px-2.5 text-xs font-medium transition-colors",
                p === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-1 px-2.5"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          Suiv
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
