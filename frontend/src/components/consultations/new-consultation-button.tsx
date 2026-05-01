"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { useCreateConsultation } from "@/hooks/use-consultations";
import type { CreateConsultationPayload } from "@/types/consultation";

export function NewConsultationButton() {
  const t = useTranslations("consultations");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const createMutation = useCreateConsultation();

  const handleSubmit = useCallback(
    (values: CreateConsultationPayload) => {
      createMutation.mutate(values, {
        onSuccess: (c) => {
          setOpen(false);
          router.push(`/doctor/consultations/${c.id}`);
        },
      });
    },
    [createMutation, router],
  );

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t("newConsultation")}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("newConsultation")}</DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="p-1">
              <ConsultationForm
                onSubmit={handleSubmit}
                isPending={createMutation.isPending}
                submitLabel={t("saveConsultation")}
                onCancel={() => handleOpenChange(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
