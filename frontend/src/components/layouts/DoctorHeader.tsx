"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/** Map route segments to nav translation keys */
const SEGMENT_KEYS: Record<string, string> = {
  dashboard: "dashboard",
  patients: "patients",
  appointments: "appointments",
  consultations: "consultations",
  prescriptions: "prescriptions",
  certificates: "certificates",
  payments: "payments",
  expenses: "expenses",
  reports: "reports",
  expertises: "expertises",
  settings: "settings",
  notifications: "notifications",
};

export function DoctorHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Extract the active segment from the pathname: /en/doctor/patients → "patients"
  const segments = pathname.split("/").filter(Boolean);
  const doctorIndex = segments.indexOf("doctor");
  const activeSegment =
    doctorIndex >= 0 && segments.length > doctorIndex + 1
      ? segments[doctorIndex + 1]
      : "dashboard";

  const pageTitle = SEGMENT_KEYS[activeSegment]
    ? t(SEGMENT_KEYS[activeSegment] as Parameters<typeof t>[0])
    : activeSegment;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
      {/* Breadcrumb / Page title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">{pageTitle}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/doctor/notifications" title={t("notifications")}>
            <Bell className="h-4 w-4" />
          </Link>
        </Button>

        {user && (
          <div className="flex items-center gap-2 ps-2 border-s">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline-block">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
