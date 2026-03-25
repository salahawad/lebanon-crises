"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { getActors } from "@/lib/data/platform-api";
import { ZONES, SECTORS_META, getSectorColor, getZoneName } from "@/lib/data/zones";
import type { Actor, Sector, ActorType } from "@/lib/types/platform";

const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  ngo: "NGO",
  municipality: "Municipality",
  grassroots: "Grassroots",
  shelter_org: "Shelter Org",
};

const ACTOR_TYPE_COLORS: Record<ActorType, string> = {
  ngo: "bg-blue-100 text-blue-800",
  municipality: "bg-purple-100 text-purple-800",
  grassroots: "bg-amber-100 text-amber-800",
  shelter_org: "bg-teal-100 text-teal-800",
};

const VERIFICATION_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  verified: { label: "Verified", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  provisional: { label: "Provisional", color: "bg-amber-100 text-amber-800", icon: Clock },
  pending: { label: "Pending", color: "bg-slate-100 text-slate-600", icon: AlertCircle },
  suspended: { label: "Suspended", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function ActorsPage() {
  const locale = useLocale();
  const t = useTranslations("platform");
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<Sector | null>(null);
  const [typeFilter, setTypeFilter] = useState<ActorType | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getActors()
      .then(setActors)
      .finally(() => setLoading(false));
  }, []);

  const uniqueZones = useMemo(() => {
    const zoneIds = new Set(actors.flatMap((a) => a.operationalZones));
    return Array.from(zoneIds)
      .map((id) => ({ id, name: getZoneName(id, locale) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [actors]);

  const filtered = useMemo(() => {
    let result = actors;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.nameAr && a.nameAr.includes(q)) ||
          a.contactName.toLowerCase().includes(q)
      );
    }
    if (sectorFilter) {
      result = result.filter((a) => a.sectors.includes(sectorFilter));
    }
    if (typeFilter) {
      result = result.filter((a) => a.type === typeFilter);
    }
    if (zoneFilter) {
      result = result.filter((a) => a.operationalZones.includes(zoneFilter));
    }
    return result;
  }, [actors, search, sectorFilter, typeFilter, zoneFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-bold">{t("actors.title")}</h1>
          <span className="text-sm text-white/70">{t("actors.organizationCount", { count: actors.length })}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4">
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("actors.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute end-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              showFilters || typeFilter || zoneFilter
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Sector filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          <button
            onClick={() => setSectorFilter(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !sectorFilter
                ? "bg-primary text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t("common.allSectors")}
          </button>
          {SECTORS_META.map((s) => (
            <button
              key={s.id}
              onClick={() => setSectorFilter(sectorFilter === s.id ? null : (s.id as Sector))}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                sectorFilter === s.id
                  ? "text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              style={
                sectorFilter === s.id
                  ? { backgroundColor: s.color }
                  : undefined
              }
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              {locale === "ar" ? s.nameAr : s.nameEn}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                {t("common.organizationType")}
              </label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(ACTOR_TYPE_LABELS) as ActorType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      typeFilter === type
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t(`actorTypes.${type}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">{t("common.zone")}</label>
              <select
                value={zoneFilter || ""}
                onChange={(e) => setZoneFilter(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t("common.allZones")}</option>
                {uniqueZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
            {(typeFilter || zoneFilter) && (
              <button
                onClick={() => {
                  setTypeFilter(null);
                  setZoneFilter(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                {t("common.clearFilters")}
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {(search || sectorFilter || typeFilter || zoneFilter) && (
          <p className="text-xs text-slate-500 mb-3">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t("actors.noActors")}</p>
            <p className="text-sm text-slate-400 mt-1">{t("actors.tryAdjustingFilters")}</p>
          </div>
        ) : (
          /* Actor cards */
          <div className="space-y-3">
            {filtered.map((actor) => {
              const verification = VERIFICATION_CONFIG[actor.verificationStatus];
              const VerifIcon = verification.icon;
              return (
                <Link
                  key={actor.id}
                  href={`/actors/${actor.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-xl transition-shadow">
                    {/* Top row: name + verification */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {locale === "ar" && actor.nameAr ? actor.nameAr : actor.name}
                        </h3>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${verification.color}`}
                      >
                        <VerifIcon className="w-3 h-3" />
                        {t(`verification.${actor.verificationStatus}`)}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTOR_TYPE_COLORS[actor.type]}`}
                      >
                        {t(`actorTypes.${actor.type}`)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {relativeTime(actor.lastUpdated)}
                      </span>
                    </div>

                    {/* Sector dots */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {actor.sectors.map((s) => (
                        <span
                          key={s}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getSectorColor(s) }}
                          title={(() => { const meta = SECTORS_META.find((m) => m.id === s); return meta ? (locale === "ar" ? meta.nameAr : meta.nameEn) : s; })()}
                        />
                      ))}
                      <span className="text-xs text-slate-400 ms-1">
                        {actor.sectors
                          .map((s) => { const meta = SECTORS_META.find((m) => m.id === s); return meta ? (locale === "ar" ? meta.nameAr : meta.nameEn) : s; })
                          .join(", ")}
                      </span>
                    </div>

                    {/* Zones */}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {actor.operationalZones
                          .map((z) => getZoneName(z, locale))
                          .join(", ")}
                      </span>
                      <ChevronRight className="w-4 h-4 shrink-0 ms-auto text-slate-300 rtl:-scale-x-100" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
