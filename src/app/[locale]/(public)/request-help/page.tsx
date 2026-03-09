"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { helpRequestSchema } from "@/lib/validators/request";
import { createHelpRequest } from "@/lib/firebase/requests";
import { checkRateLimit } from "@/lib/utils/helpers";
import { getRecaptchaToken } from "@/lib/utils/recaptcha";
import type { RequestCategory, UrgencyLevel, ContactMethod, Governorate } from "@/lib/types";
import type { z } from "zod";

type FormValues = z.input<typeof helpRequestSchema>;

const CATEGORIES: RequestCategory[] = [
  "medicine", "shelter", "food", "baby_milk", "transport", "clothing", "hygiene", "other",
];
const GOVERNORATES: Governorate[] = [
  "beirut", "mount_lebanon", "north", "south", "bekaa", "baalbek_hermel", "akkar", "nabatieh",
];
const URGENCIES: UrgencyLevel[] = ["critical", "high", "medium", "low"];
const CONTACT_METHODS: ContactMethod[] = ["phone", "whatsapp", "no_contact"];

export default function RequestHelpPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(helpRequestSchema),
    defaultValues: {
      language: locale as "en" | "ar",
      contactMethod: "no_contact",
      urgency: "medium",
      phoneCountryCode: "+961",
      peopleCount: 1,
      consent: false as unknown as true, // starts unchecked, validated as true on submit
    },
  });

  const contactMethod = watch("contactMethod");
  const showPhone = contactMethod === "phone" || contactMethod === "whatsapp";

  const onSubmit = async (data: FormValues) => {
    if (!checkRateLimit("request_help", 5, 600000)) {
      setError(t("errors.rateLimit"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Verify human with reCAPTCHA v3
      const recaptchaToken = await getRecaptchaToken("submit_request");
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

      const result = await createHelpRequest(data as import("@/lib/types").HelpRequestFormData);
      router.push(`/success?ref=${result.referenceCode}`);
    } catch (err) {
      console.error(err);
      setError(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("request.title")} />

      <main className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm text-slate-600 mb-6">{t("request.subtitle")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("request.category")} *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const icons: Record<string, string> = {
                  medicine: "💊", shelter: "🏠", food: "🍞", baby_milk: "🍼",
                  transport: "🚗", clothing: "👕", hygiene: "🧴", other: "📦",
                };
                const selected = watch("category") === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue("category", cat, { shouldValidate: true })}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors tap-target ${
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
            {errors.category && (
              <p className="mt-1 text-xs text-danger">{t("common.required")}</p>
            )}
          </div>

          {/* Description */}
          <Textarea
            label={`${t("request.description")} *`}
            id="description"
            placeholder={t("request.descriptionPlaceholder")}
            error={errors.description?.message}
            {...register("description")}
          />

          {/* Governorate */}
          <Select
            label={`${t("request.governorate")} *`}
            id="governorate"
            placeholder={t("request.governorate")}
            error={errors.governorate?.message}
            options={GOVERNORATES.map((g) => ({
              value: g,
              label: t(`request.governorates.${g}`),
            }))}
            {...register("governorate")}
          />

          {/* City */}
          <Input
            label={`${t("request.city")} *`}
            id="city"
            placeholder={t("request.cityPlaceholder")}
            error={errors.city?.message}
            {...register("city")}
          />

          {/* Area */}
          <Input
            label={t("request.area")}
            id="area"
            placeholder={t("request.areaPlaceholder")}
            hint={t("request.areaPlaceholder")}
            {...register("area")}
          />

          {/* People count */}
          <Input
            label={`${t("request.peopleCount")} *`}
            id="peopleCount"
            type="number"
            min={1}
            placeholder={t("request.peopleCountPlaceholder")}
            error={errors.peopleCount?.message}
            {...register("peopleCount", { valueAsNumber: true })}
          />

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("request.urgency")} *
            </label>
            <div className="space-y-2">
              {URGENCIES.map((u) => {
                const selected = watch("urgency") === u;
                const colors: Record<string, string> = {
                  critical: "border-red-300 bg-red-50",
                  high: "border-orange-300 bg-orange-50",
                  medium: "border-yellow-300 bg-yellow-50",
                  low: "border-blue-300 bg-blue-50",
                };
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setValue("urgency", u, { shouldValidate: true })}
                    className={`w-full text-start p-3 rounded-lg border text-sm transition-colors tap-target ${
                      selected
                        ? `${colors[u]} border-2 font-semibold`
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {t(`request.urgencyLevels.${u}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("request.contactMethod")} *
            </label>
            <div className="space-y-2">
              {CONTACT_METHODS.map((cm) => {
                const selected = watch("contactMethod") === cm;
                return (
                  <button
                    key={cm}
                    type="button"
                    onClick={() => setValue("contactMethod", cm, { shouldValidate: true })}
                    className={`w-full text-start p-3 rounded-lg border text-sm transition-colors tap-target ${
                      selected
                        ? "bg-primary text-white border-primary font-semibold"
                        : "bg-white border-slate-200 hover:border-primary text-slate-700"
                    }`}
                  >
                    {t(`request.contactMethods.${cm}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone (conditional) */}
          {showPhone && (
            <Input
              label={t("request.phone")}
              id="phone"
              type="tel"
              placeholder={t("request.phonePlaceholder")}
              hint={t("request.phoneNote")}
              error={errors.phone?.message}
              {...register("phone")}
            />
          )}

          {/* Name */}
          <Input
            label={`${t("request.name")} (${t("common.optional")})`}
            id="name"
            placeholder={t("request.namePlaceholder")}
            {...register("name")}
          />

          {/* Consent */}
          <Checkbox
            id="consent"
            label={t("request.consent")}
            error={errors.consent?.message}
            {...register("consent")}
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" variant="primary" size="xl" loading={submitting}>
            {submitting ? t("request.submitting") : t("request.submitRequest")}
          </Button>
        </form>
      </main>
    </div>
  );
}
