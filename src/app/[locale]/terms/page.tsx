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
                This is NOT an emergency service. If you are in immediate danger,
                call your local emergency number.
              </p>
            </div>

            <p>{t("terms.content")}</p>

            <h2 className="text-base font-bold mt-6 mb-2">About This Platform</h2>
            <p className="text-sm">
              This platform is a volunteer-operated humanitarian coordination
              tool designed to connect displaced people with individuals and
              organizations who can provide assistance. It is not operated by any
              government or official agency.
            </p>

            <h2 className="text-base font-bold mt-6 mb-2">Acceptable Use</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Submit only genuine requests for help</li>
              <li>Do not submit false or misleading information</li>
              <li>Do not misuse the platform for commercial purposes</li>
              <li>Treat all users with respect and dignity</li>
              <li>Report suspicious activity to administrators</li>
            </ul>

            <h2 className="text-base font-bold mt-6 mb-2">Limitations</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>We cannot guarantee response times or outcomes</li>
              <li>Volunteer availability varies by area and time</li>
              <li>We are not responsible for the actions of individual helpers</li>
              <li>The platform may experience downtime during high-usage periods</li>
            </ul>
          </div>
        </Card>
      </main>
    </div>
  );
}
