"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  BarChart3,
  Package,
  MapPin,
} from "lucide-react";
import { getResources } from "@/lib/data/platform-api";
import type { ZoneResource } from "@/lib/types/platform";
import { ZONES, getZoneName } from "@/lib/data/zones";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Resource category display config
const RESOURCE_CATEGORIES: Record<string, { label: string; maxCapacity: number; icon: string }> = {
  "Available Beds": { label: "Hospital Beds", maxCapacity: 100, icon: "beds" },
  Beds: { label: "Hospital Beds", maxCapacity: 100, icon: "beds" },
  "Medical Staff": { label: "Medical Staff", maxCapacity: 20, icon: "staff" },
  "Food Parcels": { label: "Food Parcels", maxCapacity: 200, icon: "food" },
  Vehicles: { label: "Transport", maxCapacity: 10, icon: "transport" },
  Drivers: { label: "Transport", maxCapacity: 10, icon: "transport" },
  Volunteers: { label: "Volunteers", maxCapacity: 50, icon: "volunteers" },
  "Consultation Slots": { label: "Medical Staff", maxCapacity: 20, icon: "staff" },
};

function getResourceLevel(count: number, maxCapacity: number): "green" | "amber" | "red" {
  const ratio = count / maxCapacity;
  if (ratio >= 0.5) return "green";
  if (ratio >= 0.2) return "amber";
  return "red";
}

const LEVEL_COLORS = {
  green: { bar: "var(--color-success)", bg: "bg-green-50", text: "text-green-700", label: "Adequate" },
  amber: { bar: "var(--color-warning)", bg: "bg-amber-50", text: "text-amber-700", label: "Moderate" },
  red: { bar: "var(--color-danger)", bg: "bg-red-50", text: "text-red-700", label: "Low" },
};

// Group resources by a display label
function groupByCategory(resources: ZoneResource[]): Map<string, ZoneResource[]> {
  const grouped = new Map<string, ZoneResource[]>();
  for (const r of resources) {
    const config = RESOURCE_CATEGORIES[r.category];
    const groupLabel = config?.label ?? r.category;
    if (!grouped.has(groupLabel)) grouped.set(groupLabel, []);
    grouped.get(groupLabel)!.push(r);
  }
  return grouped;
}

export default function ResourceTrackerPage() {
  const locale = useLocale();
  const t = useTranslations("platform");
  const [resources, setResources] = useState<ZoneResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const data = await getResources();
        setResources(data);
      } catch (err) {
        console.error("Failed to load resources:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleExpanded = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredResources = zoneFilter === "all"
    ? resources
    : resources.filter((r) => r.zone === zoneFilter);

  // Unique zones present in resources
  const activeZones = [...new Set(resources.map((r) => r.zone))];

  // Zone summary data
  const zoneSummaries = activeZones
    .filter((z) => zoneFilter === "all" || z === zoneFilter)
    .map((zoneId) => {
      const zoneResources = resources.filter((r) => r.zone === zoneId);
      const totalCount = zoneResources.reduce((sum, r) => sum + r.totalCount, 0);
      const categories = zoneResources.length;
      return { zoneId, totalCount, categories };
    });

  // Grouped for display
  const grouped = groupByCategory(filteredResources);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <p className="text-slate-500 text-sm">{t("resources.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center gap-3">
          <BarChart3 className="w-5 h-5" />
          <h1 className="text-base font-bold">{t("resources.title")}</h1>
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {t("resources.resourceCount", { count: filteredResources.length })}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
        {/* Zone filter */}
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="relative">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="appearance-none w-full bg-slate-100 text-sm rounded-lg px-3 py-2 pe-8 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">{t("common.allZones")}</option>
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {locale === "ar" ? z.nameAr : z.nameEn}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Zone Summary Cards */}
        {zoneSummaries.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {zoneSummaries.map((zs) => (
              <button
                key={zs.zoneId}
                onClick={() => setZoneFilter(zs.zoneId === zoneFilter ? "all" : zs.zoneId)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  zoneFilter === zs.zoneId
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-slate-200 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <p className={`text-xs font-medium truncate ${zoneFilter === zs.zoneId ? "text-white/80" : "text-slate-500"}`}>
                    {getZoneName(zs.zoneId, locale)}
                  </p>
                </div>
                <p className={`text-lg font-bold ${zoneFilter === zs.zoneId ? "" : "text-primary"}`}>
                  {zs.totalCount}
                </p>
                <p className={`text-xs ${zoneFilter === zs.zoneId ? "text-white/60" : "text-slate-400"}`}>
                  {t("resources.resourceTypes", { count: zs.categories })}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Resource Categories */}
        {grouped.size === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">{t("resources.noResources")}</p>
          </div>
        ) : (
          [...grouped.entries()].map(([categoryLabel, categoryResources]) => {
            const totalCount = categoryResources.reduce((s, r) => s + r.totalCount, 0);
            const latestUpdate = Math.max(...categoryResources.map((r) => r.lastUpdated));
            const config = Object.values(RESOURCE_CATEGORIES).find((c) => c.label === categoryLabel);
            const maxCapacity = config?.maxCapacity ?? 100;
            const level = getResourceLevel(totalCount, maxCapacity);
            const levelConfig = LEVEL_COLORS[level];
            const progressPct = Math.min((totalCount / maxCapacity) * 100, 100);

            // Flatten actor breakdowns across all zone resources in this category
            const allActors = categoryResources.flatMap((r) =>
              r.actorBreakdown.map((ab) => ({
                ...ab,
                zone: r.zone,
              }))
            );

            const rowKey = categoryLabel;
            const isExpanded = expandedRows.has(rowKey);

            return (
              <div key={categoryLabel} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleExpanded(rowKey)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-primary">{categoryLabel}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelConfig.bg} ${levelConfig.text}`}>
                        {t(`resourceLevels.${level === "green" ? "adequate" : level === "amber" ? "moderate" : "low"}`)}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {timeAgo(latestUpdate)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%`, backgroundColor: levelConfig.bar }}
                    />
                  </div>
                </button>

                {/* Expanded actor breakdown */}
                {isExpanded && allActors.length > 0 && (
                  <div className="border-t border-slate-100 px-4 pb-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide py-2">
                      {t("resources.breakdownByActor")}
                    </p>
                    <div className="space-y-2">
                      {allActors.map((actor, i) => (
                        <div key={`${actor.actorId}-${i}`} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-slate-700 truncate">{actor.actorName}</span>
                            {zoneFilter === "all" && (
                              <span className="text-xs text-slate-400">
                                {getZoneName(actor.zone, locale)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-slate-900">{actor.count}</span>
                            <span className="text-xs text-slate-400">
                              {timeAgo(actor.updatedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
