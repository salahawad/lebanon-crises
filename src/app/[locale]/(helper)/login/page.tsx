"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { adminLoginSchema } from "@/lib/validators/request";
import { signInHelper } from "@/lib/firebase/auth";

interface LoginForm {
  email: string;
  password: string;
}

export default function HelperLoginPage() {
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
      const { helper } = await signInHelper(data.email, data.password);
      if (!helper) {
        setError(t("errors.unauthorized"));
        return;
      }
      router.push("/browse");
    } catch {
      setError(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("helper.loginTitle")} />

      <main className="max-w-sm mx-auto px-4 py-12">
        <Card>
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            {t("helper.loginTitle")}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {t("helper.loginSubtitle")}
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
              {t("helper.signIn")}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-4">
            {t("helper.alreadyHaveAccount").replace("?", "")}{" "}
            <Link
              href="/register"
              className="text-primary font-medium underline"
            >
              {t("helper.register")}
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
