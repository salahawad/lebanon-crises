"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { adminLoginSchema } from "@/lib/validators/request";
import { signInAdmin } from "@/lib/firebase/auth";

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    setError("");

    try {
      await signInAdmin(data.email, data.password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      if (err?.message === "Not authorized as admin") {
        setError(t("errors.unauthorized"));
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("admin.login")} />

      <main className="max-w-sm mx-auto px-4 py-12">
        <Card>
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            {t("admin.login")}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {t("common.appName")} — {t("admin.dashboard")}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t("helper.email")}
              id="email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label={t("helper.password")}
              id="password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={submitting}
            >
              {t("admin.login")}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
