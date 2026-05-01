"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: { email: string }) =>
      api.post("/auth/forgot-password", data),
    onSuccess: () => {
      toast.success(t("resetSent"));
      form.reset();
    },
    onError: () => {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("forgotPassword")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("resetMessage")}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="dr.nom@cabinet.ma"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("resetPassword")}
          </Button>
        </form>
      </Form>

      <a
        href="/login"
        className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("back")}
      </a>
    </div>
  );
}
