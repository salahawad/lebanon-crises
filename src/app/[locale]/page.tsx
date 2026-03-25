"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LebanonMap } from "@/components/shared/lebanon-map";
import { getRequestCountsByGovernorate } from "@/lib/firebase/requests";
import { getShelters, getShelterCountsByGovernorate } from "@/lib/firebase/shelters";
import { NewsFeed } from "@/components/shared/news-feed";
import { createLogger } from "@/lib/logger";

const log = createLogger("page:landing");

export default function LandingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [govCounts, setGovCounts] = useState<Record<string, number>>({});
  const [shelterGovCounts, setShelterGovCounts] = useState<Record<string, number>>({});
  const [mapMode, setMapMode] = useState<"requests" | "shelters">("requests");

  useEffect(() => {
    getRequestCountsByGovernorate()
      .then(setGovCounts)
      .catch((err) => log.warn("failed to load request counts", err));
    getShelters()
      .then((s) => setShelterGovCounts(getShelterCountsByGovernorate(s)))
      .catch((err) => log.warn("failed to load shelters for map", err));
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
          <Link
            href="/shelters"
            className="block w-full p-5 rounded-2xl bg-emerald-700 text-white text-center shadow-lg hover:bg-emerald-600 transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">
              🏫
            </span>
            <span className="text-xl font-bold block">
              {t("shelters.viewShelters")}
            </span>
            <span className="text-sm opacity-90 mt-1 block">
              {t("shelters.viewSheltersDesc")}
            </span>
          </Link>
        </div>

        {/* Coordination Platform Link */}
        <div className="mb-8">
          <Link
            href="/platform"
            className="block w-full p-5 rounded-2xl bg-primary text-white text-center shadow-lg hover:bg-primary-light transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">
              🌐
            </span>
            <span className="text-xl font-bold block">
              {t("landing.platformName")}
            </span>
            <span className="text-sm opacity-90 mt-1 block">
              {t("landing.platformDesc")}
            </span>
          </Link>
        </div>

        {/* Live News */}
        <div className="mb-8">
          <NewsFeed />
        </div>

        {/* Map */}
        {(Object.keys(govCounts).length > 0 || Object.keys(shelterGovCounts).length > 0) && (
          <div className="mb-8">
            {/* Map mode toggle */}
            <div className="flex items-center justify-center gap-1 mb-3 bg-slate-100 rounded-full p-1 max-w-xs mx-auto">
              <button
                onClick={() => setMapMode("requests")}
                className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  mapMode === "requests"
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                🆘 {t("landing.openRequests")}
              </button>
              <button
                onClick={() => setMapMode("shelters")}
                className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  mapMode === "shelters"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                🏫 {t("shelters.viewShelters")}
              </button>
            </div>

            <LebanonMap
              counts={mapMode === "requests" ? govCounts : shelterGovCounts}
              onSelect={(gov) =>
                mapMode === "requests"
                  ? router.push(`/browse?governorate=${gov}`)
                  : router.push(`/shelters?gov=${gov}`)
              }
              tooltipLabel={
                mapMode === "shelters"
                  ? t("shelters.viewShelters").toLowerCase()
                  : undefined
              }
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
