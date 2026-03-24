"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("privacy.title")} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <Card>
          <h1 className="text-xl font-bold text-slate-900 mb-4">
            {t("privacy.title")}
          </h1>
          <div className="prose prose-sm text-slate-700 leading-relaxed">
            <p>{t("privacy.content")}</p>

            <h2 className="text-base font-bold mt-6 mb-2">{t("privacy.dataWeCollect")}</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t("privacy.dataItem1")}</li>
              <li>{t("privacy.dataItem2")}</li>
              <li>{t("privacy.dataItem3")}</li>
            </ul>

            <h2 className="text-base font-bold mt-6 mb-2">{t("privacy.howWeProtect")}</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t("privacy.protectItem1")}</li>
              <li>{t("privacy.protectItem2")}</li>
              <li>{t("privacy.protectItem3")}</li>
              <li>{t("privacy.protectItem4")}</li>
            </ul>

            <h2 className="text-base font-bold mt-6 mb-2">{t("privacy.yourRights")}</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t("privacy.rightsItem1")}</li>
              <li>{t("privacy.rightsItem2")}</li>
              <li>{t("privacy.rightsItem3")}</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
