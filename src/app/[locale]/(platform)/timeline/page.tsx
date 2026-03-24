"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Clock,
  Filter,
  History,
  RefreshCw,
} from "lucide-react";
import {
  getAllCapacityChanges,
  getCapacityCards,
  getPatternAlerts,
} from "@/lib/data/platform-api";
import type { CapacityCard, CapacityChange, PatternAlert } from "@/lib/types/platform";
import { ZONES, getZoneName } from "@/lib/data/zones";

const DAY = 86400000;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// A combined timeline entry (either a capacity change or a pattern alert)
type TimelineEntry =
  | { type: "change"; change: CapacityChange; actorName: string; zone: string }
  | { type: "alert"; alert: PatternAlert };

function buildTimeline(
  changes: CapacityChange[],
  cards: CapacityCard[],
  alerts: PatternAlert[],
  zoneFilter: string,
  actorFilter: string
): TimelineEntry[] {
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  const changeEntries: TimelineEntry[] = changes
    .map((ch) => {
      const card = cardMap.get(ch.cardId);
      if (!card) return null;
      if (zoneFilter !== "all" && card.zone !== zoneFilter) return null;
      if (actorFilter !== "all" && card.actorId !== actorFilter) return null;
      return {
        type: "change" as const,
        change: ch,
        actorName: card.actorName,
        zone: card.zone,
      };
    })
    .filter(Boolean) as TimelineEntry[];

  const alertEntries: TimelineEntry[] = alerts
    .filter((a) => {
      if (zoneFilter !== "all" && a.zone !== zoneFilter) return false;
      if (actorFilter !== "all" && !a.actorIds.includes(actorFilter)) return false;
      return true;
    })
    .map((a) => ({ type: "alert" as const, alert: a }));

  // Merge and sort by time descending
  const all = [...changeEntries, ...alertEntries].sort((a, b) => {
    const ta = a.type === "change" ? a.change.changedAt : a.alert.createdAt;
    const tb = b.type === "change" ? b.change.changedAt : b.alert.createdAt;
    return tb - ta;
  });

  return all;
}

export default function CapacityTimelinePage() {
  const [cards, setCards] = useState<CapacityCard[]>([]);
  const [changes, setChanges] = useState<CapacityChange[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const [cardsData, changesData, alertsData] = await Promise.all([
          getCapacityCards(),
          getAllCapacityChanges(),
          getPatternAlerts(),
        ]);
        setCards(cardsData);
        setChanges(changesData);
        setAlerts(alertsData);
      } catch (err) {
        console.error("Failed to load timeline:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Staleness computation
  const now = Date.now();
  const staleCards = cards.filter(
    (c) => now - c.lastUpdated >= 7 * DAY && now - c.lastUpdated < 14 * DAY
  );
  const outdatedCards = cards.filter((c) => now - c.lastUpdated >= 14 * DAY);

  // Unique actors for filter dropdown
  const uniqueActors = [...new Map(cards.map((c) => [c.actorId, c.actorName])).entries()].sort(
    (a, b) => a[1].localeCompare(b[1])
  );

  const timeline = buildTimeline(changes, cards, alerts, zoneFilter, actorFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <History className="w-8 h-8 text-primary" />
          <p className="text-slate-500 text-sm">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center gap-3">
          <History className="w-5 h-5" />
          <h1 className="text-base font-bold">Capacity Timeline</h1>
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {timeline.length} events
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
        {/* Staleness Summary */}
        {(staleCards.length > 0 || outdatedCards.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm text-amber-900">
              <p className="font-medium">Data freshness warning</p>
              <p className="text-amber-700 mt-0.5">
                {staleCards.length > 0 && (
                  <span>
                    {staleCards.length} profile{staleCards.length !== 1 ? "s" : ""} may be stale (7+ days)
                  </span>
                )}
                {staleCards.length > 0 && outdatedCards.length > 0 && <span>, </span>}
                {outdatedCards.length > 0 && (
                  <span>
                    {outdatedCards.length} may be outdated (14+ days)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Zone dropdown */}
            <div className="relative">
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="appearance-none bg-slate-100 text-sm rounded-lg px-3 py-1.5 pe-7 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              >
                <option value="all">All Zones</option>
                {ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nameEn}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Actor dropdown */}
            <div className="relative">
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="appearance-none bg-slate-100 text-sm rounded-lg px-3 py-1.5 pe-7 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              >
                <option value="all">All Actors</option>
                {uniqueActors.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        {timeline.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No events match the current filters.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute start-5 top-0 bottom-0 w-px bg-slate-200 md:start-6" />

            <div className="space-y-3">
              {timeline.map((entry, idx) => {
                if (entry.type === "alert") {
                  const alert = entry.alert;
                  return (
                    <div key={`alert-${alert.id}`} className="relative ps-12 md:ps-14">
                      {/* Timeline dot */}
                      <div className="absolute start-3.5 top-4 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-100 md:left-4.5" />

                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                            Pattern Alert
                          </span>
                          <span className="ms-auto text-xs text-amber-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(alert.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-amber-900">{alert.message}</p>
                        <p className="text-xs text-amber-600">
                          {getZoneName(alert.zone, "en")} &middot; {alert.actorCount} actor{alert.actorCount !== 1 ? "s" : ""} involved
                        </p>
                      </div>
                    </div>
                  );
                }

                const { change, actorName, zone } = entry;
                return (
                  <div key={`change-${change.id}`} className="relative ps-12 md:ps-14">
                    {/* Timeline dot */}
                    <div className="absolute start-3.5 top-4 w-3 h-3 rounded-full bg-[#1e3a5f] ring-2 ring-blue-100 md:left-4.5" />

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {actorName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getZoneName(zone, "en")}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {timeAgo(change.changedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-slate-700">{change.field}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm bg-slate-50 rounded-xl px-3 py-2">
                        <span className="text-slate-500 line-through">{change.oldValue}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-[#1e3a5f]">{change.newValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
