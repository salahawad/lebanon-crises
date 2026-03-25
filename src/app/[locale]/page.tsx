"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LebanonMap } from "@/components/shared/lebanon-map";
import { getRequestCountsByGovernorate } from "@/lib/firebase/requests";
import { getShelters, getShelterCountsByGovernorate } from "@/lib/firebase/shelters";
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
    <div className="min-h-screen flex flex-col bg-page">
      {/* Header */}
      <header className="bg-white border-b border-border">
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
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-6">
          <h2 className="text-[22px] font-bold text-heading mb-2">
            {t("landing.title")}
          </h2>
          <p className="text-sub text-sm leading-relaxed">
            {t("landing.subtitle")}
          </p>
        </div>

        {/* Emergency CTA — max 3 steps to help */}
        <Link
          href="/request-help"
          className="cta-emergency flex items-center justify-center gap-3 w-full p-4 rounded-lg text-white text-center mb-4"
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="text-base font-bold block">
              {t("landing.needHelp")}
            </span>
            <span className="text-xs opacity-90 block">
              {t("landing.needHelpDesc")}
            </span>
          </div>
        </Link>

        {/* Action cards — clean, no shadow, high contrast */}
        <div className="space-y-3 mb-6">
          <Link
            href="/browse"
            className="flex items-center gap-4 w-full p-4 rounded-lg bg-white border border-border hover:border-primary transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-base font-semibold text-heading block">
                {t("landing.offerHelp")}
              </span>
              <span className="text-sm text-sub block">
                {t("landing.offerHelpDesc")}
              </span>
            </div>
            <svg className="w-5 h-5 text-muted flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/contacts"
            className="flex items-center gap-4 w-full p-4 rounded-lg bg-white border border-border hover:border-primary transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-success-dark/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-success-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-base font-semibold text-heading block">
                {t("contacts.title")}
              </span>
              <span className="text-sm text-sub block">
                {t("contacts.subtitle")}
              </span>
            </div>
            <svg className="w-5 h-5 text-muted flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/shelters"
            className="flex items-center gap-4 w-full p-4 rounded-lg bg-white border border-border hover:border-primary transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-base font-semibold text-heading block">
                {t("shelters.viewShelters")}
              </span>
              <span className="text-sm text-sub block">
                {t("shelters.viewSheltersDesc")}
              </span>
            </div>
            <svg className="w-5 h-5 text-muted flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Shabaka Platform */}
        <Link
          href="/platform"
          className="flex items-center gap-4 w-full p-4 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors mb-6"
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-base font-bold block">
              {t("landing.platformName")}
            </span>
            <span className="text-xs opacity-80 block">
              {t("landing.platformDesc")}
            </span>
          </div>
          <svg className="w-5 h-5 opacity-60 flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Map */}
        {(Object.keys(govCounts).length > 0 || Object.keys(shelterGovCounts).length > 0) && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-1 mb-3 bg-white border border-border rounded-lg p-1 max-w-xs mx-auto">
              <button
                onClick={() => setMapMode("requests")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  mapMode === "requests"
                    ? "bg-primary text-white"
                    : "text-sub hover:text-heading"
                }`}
              >
                {t("landing.openRequests")}
              </button>
              <button
                onClick={() => setMapMode("shelters")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  mapMode === "shelters"
                    ? "bg-success-dark text-white"
                    : "text-sub hover:text-heading"
                }`}
              >
                {t("shelters.viewShelters")}
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
        <div className="bg-info/5 border border-info/20 rounded-lg p-4 text-center">
          <p className="text-sm text-primary font-medium">
            {t("landing.safeNotice")}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-4">
        <div className="max-w-lg mx-auto px-4 flex justify-center gap-4 text-xs text-sub">
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
