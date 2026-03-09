"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LebanonMap } from "@/components/shared/lebanon-map";
import { getRequestCountsByGovernorate } from "@/lib/firebase/requests";

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [govCounts, setGovCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getRequestCountsByGovernorate()
      .then(setGovCounts)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="" width={28} height={28} className="rounded" />
            <h1 className="text-lg font-bold text-primary">
              {t("common.appName")}
            </h1>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {t("landing.title")}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {t("landing.subtitle")}
          </p>
        </div>

        {/* Two big action buttons */}
        <div className="space-y-4 mb-8">
          <Link
            href="/request-help"
            className="block w-full p-5 rounded-2xl bg-primary text-white text-center shadow-lg hover:bg-primary-light active:bg-primary-dark transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">
              🆘
            </span>
            <span className="text-xl font-bold block">
              {t("landing.needHelp")}
            </span>
            <span className="text-sm opacity-90 mt-1 block">
              {t("landing.needHelpDesc")}
            </span>
          </Link>

          <Link
            href="/browse"
            className="block w-full p-5 rounded-2xl bg-accent text-white text-center shadow-lg hover:bg-accent-light transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">
              🤝
            </span>
            <span className="text-xl font-bold block">
              {t("landing.offerHelp")}
            </span>
            <span className="text-sm opacity-90 mt-1 block">
              {t("landing.offerHelpDesc")}
            </span>
          </Link>
          <Link
            href="/contacts"
            className="block w-full p-5 rounded-2xl bg-slate-700 text-white text-center shadow-lg hover:bg-slate-600 transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">
              📞
            </span>
            <span className="text-xl font-bold block">
              {t("contacts.title")}
            </span>
            <span className="text-sm opacity-90 mt-1 block">
              {t("contacts.subtitle")}
            </span>
          </Link>
        </div>

        {/* Map */}
        {Object.keys(govCounts).length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-700 text-center mb-3">
              {t("landing.openRequests")}
            </h3>
            <LebanonMap
              counts={govCounts}
              onSelect={(gov) => router.push(`/browse?governorate=${gov}`)}
            />
          </div>
        )}

        {/* Safety notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-800">
            🔒 {t("landing.safeNotice")}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-lg mx-auto px-4 flex justify-center gap-4 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-primary">
            {t("privacy.title")}
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-primary">
            {t("terms.title")}
          </Link>
          <span>·</span>
          <Link href="/admin/login" className="hover:text-primary">
            {t("admin.login")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
