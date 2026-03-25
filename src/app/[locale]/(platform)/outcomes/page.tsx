"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
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
      <span className="inline-flex items-center gap-0.5 text-success text-xs font-medium">
        <ArrowUpRight className="w-3.5 h-3.5" />
        +{current - previous}
      </span>
    );
  }
  if (current < previous) {
    return (
      <span className="inline-flex items-center gap-0.5 text-danger text-xs font-medium">
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
  const locale = useLocale();
  const t = useTranslations("platform");
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
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
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
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t("outcomes.title")}</h1>
          <p className="text-sm text-slate-500">{t("outcomes.subtitle")}</p>
        </div>
      </div>

      {/* Network-internal badge */}
      <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-primary/5 rounded-xl w-fit">
        <Lock className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          {t("outcomes.networkInternal")}
        </span>
      </div>

      {/* This week summary stats */}
      {thisWeek && (
        <>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            This Week — {formatWeek(thisWeek.weekOf)}
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <Users className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-slate-900">
                {thisWeek.totalFamilies.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{t("outcomes.familiesReached")}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <Handshake className="w-5 h-5 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-slate-900">
                {thisWeek.totalCollaborations}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{t("outcomes.activeCollabs")}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <Target className="w-5 h-5 text-success mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-slate-900">
                {thisWeek.gapsClosed}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{t("outcomes.gapsClosed")}</p>
            </div>
          </div>
        </>
      )}

      {/* Week-over-week trend */}
      {sortedOutcomes.length >= 2 && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-slate-900">{t("outcomes.weekOverWeek")}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">{t("outcomes.week")}</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">{t("outcomes.families")}</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">{t("outcomes.needsResolved")}</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">{t("outcomes.collabs")}</th>
                  <th className="text-end py-2 text-xs font-medium text-slate-500 uppercase">{t("outcomes.gaps")}</th>
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
                          <span className="ms-2 text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full font-semibold">
                            {t("outcomes.current")}
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
        {t("outcomes.actorReports")}
      </h2>
      <div className="space-y-3 mb-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{report.actorName}</h3>
              <span className="text-xs text-slate-400">{formatWeek(report.weekOf)}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-primary">{report.familiesReached}</p>
                <p className="text-[11px] text-slate-500">{t("outcomes.families")}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-success">{report.needsResolved}</p>
                <p className="text-[11px] text-slate-500">{t("outcomes.needsResolved")}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-accent">{report.referralsCompleted}</p>
                <p className="text-[11px] text-slate-500">{t("outcomes.referrals")}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-700">{report.collaborationsCompleted}</p>
                <p className="text-[11px] text-slate-500">{t("outcomes.collabsDone")}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          {t("outcomes.disclaimer")}
        </p>
      </div>
    </div>
  );
}
