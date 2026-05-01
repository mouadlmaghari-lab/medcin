"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "@/components/ui/data-table";

export interface Column<T> {
    key: string;
    header: React.ReactNode;
    cell: (row: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

export interface CardDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string | number;
    isLoading?: boolean;
    emptyState?: React.ReactNode;

    /** Enable row selection */
    selectable?: boolean;
    selectedIds?: Set<string | number>;
    onSelectionChange?: (selectedIds: Set<string | number>) => void;

    /** Slot for the top bar (e.g., Show X entries) */
    topBar?: React.ReactNode;
    /** Slot for advanced filters (rendered below top bar) */
    filters?: React.ReactNode;

    /** Actions per row, rendered in a sticky column on the right */
    rowActions?: (row: T) => React.ReactNode;
    onRowClick?: (row: T) => void;

    /** Footer pagination object */
    pagination?: {
        currentPage: number;
        lastPage: number;
        onPageChange: (page: number) => void;
        from?: number;
        to?: number;
        total?: number;
    };
}

export function CardDataTable<T>({
    columns,
    data,
    keyExtractor,
    isLoading,
    emptyState,
    selectable,
    selectedIds = new Set(),
    onSelectionChange,
    topBar,
    filters,
    rowActions,
    onRowClick,
    pagination,
}: CardDataTableProps<T>) {
    // Compute total columns taking selection and actions into account
    const totalColumns = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

    // Selection Logic
    const handleSelectAll = (checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) {
            onSelectionChange(new Set(data.map(keyExtractor)));
        } else {
            onSelectionChange(new Set());
        }
    };

    const handleSelectOne = (id: string | number, checked: boolean) => {
        if (!onSelectionChange) return;
        const newSet = new Set(selectedIds);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        onSelectionChange(newSet);
    };

    const isAllSelected = data.length > 0 && selectedIds.size === data.length;

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
            {/* Top Bar (Show X Entries, etc) */}
            {topBar && (
                <div className="flex items-center px-6 py-4 border-b bg-card">
                    {topBar}
                </div>
            )}

            {/* Filters Section */}
            {filters && (
                <div className="px-6 py-4 border-b bg-background">
                    {filters}
                </div>
            )}

            {/* Table Content */}
            <div className="overflow-x-auto w-full group/table">
                <table className="w-full text-[13px] text-left">
                    <thead>
                        <tr className="border-b bg-background">
                            {selectable && (
                                <th className="px-4 py-4 w-1 flex-shrink-0 align-middle">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        className="rounded bg-muted/40 shadow-none border-muted-foreground/30"
                                    />
                                </th>
                            )}

                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap align-middle",
                                        col.headerClassName
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}

                            {rowActions && (
                                <th className="px-4 py-4 w-auto sticky right-0 bg-background z-10 shadow-[-1px_0_0_0_theme(colors.border)] text-right">
                                    {/* Empty header for actions column */}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={totalColumns} className="px-4 py-16 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={totalColumns}
                                    className="px-4 py-8 text-center text-muted-foreground border-b text-[13px]"
                                >
                                    {emptyState ?? "Aucun résultat"}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => {
                                const id = keyExtractor(row);
                                return (
                                    <tr
                                        key={id}
                                        onClick={() => onRowClick?.(row)}
                                        className={cn(
                                            "border-b last:border-0 hover:bg-muted/30 transition-colors group/row",
                                            onRowClick && "cursor-pointer"
                                        )}
                                    >
                                        {selectable && (
                                            <td
                                                className="px-4 py-3 align-middle"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Checkbox
                                                    checked={selectedIds.has(id)}
                                                    onCheckedChange={(checked) => handleSelectOne(id, !!checked)}
                                                    className="rounded bg-muted/40 shadow-none border-muted-foreground/30"
                                                />
                                            </td>
                                        )}

                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={cn("px-4 py-3 align-middle", col.className)}
                                            >
                                                {col.cell(row)}
                                            </td>
                                        ))}

                                        {rowActions && (
                                            <td
                                                className="px-4 py-2 align-middle text-right sticky right-0 bg-background group-hover/row:bg-muted/30 shadow-[-1px_0_0_0_theme(colors.border)] z-10 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {rowActions(row)}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            {pagination && (
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t bg-background gap-4">
                    <p className="m-0 text-[13px] text-muted-foreground font-medium">
                        {pagination.from != null && pagination.to != null && pagination.total != null ? (
                            <>
                                Showing <span className="font-bold text-foreground">{pagination.from}</span> to{" "}
                                <span className="font-bold text-foreground">{pagination.to}</span> of{" "}
                                <span className="font-bold text-foreground">{pagination.total}</span> entries
                            </>
                        ) : null}
                    </p>

                    <TablePagination
                        currentPage={pagination.currentPage}
                        lastPage={pagination.lastPage}
                        onPageChange={pagination.onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
