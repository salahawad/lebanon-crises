"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  Megaphone,
  MapPin,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  Send,
} from "lucide-react";
import {
  getUrgencyAlerts,
  getActiveAlerts,
  getActorsByZone,
} from "@/lib/data/platform-api";
import type { UrgencyAlert, Sector } from "@/lib/types/platform";
import { getZoneName, getSectorName, getSectorColor } from "@/lib/data/zones";

const SECTORS: Sector[] = [
  "food",
  "medical",
  "shelter",
  "psychosocial",
  "legal",
  "logistics",
  "wash",
  "education",
  "protection",
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function countdown(expiresAt: number): string {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return "Expired";
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m remaining`;
}

function AlertCard({
  alert,
  zoneActorCount,
}: {
  alert: UrgencyAlert;
  zoneActorCount: number;
}) {
  const isActive = alert.status === "active";
  const isEscalated = alert.escalated;
  const sectorColor = getSectorColor(alert.category);

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all ${
        isActive
          ? isEscalated
            ? "border-[#ef4444] bg-red-50"
            : "border-[#e8913a] bg-orange-50"
          : "border-slate-200 bg-slate-50 opacity-60"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 ${
              isActive
                ? isEscalated
                  ? "text-[#ef4444]"
                  : "text-[#e8913a]"
                : "text-slate-400"
            }`}
          />
          <span className="font-semibold text-[#1e3a5f] text-sm truncate">
            {alert.actorName}
          </span>
        </div>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: `${sectorColor}18`,
            color: sectorColor,
          }}
        >
          {getSectorName(alert.category, "en")}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-700 mb-3">{alert.description}</p>

      {/* Zone */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
        <MapPin className="w-3.5 h-3.5" />
        <span>{getZoneName(alert.zone, "en")}</span>
      </div>

      {/* SMS note */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
        <MessageSquare className="w-3.5 h-3.5" />
        <span>
          Sent to {zoneActorCount} actors in zone via SMS
        </span>
      </div>

      {/* Escalation indicator */}
      {isEscalated && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#ef4444] bg-red-100 rounded-lg px-2.5 py-1.5 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            Escalated — 2+ actors flagged this need
            {alert.relatedAlerts.length > 0 && (
              <span className="text-red-400 ms-1">
                ({alert.relatedAlerts.length} connected alert
                {alert.relatedAlerts.length !== 1 ? "s" : ""})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Footer: time ago + countdown */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
        <span className="text-xs text-slate-400">
          {timeAgo(alert.createdAt)}
        </span>
        {isActive && (
          <div className="flex items-center gap-1 text-xs font-medium text-[#e8913a]">
            <Clock className="w-3.5 h-3.5" />
            <span>{countdown(alert.expiresAt)}</span>
          </div>
        )}
        {!isActive && (
          <span className="text-xs text-slate-400 font-medium">Expired</span>
        )}
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [allAlerts, setAllAlerts] = useState<UrgencyAlert[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<UrgencyAlert[]>([]);
  const [expiredAlerts, setExpiredAlerts] = useState<UrgencyAlert[]>([]);
  const [zoneActorCounts, setZoneActorCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagCategory, setFlagCategory] = useState<Sector>("food");
  const [flagDescription, setFlagDescription] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    async function load() {
      const [all, active] = await Promise.all([
        getUrgencyAlerts(),
        getActiveAlerts(),
      ]);
      setAllAlerts(all);
      setActiveAlerts(active);
      setExpiredAlerts(all.filter((a) => a.status !== "active"));

      // Get actor counts per zone for each alert
      const zones = [...new Set(all.map((a) => a.zone))];
      const counts: Record<string, number> = {};
      await Promise.all(
        zones.map(async (zone) => {
          const actors = await getActorsByZone(zone);
          counts[zone] = actors.length;
        })
      );
      setZoneActorCounts(counts);
      setLoading(false);
    }
    load();
  }, []);

  // Tick every minute to update countdown timers
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  function handleFlagSubmit() {
    // In production this would POST to the API
    setShowFlagModal(false);
    setFlagDescription("");
    setFlagCategory("food");
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto md:max-w-4xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border p-4 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto md:max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1e3a5f]">Urgency Alerts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeAlerts.length} active alert
            {activeAlerts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Megaphone className="w-6 h-6 text-[#e8913a]" />
      </div>

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-[#ef4444] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            Active Alerts
          </h2>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                zoneActorCount={zoneActorCounts[alert.zone] ?? 0}
              />
            ))}
          </div>
        </section>
      )}

      {activeAlerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 mb-6">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No active alerts right now</p>
        </div>
      )}

      {/* Expired alerts (collapsed) */}
      {expiredAlerts.length > 0 && (
        <section className="mb-6">
          <button
            onClick={() => setShowExpired(!showExpired)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 hover:text-slate-600 transition-colors"
          >
            {showExpired ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Expired Alerts ({expiredAlerts.length})
          </button>
          {showExpired && (
            <div className="space-y-3">
              {expiredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  zoneActorCount={zoneActorCounts[alert.zone] ?? 0}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Flag Urgent Need button */}
      <div className="fixed bottom-20 left-0 right-0 md:bottom-20 z-30 px-4">
        <div className="max-w-lg mx-auto md:max-w-4xl">
          <button
            onClick={() => setShowFlagModal(true)}
            className="w-full bg-[#ef4444] hover:bg-red-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Flag Urgent Need
          </button>
        </div>
      </div>

      {/* Flag modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1e3a5f]">
                Flag Urgent Need
              </h3>
              <button
                onClick={() => setShowFlagModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Category selector */}
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFlagCategory(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    flagCategory === s
                      ? "text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  style={
                    flagCategory === s
                      ? { backgroundColor: getSectorColor(s) }
                      : undefined
                  }
                >
                  {getSectorName(s, "en")}
                </button>
              ))}
            </div>

            {/* Description */}
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={flagDescription}
              onChange={(e) =>
                setFlagDescription(e.target.value.slice(0, 140))
              }
              placeholder="Describe the urgent need..."
              rows={3}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {flagDescription.length}/140
            </p>

            {/* Submit */}
            <button
              onClick={handleFlagSubmit}
              disabled={!flagDescription.trim()}
              className="w-full mt-3 bg-[#ef4444] hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
