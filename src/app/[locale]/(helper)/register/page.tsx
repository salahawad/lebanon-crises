"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { helperSchema } from "@/lib/validators/request";
import { registerHelper } from "@/lib/firebase/auth";
import { getRecaptchaToken } from "@/lib/utils/recaptcha";
import type { RequestCategory, Governorate } from "@/lib/types";
import { Link } from "@/i18n/navigation";
import type { z } from "zod";

type HelperFormValues = z.input<typeof helperSchema>;

const CATEGORIES: RequestCategory[] = [
  "medicine", "shelter", "food", "baby_milk", "transport", "clothing", "hygiene", "other",
];
const GOVERNORATES: Governorate[] = [
  "beirut", "mount_lebanon", "north", "south", "bekaa", "baalbek_hermel", "akkar", "nabatieh",
];

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HelperFormValues>({
    resolver: zodResolver(helperSchema),
    defaultValues: {
      suppliesCanProvide: [],
    },
  });

  const selectedSupplies = watch("suppliesCanProvide");

  const toggleSupply = (cat: RequestCategory) => {
    const current = selectedSupplies || [];
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setValue("suppliesCanProvide", next);
  };

  const onSubmit = async (data: HelperFormValues) => {
    setSubmitting(true);
    setError("");

    try {
      // Verify human with reCAPTCHA v3
      const recaptchaToken = await getRecaptchaToken("register_helper");
      if (recaptchaToken) {
        const verifyRes = await fetch("/api/verify-recaptcha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: recaptchaToken }),
        });
        if (!verifyRes.ok) {
          setError(t("errors.captchaFailed"));
          setSubmitting(false);
          return;
        }
      }

      await registerHelper(data.email, data.password, {
        name: data.name,
        organization: data.organization,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        governorate: data.governorate,
        suppliesCanProvide: data.suppliesCanProvide || [],
      });
      router.push("/browse");
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in.");
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("helper.title")} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm text-slate-600 mb-6">{t("helper.subtitle")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label={`${t("helper.name")} *`}
            id="name"
            placeholder={t("helper.namePlaceholder")}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label={`${t("helper.organization")} (${t("common.optional")})`}
            id="organization"
            placeholder={t("helper.organizationPlaceholder")}
            {...register("organization")}
          />

          <Input
            label={`${t("helper.email")} *`}
            id="email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label={`${t("helper.password")} *`}
            id="password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label={`${t("helper.phone")} (${t("common.optional")})`}
            id="phone"
            type="tel"
            {...register("phone")}
          />

          <Input
            label={`${t("helper.whatsapp")} (${t("common.optional")})`}
            id="whatsapp"
            type="tel"
            {...register("whatsapp")}
          />

          <Select
            label={`${t("helper.governorate")} (${t("common.optional")})`}
            id="governorate"
            placeholder={t("request.governorate")}
            options={GOVERNORATES.map((g) => ({
              value: g,
              label: t(`request.governorates.${g}`),
            }))}
            {...register("governorate")}
          />

          {/* Supplies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("helper.supplies")}
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const icons: Record<string, string> = {
                  medicine: "💊", shelter: "🏠", food: "🍞", baby_milk: "🍼",
                  transport: "🚗", clothing: "👕", hygiene: "🧴", other: "📦",
                };
                const selected = selectedSupplies?.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleSupply(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors tap-target ${
                      selected
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-slate-700 border-slate-200 hover:border-primary"
                    }`}
                  >
                    <span>{icons[cat]}</span>
                    {t(`request.categories.${cat}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="xl" loading={submitting}>
            {submitting ? t("helper.registering") : t("helper.register")}
          </Button>

          <p className="text-center text-sm text-slate-600">
            {t("helper.alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="text-primary font-medium underline"
            >
              {t("helper.signIn")}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
