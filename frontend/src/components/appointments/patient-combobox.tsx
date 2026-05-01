"use client";

import { useState, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { usePatients } from "@/hooks/use-patients";
import type { Patient } from "@/types/patient";

interface PatientComboboxProps {
  value?: number | null;
  selectedPatientName?: string;
  onChange: (patientId: number, patient: Patient) => void;
  onCreateNew?: () => void;
  disabled?: boolean;
}

export function PatientCombobox({
  value,
  selectedPatientName,
  onChange,
  onCreateNew,
  disabled,
}: PatientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePatients({
    q: search || undefined,
    per_page: 10,
  });

  const patients = data?.data ?? [];

  const selectedPatient = patients.find((p) => p.id === value);

  const handleSelect = useCallback(
    (patient: Patient) => {
      onChange(patient.id, patient);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedPatient ? (
            <span className="truncate">
              {selectedPatient.nom_complet}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {selectedPatient.numero_dossier}
              </span>
            </span>
          ) : selectedPatientName ? (
            <span className="truncate">{selectedPatientName}</span>
          ) : (
            <span className="text-muted-foreground">
              Rechercher un patient...
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Nom, téléphone ou CIN..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : patients.length === 0 ? (
              <CommandEmpty>Aucun patient trouvé</CommandEmpty>
            ) : (
              <CommandGroup>
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.id}
                    value={String(patient.id)}
                    onSelect={() => handleSelect(patient)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === patient.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex-1 min-w-0 py-0.5">
                      <p className="truncate text-[13px] font-bold text-foreground">
                        {patient.nom_complet}
                      </p>
                      <p className="truncate text-[11px] font-medium text-muted-foreground/70 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] uppercase font-bold text-emerald-700/80 bg-emerald-50 px-1 rounded">
                          {patient.numero_dossier}
                        </span>
                        {patient.telephone ? <span>· {patient.telephone}</span> : ""}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {onCreateNew && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onCreateNew();
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="font-medium">Créer un nouveau patient</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
