"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("terms.title")} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <Card>
          <h1 className="text-xl font-bold text-slate-900 mb-4">
            {t("terms.title")}
          </h1>
          <div className="prose prose-sm text-slate-700 leading-relaxed">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="font-bold text-yellow-800">
                {t("terms.emergencyWarning")}
              </p>
            </div>

            <p>{t("terms.content")}</p>

            <h2 className="text-base font-bold mt-6 mb-2">{t("terms.aboutPlatform")}</h2>
            <p className="text-sm">
              {t("terms.aboutContent")}
            </p>

            <h2 className="text-base font-bold mt-6 mb-2">{t("terms.acceptableUse")}</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t("terms.useItem1")}</li>
              <li>{t("terms.useItem2")}</li>
              <li>{t("terms.useItem3")}</li>
              <li>{t("terms.useItem4")}</li>
              <li>{t("terms.useItem5")}</li>
            </ul>

            <h2 className="text-base font-bold mt-6 mb-2">{t("terms.limitations")}</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t("terms.limitItem1")}</li>
              <li>{t("terms.limitItem2")}</li>
              <li>{t("terms.limitItem3")}</li>
              <li>{t("terms.limitItem4")}</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
