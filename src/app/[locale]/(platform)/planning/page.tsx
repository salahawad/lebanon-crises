"use client";

import { useState, useEffect } from "react";
import {
  getSectorPlans,
  getGapAnalyses,
} from "@/lib/data/platform-api";
import {
  getZoneName,
  getSectorName,
  getSectorColor,
} from "@/lib/data/zones";
import type { SectorPlan, GapAnalysis } from "@/lib/types/platform";
import {
  LayoutGrid,
  BarChart3,
  Plus,
  MapPin,
  User,
  Calendar,
  AlertTriangle,
  TrendingUp,
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

type Tab = "plans" | "gaps";

export default function PlanningPage() {
  const [plans, setPlans] = useState<SectorPlan[]>([]);
  const [gaps, setGaps] = useState<GapAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("plans");

  useEffect(() => {
    async function load() {
      try {
        const [plansData, gapsData] = await Promise.all([
          getSectorPlans(),
          getGapAnalyses(),
        ]);
        setPlans(plansData);
        setGaps(gapsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group plans by sector
  const plansBySector = plans.reduce<Record<string, SectorPlan[]>>(
    (acc, plan) => {
      if (!acc[plan.sector]) acc[plan.sector] = [];
      acc[plan.sector].push(plan);
      return acc;
    },
    {}
  );

  function getCoverageColor(count: number): string {
    if (count === 0) return "bg-[#ef4444] text-white";
    if (count <= 2) return "bg-amber-400 text-amber-900";
    return "bg-[#22c55e] text-white";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#1e3a5f] text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            <h1 className="text-base font-bold">Sector Planning</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8913a] text-white text-sm font-medium hover:bg-[#e8913a]/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4">
        {/* Tab switcher */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-4">
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "plans"
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Coverage Plans
          </button>
          <button
            onClick={() => setActiveTab("gaps")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "gaps"
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Gap Analysis
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : activeTab === "plans" ? (
          /* ===== Coverage Plans Tab ===== */
          <div className="space-y-4">
            {Object.keys(plansBySector).length === 0 ? (
              <div className="text-center py-12">
                <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  No coverage plans yet
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Add a coverage plan to coordinate sector activities
                </p>
              </div>
            ) : (
              Object.entries(plansBySector).map(([sector, sectorPlans]) => (
                <div key={sector}>
                  {/* Sector group header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getSectorColor(sector) }}
                    />
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      {getSectorName(sector, "en")}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {sectorPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1 h-12 rounded-full flex-shrink-0 mt-0.5"
                            style={{
                              backgroundColor: getSectorColor(plan.sector),
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-sm font-semibold text-slate-900">
                                {plan.actorName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>
                                {getZoneName(plan.zone, "en")}
                              </span>
                              {plan.plannedStart && (
                                <>
                                  <span className="text-slate-300">|</span>
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Start: {plan.plannedStart}</span>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              {plan.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ===== Gap Analysis Tab ===== */
          <div className="space-y-6">
            {gaps.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  No gap analysis data
                </p>
              </div>
            ) : (
              gaps.map((gap) => (
                <div key={gap.zone} className="space-y-4">
                  {/* Zone header */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#1e3a5f]" />
                    <h2 className="text-base font-bold text-slate-900">
                      {getZoneName(gap.zone, "en")}
                    </h2>
                    <span className="text-xs text-slate-400">
                      Updated {timeAgo(gap.generatedAt)}
                    </span>
                  </div>

                  {/* Coverage matrix table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Sector
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Actors
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {gap.sectorCoverage.map((sc) => {
                            const isPersistent = gap.persistentNeeds.some(
                              (pn) => pn.sector === sc.sector
                            );
                            return (
                              <tr
                                key={sc.sector}
                                className={`border-b border-slate-50 ${
                                  isPersistent ? "bg-amber-50/50" : ""
                                }`}
                              >
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2.5 h-2.5 rounded-full"
                                      style={{
                                        backgroundColor: getSectorColor(
                                          sc.sector
                                        ),
                                      }}
                                    />
                                    <span className="font-medium text-slate-700">
                                      {getSectorName(sc.sector, "en")}
                                    </span>
                                    {isPersistent && (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${getCoverageColor(
                                      sc.actorCount
                                    )}`}
                                  >
                                    {sc.actorCount}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  {sc.actorCount === 0 ? (
                                    <span className="text-xs font-medium text-[#ef4444]">
                                      No coverage
                                    </span>
                                  ) : sc.actorCount <= 2 ? (
                                    <span className="text-xs font-medium text-amber-600">
                                      Low
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-[#22c55e]">
                                      Good
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Persistent needs */}
                  {gap.persistentNeeds.length > 0 && (
                    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
                      <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Persistent Needs
                      </h4>
                      <div className="space-y-1.5">
                        {gap.persistentNeeds.map((pn) => (
                          <div
                            key={pn.sector}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-amber-700">
                              {getSectorName(pn.sector, "en")}
                            </span>
                            <span className="text-xs text-amber-600 font-medium">
                              {pn.daysFlagged} days flagged
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collective shortfalls */}
                  {gap.collectiveShortfalls.length > 0 && (
                    <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
                      <h4 className="text-sm font-semibold text-red-800 flex items-center gap-1.5 mb-2">
                        <TrendingUp className="w-4 h-4 rotate-180" />
                        Collective Shortfalls
                      </h4>
                      <div className="space-y-1.5">
                        {gap.collectiveShortfalls.map((cs, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-red-700">{cs.resource}</span>
                            <span className="text-xs text-red-600 font-medium">
                              {cs.actorsFlagged} actors flagged
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Surpluses */}
                  {gap.surpluses.length > 0 && (
                    <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                      <h4 className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5 mb-2">
                        <Package className="w-4 h-4" />
                        Surplus Detected
                      </h4>
                      <div className="space-y-1.5">
                        {gap.surpluses.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-emerald-700">
                              {s.resource}
                            </span>
                            <span className="text-xs text-emerald-600 font-medium">
                              {s.actorsWithSurplus} actors within {s.withinKm}km
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
