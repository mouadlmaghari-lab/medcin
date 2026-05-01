"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  Users,
  CreditCard,
  Clock,
  UserPlus,
  CalendarPlus,
  Stethoscope,
  ArrowRight,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const KPI_CARDS = [
  {
    key: "todayAppointments" as const,
    value: "—",
    icon: CalendarDays,
    accentClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    trend: null,
  },
  {
    key: "totalPatients" as const,
    value: "—",
    icon: Users,
    accentClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    trend: null,
  },
  {
    key: "monthlyRevenue" as const,
    value: "— MAD",
    icon: CreditCard,
    accentClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    trend: null,
  },
  {
    key: "pendingPayments" as const,
    value: "—",
    icon: Clock,
    accentClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    trend: null,
  },
] as const;

const QUICK_ACTIONS = [
  {
    key: "newPatient" as const,
    href: "/doctor/patients?action=new",
    icon: UserPlus,
  },
  {
    key: "newAppointment" as const,
    href: "/doctor/appointments?action=new",
    icon: CalendarPlus,
  },
  {
    key: "newConsultation" as const,
    href: "/doctor/consultations?action=new",
    icon: Stethoscope,
  },
] as const;

export default function DoctorDashboardPage() {
  const t = useTranslations("dashboard");

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("welcomeMessage")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline-block">
            {today}
          </span>
          <Button asChild size="sm">
            <Link href="/doctor/appointments?action=new">
              <CalendarPlus className="h-4 w-4" />
              {t("newAppointment")}
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map(({ key, value, icon: Icon, accentClass, trend }) => (
          <Card key={key} className="py-4 transition-shadow hover:shadow-md">
            <CardContent className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accentClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {t(key)}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {value}
                </p>
                {trend !== null && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {trend} {t("trend")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-base">{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {QUICK_ACTIONS.map(({ key, href, icon: Icon }) => (
              <Button key={key} variant="outline" asChild>
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {t(key)}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Today's Appointments + Recent Patients */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Today's Appointments — wider */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">
              {t("todayAppointments")}
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/doctor/appointments">
                  {t("viewAll")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {/* Empty state — will be replaced by API data */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CalendarCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {t("noAppointmentsToday")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients — narrower */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {t("recentPatients")}
            </CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/doctor/patients">
                  {t("viewAll")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {/* Empty state — will be replaced by API data */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {t("noRecentPatients")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
