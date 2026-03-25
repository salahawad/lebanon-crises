"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Building2,
  AlertTriangle,
  Layers,
  MapPin,
  ChevronRight,
  Plus,
  Map as MapIcon,
  Shield,
  TrendingUp,
} from "lucide-react";
import { getPlatformStats, getActors } from "@/lib/data/platform-api";
import { getZoneName, getSectorName, getSectorColor, ZONES, SECTORS_META, REGIONS } from "@/lib/data/zones";
import type { PlatformStats, Actor, Sector } from "@/lib/types/platform";

export default function PlatformDashboard() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("platform.dashboard");

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getActors()])
      .then(([s, a]) => {
        setStats(s);
        setActors(a);
      })
      .finally(() => setLoading(false));
  }, []);

  // Group actors by zone
  const actorsByZone = new Map<string, Actor[]>();
  for (const actor of actors) {
    for (const zoneId of actor.operationalZones) {
      if (!actorsByZone.has(zoneId)) {
        actorsByZone.set(zoneId, []);
      }
      const existing = actorsByZone.get(zoneId)!;
      if (!existing.find((a) => a.id === actor.id)) {
        existing.push(actor);
      }
    }
  }

  // Compute coverage gaps: zones where a sector has zero orgs
  const ALL_SECTORS: Sector[] = [
    "food", "medical", "shelter", "psychosocial", "legal",
    "logistics", "wash", "education", "protection",
  ];

  const coverageGaps: { zoneId: string; missingSectors: Sector[] }[] = [];
  for (const zone of ZONES) {
    const zoneActors = actorsByZone.get(zone.id) || [];
    const coveredSectors = new Set(zoneActors.flatMap((a) => a.sectors));
    const missing = ALL_SECTORS.filter((s) => !coveredSectors.has(s));
    if (missing.length > 0) {
      coverageGaps.push({ zoneId: zone.id, missingSectors: missing });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-slate-400 text-sm">
          {t("loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {t("title")}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-4 text-center">
            <Building2 className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">
              {stats.totalActors}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t("orgsMapped")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-danger" />
            <p className="text-2xl font-bold text-danger">
              {stats.coverageGaps}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t("coverageGaps")}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Layers className="w-6 h-6 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold text-accent">
              {stats.sectorsMissing}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t("sectorsMissing")}
            </p>
          </div>
        </div>
      )}

      {/* Quick stats bar */}
      {stats && (
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-slate-700">
              {t("thisWeek")}
            </span>
          </div>
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-lg font-bold text-success">
                {stats.familiesReachedThisWeek.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">{t("familiesReached")}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-lg font-bold text-primary">
                {stats.activeCollaborations}
              </p>
              <p className="text-[10px] text-slate-500">{t("collaborations")}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-lg font-bold text-accent">
                {stats.gapsClosedThisWeek}
              </p>
              <p className="text-[10px] text-slate-500">{t("gapsClosed")}</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <Link
          href={`/${locale}/intake`}
          className="flex-1 flex items-center justify-center gap-2 bg-accent text-white rounded-lg py-3 px-4 font-semibold hover:bg-accent-light transition-colors tap-target"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">{t("registerOrg")}</span>
        </Link>
        <Link
          href={`/${locale}/map`}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-3 px-4 font-semibold hover:bg-primary-dark transition-colors tap-target"
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-sm">{t("viewMap")}</span>
        </Link>
      </div>

      {/* Coverage gaps flags */}
      {coverageGaps.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <h3 className="text-sm font-bold text-red-800">
              {t("coverageGapsTitle")}
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {coverageGaps.slice(0, 8).map((gap) => (
              <div
                key={gap.zoneId}
                className="flex items-start gap-2 text-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-red-800">
                    {getZoneName(gap.zoneId, locale)}
                  </span>
                  <span className="text-red-500 mx-1">—</span>
                  <span className="text-red-600">
                    {gap.missingSectors
                      .map((s) => getSectorName(s, locale))
                      .join(", ")}
                  </span>
                </div>
              </div>
            ))}
            {coverageGaps.length > 8 && (
              <p className="text-[10px] text-red-400 mt-1">
                {t("moreZonesWithGaps", { count: coverageGaps.length - 8 })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Organizations by zone */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">
          {t("orgsByZone")}
        </h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {REGIONS.map((region) => {
            const regionZones = ZONES.filter((z) => z.region === region.id);
            const zonesWithActors = regionZones.filter(
              (z) => (actorsByZone.get(z.id) || []).length > 0
            );
            if (zonesWithActors.length === 0) return null;

            return (
              <div key={region.id}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-primary">
                    {locale === "ar" ? region.nameAr : region.nameEn}
                  </h4>
                </div>
                {zonesWithActors.map((zone) => {
                  const zoneActorsList = actorsByZone.get(zone.id) || [];
                  return (
                    <div
                      key={zone.id}
                      className="bg-white rounded-lg p-4 mb-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-800">
                            {locale === "ar" ? zone.nameAr : zone.nameEn}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {t("orgCount", { count: zoneActorsList.length })}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {zoneActorsList.map((actor) => (
                          <div
                            key={actor.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span className="text-sm text-slate-700 truncate">
                                {actor.name}
                              </span>
                              {actor.nameAr && (
                                <span className="text-xs text-slate-400 truncate hidden sm:inline">
                                  {actor.nameAr}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0 ms-2">
                              {actor.sectors.slice(0, 3).map((sector) => (
                                <span
                                  key={sector}
                                  className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-medium text-white"
                                  style={{
                                    backgroundColor: getSectorColor(sector),
                                  }}
                                >
                                  {getSectorName(sector, locale)}
                                </span>
                              ))}
                              {actor.sectors.length > 3 && (
                                <span className="text-[9px] text-slate-400 self-center">
                                  +{actor.sectors.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer links */}
      <footer className="border-t border-slate-200 pt-4 mt-6 pb-4">
        <div className="flex justify-center gap-4 text-xs text-slate-400">
          <Link
            href={`/${locale}/privacy`}
            className="hover:text-primary transition-colors"
          >
            {t("privacy")}
          </Link>
          <span>·</span>
          <Link
            href={`/${locale}/terms`}
            className="hover:text-primary transition-colors"
          >
            {t("terms")}
          </Link>
          <span>·</span>
          <a
            href="/api/v0/coverage"
            target="_blank"
            rel="noopener"
            className="hover:text-primary transition-colors"
          >
            API v0
          </a>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-2">
          Shabaka · شبكة — {t("tagline")}
        </p>
      </footer>
    </div>
  );
}
