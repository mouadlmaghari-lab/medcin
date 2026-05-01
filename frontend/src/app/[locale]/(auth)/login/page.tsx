"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AuthResponse } from "@/types/auth";

// ── Schemas ───────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
  remember: z.boolean(),
});

const twoFactorSchema = z.object({
  code: z.string().length(6, "Le code doit comporter 6 chiffres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type TwoFactorForm = z.infer<typeof twoFactorSchema>;

// ── Component ─────────────────────────────────────────────
export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const from = searchParams.get("from") ?? "/doctor/dashboard";

  // ── Login mutation ────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await api.post<
        | { data: AuthResponse; message: string }
        | { two_factor_required: true; temp_token: string }
      >("/auth/login", data);
      // API wraps success response in { data: {...}, message }
      return "data" in res.data ? res.data.data : res.data;
    },
    onSuccess: (data) => {
      if ("two_factor_required" in data && data.two_factor_required) {
        setTempToken(data.temp_token);
        setTwoFactorRequired(true);
        return;
      }
      const { user, token } = data as AuthResponse;
      setAuth(user, token);
      const dest =
        user.role === "secretary" ? "/assistant/dashboard" : "/doctor/dashboard";
      router.replace(dest);
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 403) {
        toast.error(t("accountDisabled"));
      } else if (status === 422) {
        const data = (
          error as { response?: { data?: { message?: string } } }
        )?.response?.data;
        toast.error(data?.message ?? t("validationError"));
      } else {
        toast.error(t("invalidCredentials"));
      }
    },
  });

  // ── 2FA mutation ──────────────────────────────────────
  const twoFactorMutation = useMutation({
    mutationFn: async (data: TwoFactorForm) => {
      const res = await api.post<{ data: AuthResponse }>("/2fa/verify", {
        code: data.code,
        temp_token: tempToken,
      });
      return res.data.data;
    },
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      const dest =
        user.role === "secretary" ? "/assistant/dashboard" : "/doctor/dashboard";
      router.replace(dest);
    },
    onError: () => {
      toast.error("Code invalide. Veuillez réessayer.");
    },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const twoFactorForm = useForm<TwoFactorForm>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: "" },
  });

  // ── 2FA screen ────────────────────────────────────────
  if (twoFactorRequired) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("twoFactor")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("twoFactorMessage")}</p>
        </div>

        <Form {...twoFactorForm}>
          <form
            onSubmit={twoFactorForm.handleSubmit((d) =>
              twoFactorMutation.mutate(d),
            )}
            className="space-y-4"
          >
            <FormField
              control={twoFactorForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("twoFactorCode")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus
                      className="text-center text-2xl tracking-[0.5em]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={twoFactorMutation.isPending}
            >
              {twoFactorMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("confirm")}
            </Button>
          </form>
        </Form>

        <button
          type="button"
          onClick={() => setTwoFactorRequired(false)}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("back")}
        </button>
      </div>
    );
  }

  // ── Login screen ──────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.52_0.14_145)] text-white">
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
          <span className="text-base font-bold">TabibCare</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">{t("welcomeBack")}</h1>
        <p className="text-sm text-muted-foreground">{t("welcomeMessage")}</p>
      </div>

      <Form {...loginForm}>
        <form
          onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))}
          className="space-y-4"
        >
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="dr.nom@cabinet.ma"
                    autoComplete="email"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t("password")}</FormLabel>
                  <a
                    href="/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {t("forgotPassword")}
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={loginForm.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  {t("rememberMe")}
                </FormLabel>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("signIn")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
