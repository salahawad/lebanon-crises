"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const locale = pathname.split("/")[1] || "en";

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
          Loading dashboard... / جار تحميل لوحة التحكم...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Public Awareness Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          لوحة الوعي العام — Crisis coordination overview
        </p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <Building2 className="w-6 h-6 mx-auto mb-1 text-[#1e3a5f]" />
            <p className="text-2xl font-bold text-[#1e3a5f]">
              {stats.totalActors}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Orgs Mapped
            </p>
            <p className="text-[10px] text-slate-400">منظمات مسجلة</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-[#ef4444]" />
            <p className="text-2xl font-bold text-[#ef4444]">
              {stats.coverageGaps}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Coverage Gaps
            </p>
            <p className="text-[10px] text-slate-400">فجوات التغطية</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
            <Layers className="w-6 h-6 mx-auto mb-1 text-[#e8913a]" />
            <p className="text-2xl font-bold text-[#e8913a]">
              {stats.sectorsMissing}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sectors Missing
            </p>
            <p className="text-[10px] text-slate-400">قطاعات ناقصة</p>
          </div>
        </div>
      )}

      {/* Quick stats bar */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm font-semibold text-slate-700">
              This Week / هذا الأسبوع
            </span>
          </div>
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-lg font-bold text-[#22c55e]">
                {stats.familiesReachedThisWeek.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">Families Reached / عائلات</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-lg font-bold text-[#1e3a5f]">
                {stats.activeCollaborations}
              </p>
              <p className="text-[10px] text-slate-500">Collaborations / تعاون</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-lg font-bold text-[#e8913a]">
                {stats.gapsClosedThisWeek}
              </p>
              <p className="text-[10px] text-slate-500">Gaps Closed / فجوات أُغلقت</p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <Link
          href={`/${locale}/intake`}
          className="flex-1 flex items-center justify-center gap-2 bg-[#e8913a] text-white rounded-2xl py-3 px-4 font-semibold shadow-lg hover:bg-[#f0a85c] transition-colors tap-target"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Register Org / سجّل منظمة</span>
        </Link>
        <Link
          href={`/${locale}/map`}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a5f] text-white rounded-2xl py-3 px-4 font-semibold shadow-lg hover:bg-[#2d5a8e] transition-colors tap-target"
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-sm">View Map / الخريطة</span>
        </Link>
      </div>

      {/* Coverage gaps flags */}
      {coverageGaps.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
            <h3 className="text-sm font-bold text-red-800">
              Coverage Gaps / فجوات التغطية
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
                    {getZoneName(gap.zoneId, "en")}
                  </span>
                  <span className="text-red-500 mx-1">—</span>
                  <span className="text-red-600">
                    {gap.missingSectors
                      .map((s) => getSectorName(s, "en"))
                      .join(", ")}
                  </span>
                </div>
              </div>
            ))}
            {coverageGaps.length > 8 && (
              <p className="text-[10px] text-red-400 mt-1">
                +{coverageGaps.length - 8} more zones with gaps
              </p>
            )}
          </div>
        </div>
      )}

      {/* Organizations by zone */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">
          Organizations by Zone / المنظمات حسب المنطقة
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
                  <Shield className="w-4 h-4 text-[#1e3a5f]" />
                  <h4 className="text-sm font-semibold text-[#1e3a5f]">
                    {region.nameEn}{" "}
                    <span className="font-normal text-slate-400">
                      / {region.nameAr}
                    </span>
                  </h4>
                </div>
                {zonesWithActors.map((zone) => {
                  const zoneActorsList = actorsByZone.get(zone.id) || [];
                  return (
                    <div
                      key={zone.id}
                      className="bg-white rounded-2xl shadow-lg p-4 mb-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-800">
                            {zone.nameEn}
                          </span>
                          <span className="text-xs text-slate-400">
                            {zone.nameAr}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {zoneActorsList.length} org
                          {zoneActorsList.length !== 1 ? "s" : ""}
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
                                  {getSectorName(sector, "en")}
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
            className="hover:text-[#1e3a5f] transition-colors"
          >
            Privacy / الخصوصية
          </Link>
          <span>·</span>
          <Link
            href={`/${locale}/terms`}
            className="hover:text-[#1e3a5f] transition-colors"
          >
            Terms / الشروط
          </Link>
          <span>·</span>
          <a
            href="/api/v0/coverage"
            target="_blank"
            rel="noopener"
            className="hover:text-[#1e3a5f] transition-colors"
          >
            API v0
          </a>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-2">
          Shabaka · شبكة — Open crisis coordination
        </p>
      </footer>
    </div>
  );
}
