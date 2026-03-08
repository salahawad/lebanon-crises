"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default function SuccessPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "---";

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader showBack={false} />

      <main className="max-w-lg mx-auto px-4 py-8 text-center">
        <div className="mb-6">
          <span className="text-5xl block mb-4" aria-hidden="true">
            ✅
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t("success.title")}
          </h1>
          <p className="text-slate-600 text-sm">{t("success.subtitle")}</p>
        </div>

        {/* Reference code */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <p className="text-sm text-slate-600 mb-1">
            {t("success.referenceCode")}
          </p>
          <p className="text-3xl font-mono font-bold text-primary tracking-wider">
            {refCode}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {t("success.referenceNote")}
          </p>
        </Card>

        {/* What happens next */}
        <Card className="mb-6 text-start">
          <h2 className="text-base font-bold text-slate-900 mb-3">
            {t("success.whatNext")}
          </h2>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </span>
              {t("success.step1")}
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </span>
              {t("success.step2")}
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </span>
              {t("success.step3")}
            </li>
          </ol>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button variant="primary" size="xl">
              {t("success.backHome")}
            </Button>
          </Link>
          <Link href="/request-help" className="block">
            <Button variant="outline" size="xl">
              {t("success.submitAnother")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
