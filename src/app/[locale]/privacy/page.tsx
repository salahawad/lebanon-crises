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

            <h2 className="text-base font-bold mt-6 mb-2">Data We Collect</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Help request details (category, area, description)</li>
              <li>Optional contact information (phone number, name)</li>
              <li>Helper registration details (name, email, organization)</li>
            </ul>

            <h2 className="text-base font-bold mt-6 mb-2">How We Protect Your Data</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Phone numbers are stored in a separate, access-controlled collection</li>
              <li>Exact addresses are never collected or displayed</li>
              <li>Public request listings show only general area information</li>
              <li>Contact details are shared only with verified helpers and administrators</li>
            </ul>

            <h2 className="text-base font-bold mt-6 mb-2">Your Rights</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Request deletion of your data at any time</li>
              <li>Submit requests anonymously</li>
              <li>Choose your preferred contact method or opt out of direct contact</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
