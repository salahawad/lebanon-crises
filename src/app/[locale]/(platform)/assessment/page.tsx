"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  const locale = useLocale();
  const t = useTranslations("platform");
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
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            <h1 className="text-base font-bold">{t("assessment.title")}</h1>
          </div>
          <button
            onClick={() => setShowTrigger(!showTrigger)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("assessment.triggerNew")}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4">
        {/* Trigger new assessment panel */}
        {showTrigger && (
          <div className="bg-white rounded-lg border border-accent/30 p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-3">
              {t("assessment.triggerNewAssessment")}
            </h3>
            <label className="block text-sm text-slate-600 mb-1.5">
              {t("assessment.selectZone")}
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">{t("assessment.chooseZone")}</option>
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {locale === "ar" ? z.nameAr : z.nameEn}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-3">
              <button
                disabled={!selectedZone}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                {t("assessment.sendAssessment")}
              </button>
              <button
                onClick={() => {
                  setShowTrigger(false);
                  setSelectedZone("");
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t("assessment.demoMode")}
            </p>
          </div>
        )}

        {/* Assessment list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse"
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
            <p className="text-slate-500 font-medium">{t("assessment.noAssessments")}</p>
            <p className="text-sm text-slate-400 mt-1">
              {t("assessment.triggerDescription")}
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
                  className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                >
                  {/* Assessment card header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-slate-900">
                            {getZoneName(assessment.zone, locale)}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(
                              assessment.status
                            )}`}
                          >
                            {assessment.status === "active"
                              ? t("status.active")
                              : t("status.closed")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">
                          {t("assessment.triggeredBy", { name: assessment.triggeredByName })}
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
                        className="flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        {isExpanded ? t("assessment.hideResults") : t("assessment.viewResults")}
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
                            {t("assessment.avgDisplaced")}
                          </p>
                          <p className="text-xl font-bold text-slate-900">
                            {snapshot.avgDisplaced.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 mb-0.5">
                            {t("outcomes.familiesReached")}
                          </p>
                          <p className="text-xl font-bold text-success">
                            {snapshot.totalFamiliesReached.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Top unmet needs — horizontal bars */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-accent" />
                          {t("assessment.topUnmetNeeds")}
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
                                    {getSectorName(need.sector, locale)}
                                  </span>
                                  <span className="text-slate-500">
                                    {t("assessment.reports", { count: need.count })}
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
                            {t("assessment.zeroCoverageSectors")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {snapshot.zeroCoverage.map((zc) => (
                              <span
                                key={zc.sector}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-danger/10 text-danger text-xs font-medium"
                              >
                                {getSectorName(zc.sector, locale)}
                                <span className="text-danger/60">
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
                            <TrendingDown className="w-4 h-4 text-danger" />
                            <p className="text-xs text-slate-500">
                              {t("assessment.reducedCapacity")}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-danger">
                            {snapshot.reducedCapacityPct}%
                          </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Package className="w-4 h-4 text-success" />
                            <p className="text-xs text-slate-500">
                              {t("assessment.surplusSectors")}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {snapshot.surplusSectors.length > 0 ? (
                              snapshot.surplusSectors.map((s) => (
                                <span
                                  key={s.sector}
                                  className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium"
                                >
                                  {getSectorName(s.sector, locale)}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400">
                                {t("common.none")}
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
