"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Clock,
  Filter,
  HandHelping,
  MessageCircle,
  X,
} from "lucide-react";
import { getNeeds, getPatternAlerts } from "@/lib/data/platform-api";
import type { NeedEntry, PatternAlert, Sector, NeedUrgency } from "@/lib/types/platform";
import { ZONES, SECTORS_META, getZoneName, getSectorName, getSectorColor } from "@/lib/data/zones";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const URGENCY_CONFIG: Record<NeedUrgency, { label: string; color: string; dotColor: string; order: number }> = {
  red: { label: "Critical", color: "#ef4444", dotColor: "bg-red-500", order: 0 },
  amber: { label: "Moderate", color: "#f59e0b", dotColor: "bg-amber-500", order: 1 },
  gray: { label: "Low", color: "#94a3b8", dotColor: "bg-slate-400", order: 2 },
};

export default function NeedsBoardPage() {
  const [needs, setNeeds] = useState<NeedEntry[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [sectorFilters, setSectorFilters] = useState<Set<Sector>>(new Set());
  const [urgencyFilter, setUrgencyFilter] = useState<NeedUrgency | "all">("all");

  // Modal
  const [helpModalActor, setHelpModalActor] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [needsData, alertsData] = await Promise.all([
          getNeeds(),
          getPatternAlerts(),
        ]);
        setNeeds(needsData);
        setAlerts(alertsData);
      } catch (err) {
        console.error("Failed to load needs board:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSector = (sector: Sector) => {
    setSectorFilters((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) next.delete(sector);
      else next.add(sector);
      return next;
    });
  };

  const filteredNeeds = needs.filter((n) => {
    if (zoneFilter !== "all" && n.zone !== zoneFilter) return false;
    if (sectorFilters.size > 0 && !sectorFilters.has(n.category)) return false;
    if (urgencyFilter !== "all" && n.urgency !== urgencyFilter) return false;
    return n.status === "open";
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (zoneFilter !== "all" && alert.zone !== zoneFilter) return false;
    if (sectorFilters.size > 0 && !sectorFilters.has(alert.category)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <HandHelping className="w-8 h-8 text-primary" />
          <p className="text-slate-500 text-sm">Loading needs board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center gap-3">
          <HandHelping className="w-5 h-5" />
          <h1 className="text-base font-bold">Needs Board</h1>
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {filteredNeeds.length} open
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
        {/* Pattern Alert Banners */}
        {filteredAlerts.length > 0 && (
          <div className="space-y-2">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-900 font-medium">{alert.message}</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {getSectorName(alert.category, "en")} in {getZoneName(alert.zone, "en")} &middot; {timeAgo(alert.createdAt)}
                  </p>
                </div>
              </div>
            ))}
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

            {/* Urgency toggle */}
            <div className="relative">
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as NeedUrgency | "all")}
                className="appearance-none bg-slate-100 text-sm rounded-lg px-3 py-1.5 pe-7 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              >
                <option value="all">All Urgency</option>
                <option value="red">Critical</option>
                <option value="amber">Moderate</option>
                <option value="gray">Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sector chips */}
          <div className="flex flex-wrap gap-1.5">
            {SECTORS_META.map((s) => {
              const active = sectorFilters.has(s.id as Sector);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSector(s.id as Sector)}
                  className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    backgroundColor: active ? s.color : "transparent",
                    color: active ? "#fff" : s.color,
                    borderColor: s.color,
                  }}
                >
                  {s.nameEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Needs list */}
        <div className="space-y-3">
          {filteredNeeds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <HandHelping className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No needs match the current filters.</p>
            </div>
          ) : (
            filteredNeeds.map((need) => {
              const urgency = URGENCY_CONFIG[need.urgency];
              const sectorColor = getSectorColor(need.category);
              return (
                <div
                  key={need.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {need.actorName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: sectorColor }}
                        >
                          {getSectorName(need.category, "en")}
                        </span>
                        <span className="text-xs text-slate-500">
                          {getZoneName(need.zone, "en")}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {timeAgo(need.createdAt)}
                        </span>
                      </div>
                    </div>
                    {/* Urgency indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${urgency.dotColor}`}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: urgency.color }}
                      >
                        {urgency.label}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {need.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {need.respondedCount} actor{need.respondedCount !== 1 ? "s" : ""} responded
                    </span>
                    <button
                      onClick={() => setHelpModalActor(need.actorName)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-white px-3.5 py-1.5 rounded-xl transition-colors"
                      style={{ backgroundColor: "#e8913a" }}
                    >
                      I Can Help
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Help Modal */}
      {helpModalActor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setHelpModalActor(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1e3a5f]">Conversation Opened</h2>
              <button
                onClick={() => setHelpModalActor(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                Conversation opened with <span className="font-semibold">{helpModalActor}</span>.
                You can now coordinate directly to address this need.
              </p>
            </div>
            <button
              onClick={() => setHelpModalActor(null)}
              className="w-full py-2.5 rounded-xl font-medium text-white transition-colors"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
