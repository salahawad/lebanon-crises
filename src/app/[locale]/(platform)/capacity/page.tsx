"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Activity,
  MapPin,
  AlertTriangle,
  Filter,
  Clock,
} from "lucide-react";
import { getCapacityCards } from "@/lib/data/platform-api";
import { ZONES, getSectorColor, getZoneName } from "@/lib/data/zones";
import type { CapacityCard, StockLevel } from "@/lib/types/platform";

const STOCK_BAR_COLORS: Record<StockLevel, string> = {
  good: "bg-success",
  some: "bg-accent",
  low: "bg-danger",
};

const STOCK_LABELS: Record<StockLevel, string> = {
  good: "Good",
  some: "Some",
  low: "Low",
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

export default function CapacityCardsPage() {
  const locale = useLocale();
  const t = useTranslations("platform");
  const [cards, setCards] = useState<CapacityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState<string>("");

  useEffect(() => {
    getCapacityCards()
      .then(setCards)
      .finally(() => setLoading(false));
  }, []);

  const uniqueZones = useMemo(() => {
    const zoneIds = [...new Set(cards.map((c) => c.zone))];
    return zoneIds
      .map((id) => ({ id, name: getZoneName(id, locale) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cards]);

  const filtered = useMemo(() => {
    if (!zoneFilter) return cards;
    return cards.filter((c) => c.zone === zoneFilter);
  }, [cards, zoneFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            <h1 className="text-base font-bold">{t("capacity.title")}</h1>
          </div>
          <span className="text-sm text-white/70">{t("capacity.cardsCount", { count: cards.length })}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4">
        {/* Zone filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">{t("common.allZones")}</option>
            {uniqueZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t("capacity.noCards")}</p>
            <p className="text-sm text-slate-400 mt-1">
              {zoneFilter ? t("capacity.tryDifferentZone") : t("capacity.noData")}
            </p>
          </div>
        ) : (
          /* Card grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((card) => {
              const activeServices = card.services.filter((s) => s.active);
              const hasUrgentNeeds = card.urgentNeeds.length > 0;

              return (
                <Link
                  key={card.id}
                  href={`/actors/${card.actorId}`}
                  className="block"
                >
                  <div
                    className={`bg-white rounded-lg border p-5 hover:shadow-xl transition-shadow ${
                      hasUrgentNeeds
                        ? "border-red-200"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate text-sm">
                          {card.actorName}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {getZoneName(card.zone, locale)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        {relativeTime(card.lastUpdated)}
                      </div>
                    </div>

                    {/* Active services */}
                    <div className="mb-3">
                      <p className="text-xs font-medium text-slate-500 mb-1.5">
                        {t("capacity.activeServices")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeServices.map((svc) => (
                          <span
                            key={svc.serviceId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                            {svc.label}
                          </span>
                        ))}
                        {activeServices.length === 0 && (
                          <span className="text-xs text-slate-400">
                            {t("capacity.noActiveServices")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock levels */}
                    {Object.keys(card.stockLevels).length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-500 mb-1.5">
                          {t("capacity.stockLevels")}
                        </p>
                        <div className="space-y-1.5">
                          {Object.entries(card.stockLevels).map(
                            ([item, level]) => (
                              <div key={item} className="flex items-center gap-2">
                                <span className="text-xs text-slate-600 w-20 truncate capitalize">
                                  {item.replace(/_/g, " ")}
                                </span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${STOCK_BAR_COLORS[level]}`}
                                    style={{
                                      width:
                                        level === "good"
                                          ? "100%"
                                          : level === "some"
                                          ? "50%"
                                          : "20%",
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400 w-10 text-right">
                                  {t(`stockLevels.${level}`)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Urgent needs */}
                    {hasUrgentNeeds && (
                      <div className="flex flex-wrap gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                        {card.urgentNeeds.map((need) => (
                          <span
                            key={need}
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {need.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
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
