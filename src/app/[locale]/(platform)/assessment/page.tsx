"use client";

import { useState, useEffect } from "react";
import {
  getFlashAssessments,
  getAssessmentSnapshot,
} from "@/lib/data/platform-api";
import { getZoneName, getSectorName, getSectorColor } from "@/lib/data/zones";
import { ZONES } from "@/lib/data/zones";
import type {
  FlashAssessment,
  AssessmentSnapshot,
} from "@/lib/types/platform";
import {
  ClipboardCheck,
  Clock,
  Users,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  MapPin,
  BarChart3,
  Package,
} from "lucide-react";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AssessmentPage() {
  const [assessments, setAssessments] = useState<FlashAssessment[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, AssessmentSnapshot>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showTrigger, setShowTrigger] = useState(false);
  const [selectedZone, setSelectedZone] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getFlashAssessments();
        const sorted = [...data].sort((a, b) => b.createdAt - a.createdAt);
        setAssessments(sorted);

        // Fetch snapshots for ready assessments
        const snaps: Record<string, AssessmentSnapshot> = {};
        for (const a of sorted) {
          if (a.snapshotReady) {
            const snap = await getAssessmentSnapshot(a.id);
            if (snap) snaps[a.id] = snap;
          }
        }
        setSnapshots(snaps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getStatusColor(status: string): string {
    return status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-600";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            <h1 className="text-base font-bold">Flash Assessment</h1>
          </div>
          <button
            onClick={() => setShowTrigger(!showTrigger)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8913a] text-white text-sm font-medium hover:bg-[#e8913a]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Trigger New
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4">
        {/* Trigger new assessment panel */}
        {showTrigger && (
          <div className="bg-white rounded-2xl border border-[#e8913a]/30 p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-3">
              Trigger New Assessment
            </h3>
            <label className="block text-sm text-slate-600 mb-1.5">
              Select Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
            >
              <option value="">Choose a zone...</option>
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nameEn}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-3">
              <button
                disabled={!selectedZone}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#1e3a5f]/90 transition-colors"
              >
                Send Assessment
              </button>
              <button
                onClick={() => {
                  setShowTrigger(false);
                  setSelectedZone("");
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Demo mode — assessment will not actually be sent
            </p>
          </div>
        )}

        {/* Assessment list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No assessments yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Trigger a flash assessment to gather rapid situation reports
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const snapshot = snapshots[assessment.id];
              const isExpanded = expandedId === assessment.id;

              return (
                <div
                  key={assessment.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  {/* Assessment card header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-[#1e3a5f]" />
                          <h3 className="font-semibold text-slate-900">
                            {getZoneName(assessment.zone, "en")}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(
                              assessment.status
                            )}`}
                          >
                            {assessment.status === "active"
                              ? "Active"
                              : "Closed"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">
                          Triggered by{" "}
                          <span className="font-medium text-slate-700">
                            {assessment.triggeredByName}
                          </span>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {assessment.responsesCount}/
                            {assessment.totalActorsInZone} responses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {timeAgo(assessment.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand snapshot toggle */}
                    {assessment.snapshotReady && snapshot && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : assessment.id)
                        }
                        className="flex items-center gap-1 mt-3 text-sm font-medium text-[#1e3a5f] hover:text-[#1e3a5f]/80 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        {isExpanded ? "Hide Results" : "View Results"}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Snapshot results */}
                  {isExpanded && snapshot && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-4">
                      {/* Key metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-0.5">
                            Avg Displaced
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {snapshot.avgDisplaced.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-0.5">
                            Families Reached
                          </p>
                          <p className="text-xl font-bold text-[#22c55e]">
                            {snapshot.totalFamiliesReached.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Top unmet needs — horizontal bars */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-[#e8913a]" />
                          Top Unmet Needs
                        </h4>
                        <div className="space-y-2">
                          {snapshot.topNeeds.map((need) => {
                            const maxCount = Math.max(
                              ...snapshot.topNeeds.map((n) => n.count)
                            );
                            const pct = (need.count / maxCount) * 100;
                            return (
                              <div key={need.sector}>
                                <div className="flex items-center justify-between text-xs mb-0.5">
                                  <span className="text-slate-700 font-medium">
                                    {getSectorName(need.sector, "en")}
                                  </span>
                                  <span className="text-slate-500">
                                    {need.count} reports
                                  </span>
                                </div>
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: getSectorColor(
                                        need.sector
                                      ),
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Zero coverage sectors */}
                      {snapshot.zeroCoverage.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">
                            Zero Coverage Sectors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {snapshot.zeroCoverage.map((zc) => (
                              <span
                                key={zc.sector}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] text-xs font-medium"
                              >
                                {getSectorName(zc.sector, "en")}
                                <span className="text-[#ef4444]/60">
                                  ({zc.count})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reduced capacity & surplus */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingDown className="w-4 h-4 text-[#ef4444]" />
                            <p className="text-xs text-slate-500">
                              Reduced Capacity
                            </p>
                          </div>
                          <p className="text-xl font-bold text-[#ef4444]">
                            {snapshot.reducedCapacityPct}%
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Package className="w-4 h-4 text-[#22c55e]" />
                            <p className="text-xs text-slate-500">
                              Surplus Sectors
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {snapshot.surplusSectors.length > 0 ? (
                              snapshot.surplusSectors.map((s) => (
                                <span
                                  key={s.sector}
                                  className="text-xs px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-medium"
                                >
                                  {getSectorName(s.sector, "en")}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400">
                                None
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 text-right">
                        Generated {timeAgo(snapshot.generatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
