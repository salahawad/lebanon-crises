"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Skull,
  Ambulance,
  Users,
  DollarSign,
  Target,
  FileText,
  ClipboardList,
  School,
  Accessibility,
  Baby,
  Bomb,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { getPlatformStats, getActors } from "@/lib/data/platform-api";
import { getZoneName, getSectorName, getSectorColor, ZONES, REGIONS } from "@/lib/data/zones";
import type { PlatformStats, Actor, Sector } from "@/lib/types/platform";
import {
  CRISIS_KEY_FIGURES,
  DISPLACEMENT_ZONES,
  EMERGENCY_RESOURCES,
  SECTOR_SITREPS,
} from "@/lib/data/crisis";
import type { CrisisKeyFigure, EmergencyResource, SectorSitrep } from "@/lib/data/crisis";

const FIGURE_ICONS: Record<CrisisKeyFigure["icon"], React.ElementType> = {
  skull: Skull,
  ambulance: Ambulance,
  users: Users,
  dollar: DollarSign,
  target: Target,
};

const FIGURE_COLORS: Record<CrisisKeyFigure["color"], string> = {
  danger: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  primary: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  accent: "bg-orange-50 text-orange-700 ring-orange-200",
};

const RESOURCE_ICONS: Record<EmergencyResource["icon"], React.ElementType> = {
  clipboard: ClipboardList,
  school: School,
  shield: Shield,
  accessibility: Accessibility,
  baby: Baby,
  bomb: Bomb,
};

const SECTOR_COLORS: Record<SectorSitrep["sector"], string> = {
  health: "bg-red-100 text-red-700",
  food: "bg-green-100 text-green-700",
  protection: "bg-purple-100 text-purple-700",
  wash: "bg-cyan-100 text-cyan-700",
  education: "bg-yellow-100 text-yellow-700",
  general: "bg-slate-100 text-slate-600",
};

const STATUS_STYLES: Record<string, string> = {
  active_orders: "bg-red-100 text-red-700",
  heavy_displacement: "bg-amber-100 text-amber-700",
  receiving: "bg-blue-100 text-blue-700",
};

function formatNumber(n: number, locale: string): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M+`;
  }
  if (n >= 1_000) {
    return n.toLocaleString(locale === "ar" ? "ar-LB" : "en-US");
  }
  return String(n);
}

export default function PlatformDashboard() {
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

  // Compute coverage gaps
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
      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t("title")}</h2>
        <p className="text-sm text-slate-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          WAR CRISIS DATA (from LRP March 2026)
         ═══════════════════════════════════════════════════════ */}

      {/* ── Key Figures ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">{t("keyFigures")}</h3>
          <span className="text-[10px] text-slate-400">
            {t("asOf", { date: "19 Mar 2026" })}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CRISIS_KEY_FIGURES.map((fig) => {
            const Icon = FIGURE_ICONS[fig.icon];
            const colorClass = FIGURE_COLORS[fig.color];
            return (
              <div
                key={fig.id}
                className={`rounded-xl p-3.5 ring-1 text-center ${colorClass}`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1.5 opacity-70" />
                <p className="text-xl font-bold leading-tight">
                  {fig.id === "appeal"
                    ? `$${formatNumber(fig.value, locale)}`
                    : formatNumber(fig.value, locale)}
                </p>
                <p className="text-[11px] font-medium mt-0.5 opacity-80">
                  {t(fig.labelKey)}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          {t("source")}
        </p>
      </section>

      {/* ── Displacement Orders ──────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4.5 h-4.5 text-red-500" />
          <h3 className="text-sm font-bold text-slate-800">
            {t("displacementTitle")}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">{t("displacementDesc")}</p>
        <div className="grid grid-cols-2 gap-2">
          {DISPLACEMENT_ZONES.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-2.5"
            >
              <div
                className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-semibold ${STATUS_STYLES[zone.status]}`}
              >
                {t(zone.status === "active_orders"
                  ? "activeOrders"
                  : zone.status === "heavy_displacement"
                  ? "heavyDisplacement"
                  : "receiving")}
              </div>
              <span className="text-xs font-medium text-slate-700 truncate">
                {t(zone.nameKey)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Emergency Resources ──────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4.5 h-4.5 text-primary" />
          <h3 className="text-sm font-bold text-slate-800">
            {t("emergencyResources")}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {t("emergencyResourcesDesc")}
        </p>
        <div className="space-y-2">
          {EMERGENCY_RESOURCES.map((res) => {
            const Icon = RESOURCE_ICONS[res.icon];
            return (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-start gap-3 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {t(res.titleKey)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t(res.descKey)}
                  </p>
                  {res.bilingual && (
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
                        AR
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
                        EN
                      </span>
                    </div>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 shrink-0 mt-1" />
              </a>
            );
          })}
        </div>
      </section>

      {/* ── Sector Situation Reports ─────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpRight className="w-4.5 h-4.5 text-accent" />
          <h3 className="text-sm font-bold text-slate-800">
            {t("sectorSitreps")}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {t("sectorSitrepsDesc")}
        </p>
        <div className="space-y-2">
          {SECTOR_SITREPS.map((rep) => (
            <a
              key={rep.id}
              href={rep.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <span
                className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md ${SECTOR_COLORS[rep.sector]}`}
              >
                {rep.org}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {t(rep.titleKey)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {rep.date}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PLATFORM OPERATIONAL DATA (existing)
         ═══════════════════════════════════════════════════════ */}

      {/* ── Separator ─────────────────────────────────────────── */}
      <div className="border-t border-slate-200 pt-2">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Shabaka Network
        </p>
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
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

      {/* ── Quick stats bar ───────────────────────────────────── */}
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

      {/* ── CTA Buttons ───────────────────────────────────────── */}
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

      {/* ── Coverage gaps ─────────────────────────────────────── */}
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
              <div key={gap.zoneId} className="flex items-start gap-2 text-xs">
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

      {/* ── Organizations by zone ─────────────────────────────── */}
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
                    <div key={zone.id} className="bg-white rounded-lg p-4 mb-2">
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

      {/* ── Footer ────────────────────────────────────────────── */}
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
