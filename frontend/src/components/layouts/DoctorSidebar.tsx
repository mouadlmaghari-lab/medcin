"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  FileText,
  Award,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileOutput,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";

const NAV_ITEMS = [
  {
    label: "dashboard" as const,
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
  },
  { label: "patients" as const, href: "/doctor/patients", icon: Users },
  {
    label: "appointments" as const,
    href: "/doctor/appointments",
    icon: CalendarDays,
  },
  {
    label: "consultations" as const,
    href: "/doctor/consultations",
    icon: Stethoscope,
  },
  {
    label: "prescriptions" as const,
    href: "/doctor/prescriptions",
    icon: FileText,
  },
  {
    label: "certificates" as const,
    href: "/doctor/certificates",
    icon: Award,
  },
  { label: "payments" as const, href: "/doctor/payments", icon: CreditCard },
  { label: "expenses" as const, href: "/doctor/expenses", icon: FileOutput },
  { label: "reports" as const, href: "/doctor/reports", icon: BarChart3 },
  {
    label: "expertises" as const,
    href: "/doctor/expertises",
    icon: ClipboardCheck,
  },
] as const;

interface DoctorSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function DoctorSidebar({ collapsed, onToggle }: DoctorSidebarProps) {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      clearAuth();
      window.location.href = "/login";
    },
    onError: () => {
      toast.error(tAuth("logoutError"));
    },
  });

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4 shrink-0",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight">TabibCare</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
            collapsed && "mx-auto",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? t(label) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0",
                      active ? "h-4.5 w-4.5" : "h-4 w-4",
                    )}
                  />
                  {!collapsed && <span>{t(label)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom — user + actions */}
      <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5 shrink-0">
        <Link
          href="/doctor/notifications"
          title={collapsed ? t("notifications") : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          <Bell className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t("notifications")}</span>}
        </Link>

        <Link
          href="/doctor/settings"
          title={collapsed ? t("settings") : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t("settings")}</span>}
        </Link>

        {!collapsed && user && (
          <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary-foreground shrink-0">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/50">
                {tCommon("doctor")}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => logoutMutation.mutate()}
          title={collapsed ? t("logout") : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/80 hover:bg-destructive/15 hover:text-destructive transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
