"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Eye,
    FileText,
    Printer,
    Trash2,
    X,
    CircleDollarSign,
    User,
    Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TablePagination } from "@/components/ui/data-table"; // Reusing the pagination block

// Example types for your data
export interface Magasin {
    id: string | number;
    nom: string;
}

export interface Commande {
    id: string | number;
    statut: string;
    date_commande: string;
    num_doc_complet: string;
    magasin: Magasin | null;
    total_ttc: number;
    creator: { name: string } | null;
    created_at: string;
    bonLivraison: { id: string | number; num_doc_complet: string } | null;
}

export interface CommandesTableProps {
    commandes: Commande[];
    magasins: Magasin[];
    totalItems?: number;
    currentPage?: number;
    lastPage?: number;
    onView?: (id: string | number) => void;
    onGenerateBL?: (id: string | number) => void;
    onPrint?: (id: string | number) => void;
    onDelete?: (id: string | number) => void;
    onPageChange?: (page: number) => void;
}

export function CommandesTable({
    commandes = [],
    magasins = [],
    totalItems = 0,
    currentPage = 1,
    lastPage = 1,
    onView,
    onGenerateBL,
    onPrint,
    onDelete,
    onPageChange,
}: CommandesTableProps) {
    // --- States for filters ---
    const [perPage, setPerPage] = useState("10");
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [magasinId, setMagasinId] = useState("all");
    const [statut, setStatut] = useState("all");
    const [searchDoc, setSearchDoc] = useState("");

    // Total TTC Popover state
    const [op, setOp] = useState("all");
    const [totalMin, setTotalMin] = useState("");
    const [totalMax, setTotalMax] = useState("");
    const [activeOp, setActiveOp] = useState<string | null>(null);
    const [activeMin, setActiveMin] = useState("");
    const [activeMax, setActiveMax] = useState("");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Checkbox selection state
    const [selectAll, setSelectAll] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    // Handle Select All
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedIds(new Set(commandes.map((c) => c.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    // Handle individual select
    const handleSelectOne = (id: string | number, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        setSelectedIds(newSet);
        setSelectAll(newSet.size === commandes.length && commandes.length > 0);
    };

    // Total filter Actions
    const applyTotalFilter = () => {
        if (op !== "all") {
            setActiveOp(op);
            setActiveMin(totalMin);
            setActiveMax(totalMax);
        }
        setIsPopoverOpen(false);
    };

    const resetTotalFilter = () => {
        setOp("all");
        setTotalMin("");
        setTotalMax("");
        setActiveOp(null);
        setActiveMin("");
        setActiveMax("");
    };

    const hasItems = commandes.length > 0;
    const firstItem = totalItems > 0 ? (currentPage - 1) * parseInt(perPage) + 1 : 0;
    const lastItem = totalItems > 0 ? Math.min(currentPage * parseInt(perPage), totalItems) : 0;

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
            {/* --- TOP: Show Entries & Pagination Meta --- */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                <div className="flex items-center space-x-3">
                    <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                        Show
                    </span>
                    <Select value={perPage} onValueChange={setPerPage}>
                        <SelectTrigger className="h-8 w-[70px] bg-muted/40 shadow-none text-[13px]">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                        entries
                    </span>
                </div>
            </div>

            {/* --- FILTERS SECTION --- */}
            <div className="px-6 py-5 border-b bg-muted/10">
                <div className="flex flex-wrap items-end gap-x-6 gap-y-4">

                    {/* Dates */}
                    <div className="space-y-1.5 min-w-[140px]">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Période du :
                        </label>
                        <Input
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="h-9 shadow-none bg-background text-[13px] w-full"
                        />
                    </div>
                    <div className="space-y-1.5 min-w-[140px]">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Au :
                        </label>
                        <Input
                            type="date"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.target.value)}
                            className="h-9 shadow-none bg-background text-[13px] w-full"
                        />
                    </div>

                    {/* Magasin */}
                    <div className="space-y-1.5 min-w-[180px]">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Magasin :
                        </label>
                        <Select value={magasinId} onValueChange={setMagasinId}>
                            <SelectTrigger className="h-9 w-full bg-background shadow-none text-[13px]">
                                <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                {magasins.map((m) => (
                                    <SelectItem key={m.id} value={m.id.toString()}>
                                        {m.nom}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Statut */}
                    <div className="space-y-1.5 min-w-[160px]">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Statut :
                        </label>
                        <Select value={statut} onValueChange={setStatut}>
                            <SelectTrigger className="h-9 w-full bg-background shadow-none text-[13px]">
                                <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="EN COURS">EN COURS</SelectItem>
                                <SelectItem value="LIVRÉ">LIVRÉ</SelectItem>
                                <SelectItem value="ANNULÉ">ANNULÉ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* N° Document */}
                    <div className="space-y-1.5 min-w-[200px] flex-grow">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            N° Document :
                        </label>
                        <Input
                            value={searchDoc}
                            onChange={(e) => setSearchDoc(e.target.value)}
                            placeholder="Recherche..."
                            className="bg-transparent h-9 text-[13px]"
                        />
                    </div>

                    {/* Total TTC Popover Filter */}
                    <div className="space-y-1.5 min-w-[160px]">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block opacity-0 select-none">
                            Action
                        </label>
                        <div className="flex items-center gap-2">
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={activeOp ? "default" : "outline"}
                                        className="h-9 px-4 text-[13px] shadow-sm tracking-wide"
                                    >
                                        <CircleDollarSign className="mr-2 h-4 w-4" />
                                        {activeOp
                                            ? `Total: ${activeOp} ${activeMin} ${activeOp === 'between' ? `- ${activeMax}` : ''}`
                                            : 'Total TTC'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-[280px] p-4 shadow-xl border-muted-foreground/20">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold uppercase text-muted-foreground">
                                                Condition
                                            </label>
                                            <Select value={op} onValueChange={setOp}>
                                                <SelectTrigger className="h-9 text-[13px] bg-background">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Choisir...</SelectItem>
                                                    <SelectItem value="=">Égal à</SelectItem>
                                                    <SelectItem value=">">Supérieur à</SelectItem>
                                                    <SelectItem value=">=">Supérieur ou égal à</SelectItem>
                                                    <SelectItem value="<">Inférieur à</SelectItem>
                                                    <SelectItem value="<=">Inférieur ou égal à</SelectItem>
                                                    <SelectItem value="between">Entre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {op !== "all" && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <label className="text-[11px] font-bold uppercase text-muted-foreground">
                                                    {op === "between" ? "Min" : "Valeur"}
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="Montant..."
                                                    value={totalMin}
                                                    onChange={(e) => setTotalMin(e.target.value)}
                                                    className="h-9 text-[13px]"
                                                />
                                            </div>
                                        )}

                                        {op === "between" && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <label className="text-[11px] font-bold uppercase text-muted-foreground">
                                                    Max
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="Montant..."
                                                    value={totalMax}
                                                    onChange={(e) => setTotalMax(e.target.value)}
                                                    className="h-9 text-[13px]"
                                                />
                                            </div>
                                        )}

                                        <Button className="w-full text-[13px]" onClick={applyTotalFilter}>
                                            Appliquer
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {activeOp && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                                    onClick={resetTotalFilter}
                                    title="Effacer filtre prix"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABLE CONTENT --- */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-[13px] text-left">
                    <thead>
                        <tr className="border-b bg-background">
                            <th className="px-4 py-4 w-1 flex-shrink-0">
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={handleSelectAll}
                                    className="rounded bg-muted/40 shadow-none border-muted-foreground/30"
                                />
                            </th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground">STATUT</th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap">DATE</th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap">NumDocComplet</th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground">MAGASIN</th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap">TOTAL TTC</th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap">CRÉÉ PAR</th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap">CRÉÉ LE</th>
                            <th className="px-4 py-4 uppercase text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap">BON LIVRAISON</th>
                            {/* Sticky actions header */}
                            <th className="px-4 py-4 w-auto sticky right-0 bg-background z-10 shadow-[-1px_0_0_0_theme(colors.border)] text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {!hasItems ? (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground border-b text-[13px]">
                                    No commandes found.
                                </td>
                            </tr>
                        ) : (
                            commandes.map((commande) => (
                                <tr key={commande.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
                                    <td className="px-4 py-3 align-middle">
                                        <Checkbox
                                            checked={selectedIds.has(commande.id)}
                                            onCheckedChange={(checked) => handleSelectOne(commande.id, !!checked)}
                                            className="rounded bg-muted/40 shadow-none border-muted-foreground/30"
                                        />
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        <Badge
                                            variant="secondary"
                                            className={
                                                commande.statut === "LIVRÉ"
                                                    ? "bg-emerald-50 text-emerald-700 border-none px-2 shadow-none font-bold"
                                                    : commande.statut === "EN COURS"
                                                        ? "bg-amber-50 text-amber-700 border-none px-2 shadow-none font-bold"
                                                        : "bg-blue-50 text-blue-700 border-none px-2 shadow-none font-bold"
                                            }
                                        >
                                            {commande.statut}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 align-middle font-medium text-foreground">
                                        {commande.date_commande ? format(new Date(commande.date_commande), "yyyy-MM-dd") : ""}
                                    </td>
                                    <td className="px-4 py-3 align-middle italic tracking-wide font-medium">
                                        {commande.num_doc_complet}
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        {commande.magasin?.nom ?? "-"}
                                    </td>
                                    <td className="px-4 py-3 align-middle font-bold">
                                        {Number(commande.total_ttc).toLocaleString("fr-MA", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })} DH
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        {commande.creator ? (
                                            <div className="flex items-center text-muted-foreground font-medium text-xs">
                                                <User className="mr-1.5 h-3.5 w-3.5" />
                                                {commande.creator.name}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-4 py-3 align-middle text-muted-foreground text-xs font-medium">
                                        {commande.created_at ? format(new Date(commande.created_at), "dd/MM/yyyy HH:mm") : "-"}
                                    </td>
                                    <td className="px-4 py-3 align-middle">
                                        {commande.bonLivraison ? (
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer shadow-none">
                                                {commande.bonLivraison.num_doc_complet}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>

                                    {/* ACTIONS - Sticky Right Side */}
                                    <td className="px-4 py-2 align-middle text-right sticky right-0 bg-background group-hover:bg-muted/30 shadow-[-1px_0_0_0_theme(colors.border)] z-10 transition-colors">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors rounded-full"
                                                onClick={() => onView && onView(commande.id)}
                                                title="Voir"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-100 transition-colors rounded-full"
                                                onClick={() => onGenerateBL && onGenerateBL(commande.id)}
                                                title="Générer Bon de Livraison"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-full"
                                                onClick={() => onPrint && onPrint(commande.id)}
                                                title="Imprimer"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
                                                onClick={() => onDelete && onDelete(commande.id)}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- FOOTER: Pagination --- */}
            {hasItems && (
                <div className="px-6 py-4 flex items-center justify-between border-t bg-muted/20">
                    <p className="m-0 text-[13px] text-muted-foreground font-medium">
                        Showing <span className="font-bold text-foreground">{firstItem}</span> to <span className="font-bold text-foreground">{lastItem}</span> of <span className="font-bold text-foreground">{totalItems}</span> entries
                    </p>

                    {/* We reuse the project's TablePagination component */}
                    <TablePagination
                        currentPage={currentPage}
                        lastPage={lastPage}
                        onPageChange={onPageChange || (() => { })}
                    />
                </div>
            )}
        </div>
    );
}
