"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Handshake,
  Target,
  Lock,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { getOutcomeReports, getNetworkOutcomes } from "@/lib/data/platform-api";
import type { OutcomeReport, NetworkOutcome } from "@/lib/types/platform";

function formatWeek(weekStr: string): string {
  // e.g. "2026-W12" -> "Week 12, 2026"
  const match = weekStr.match(/^(\d{4})-W(\d{1,2})$/);
  if (!match) return weekStr;
  return `Week ${parseInt(match[2])}, ${match[1]}`;
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (current > previous) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[#22c55e] text-xs font-medium">
        <ArrowUpRight className="w-3.5 h-3.5" />
        +{current - previous}
      </span>
    );
  }
  if (current < previous) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[#ef4444] text-xs font-medium">
        <ArrowDownRight className="w-3.5 h-3.5" />
        {current - previous}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-slate-400 text-xs font-medium">
      <Minus className="w-3.5 h-3.5" />
      0
    </span>
  );
}

export default function OutcomesPage() {
  const [reports, setReports] = useState<OutcomeReport[]>([]);
  const [networkOutcomes, setNetworkOutcomes] = useState<NetworkOutcome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOutcomeReports(), getNetworkOutcomes()])
      .then(([r, n]) => {
        setReports(r);
        setNetworkOutcomes(n);
      })
      .finally(() => setLoading(false));
  }, []);

  const thisWeek = networkOutcomes[0];
  const lastWeek = networkOutcomes[1];
  const twoWeeksAgo = networkOutcomes[2];

  // Sort outcomes newest first for trend display
  const sortedOutcomes = useMemo(
    () => [...networkOutcomes].sort((a, b) => b.weekOf.localeCompare(a.weekOf)),
    [networkOutcomes]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/2 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-full mb-2" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Outcome Monitoring</h1>
          <p className="text-sm text-slate-500">Network performance at a glance</p>
        </div>
      </div>

      {/* Network-internal badge */}
      <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-[#1e3a5f]/5 rounded-xl w-fit">
        <Lock className="w-4 h-4 text-[#1e3a5f]" />
        <span className="text-sm font-medium text-[#1e3a5f]">
          Network-internal only
        </span>
      </div>

      {/* This week summary stats */}
      {thisWeek && (
        <>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            This Week — {formatWeek(thisWeek.weekOf)}
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
              <Users className="w-5 h-5 text-[#1e3a5f] mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-slate-900">
                {thisWeek.totalFamilies.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Families Reached</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
              <Handshake className="w-5 h-5 text-[#e8913a] mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-slate-900">
                {thisWeek.totalCollaborations}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Active Collabs</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
              <Target className="w-5 h-5 text-[#22c55e] mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-slate-900">
                {thisWeek.gapsClosed}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Gaps Closed</p>
            </div>
          </div>
        </>
      )}

      {/* Week-over-week trend */}
      {sortedOutcomes.length >= 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#1e3a5f]" />
            <h3 className="text-base font-semibold text-slate-900">Week-over-Week Trend</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">Week</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">Families</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">Needs Resolved</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">Collabs</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">Gaps</th>
                </tr>
              </thead>
              <tbody>
                {sortedOutcomes.map((week, idx) => {
                  const prev = sortedOutcomes[idx + 1];
                  return (
                    <tr key={week.weekOf} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 font-medium text-slate-700">
                        {formatWeek(week.weekOf)}
                        {idx === 0 && (
                          <span className="ms-2 text-[10px] bg-[#22c55e]/10 text-[#22c55e] px-1.5 py-0.5 rounded-full font-semibold">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-end">
                        <span className="text-slate-900 font-medium">{week.totalFamilies.toLocaleString()}</span>
                        {prev && (
                          <span className="ms-2">
                            <TrendArrow current={week.totalFamilies} previous={prev.totalFamilies} />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-end">
                        <span className="text-slate-900 font-medium">{week.totalNeedsResolved}</span>
                        {prev && (
                          <span className="ms-2">
                            <TrendArrow current={week.totalNeedsResolved} previous={prev.totalNeedsResolved} />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-end">
                        <span className="text-slate-900 font-medium">{week.totalCollaborations}</span>
                        {prev && (
                          <span className="ms-2">
                            <TrendArrow current={week.totalCollaborations} previous={prev.totalCollaborations} />
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-end">
                        <span className="text-slate-900 font-medium">{week.gapsClosed}</span>
                        {prev && (
                          <span className="ms-2">
                            <TrendArrow current={week.gapsClosed} previous={prev.gapsClosed} />
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
      )}

      {/* Individual actor reports */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Actor Reports
      </h2>
      <div className="space-y-3 mb-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{report.actorName}</h3>
              <span className="text-xs text-slate-400">{formatWeek(report.weekOf)}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-[#1e3a5f]">{report.familiesReached}</p>
                <p className="text-[11px] text-slate-500">Families</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-[#22c55e]">{report.needsResolved}</p>
                <p className="text-[11px] text-slate-500">Needs Resolved</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-[#e8913a]">{report.referralsCompleted}</p>
                <p className="text-[11px] text-slate-500">Referrals</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-700">{report.collaborationsCompleted}</p>
                <p className="text-[11px] text-slate-500">Collabs Done</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Not a reporting tool — shared for peer coordination. Data is self-reported by actors and not independently verified. Use for coordination awareness, not for formal assessment or evaluation.
        </p>
      </div>
    </div>
  );
}
