"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LebanonMap } from "@/components/shared/lebanon-map";
import { getShelters, getShelterCountsByGovernorate } from "@/lib/firebase/shelters";
import type { Shelter, Governorate } from "@/lib/types";

const GOVERNORATES: { id: Governorate; letterEn: string; letterAr: string; color: string }[] = [
  { id: "beirut", letterEn: "B", letterAr: "ب", color: "#1E3A8A" },
  { id: "mount_lebanon", letterEn: "ML", letterAr: "ج.ل", color: "#2d6a4f" },
  { id: "north", letterEn: "N", letterAr: "ش", color: "#7c3aed" },
  { id: "akkar", letterEn: "AK", letterAr: "ع", color: "#b45309" },
  { id: "baalbek_hermel", letterEn: "BH", letterAr: "ب.هـ", color: "#be123c" },
  { id: "bekaa", letterEn: "BK", letterAr: "بق", color: "#0d9488" },
  { id: "south", letterEn: "S", letterAr: "ج", color: "#2563eb" },
  { id: "nabatieh", letterEn: "NB", letterAr: "نب", color: "#c2410c" },
];

export default function SheltersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === "ar";

  const searchParams = useSearchParams();
  const govParam = searchParams.get("gov") as Governorate | null;

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGov, setSelectedGov] = useState<Governorate | null>(govParam);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getShelters()
      .then(setShelters)
      .catch(() => setError(t("errors.generic")))
      .finally(() => setLoading(false));
  }, [t]);

  const govCounts = useMemo(() => getShelterCountsByGovernorate(shelters), [shelters]);

  const filtered = useMemo(() => {
    if (!selectedGov) return [];
    let result = shelters.filter((s) => s.governorate === selectedGov);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.nameAr.toLowerCase().includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q)
      );
    }
    return result;
  }, [shelters, selectedGov, search]);

  // Group by district within the selected governorate
  const grouped = useMemo(() => {
    const acc: Record<string, Shelter[]> = {};
    for (const s of filtered) {
      const key = s.district || "—";
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
    }
    return acc;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("shelters.title")} />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-pulse space-y-4 max-w-xs mx-auto">
              <div className="h-6 bg-slate-200 rounded w-2/3 mx-auto" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Pick your area */}
        {!loading && !error && !selectedGov && (
          <div>
            <p className="text-sm text-slate-600 mb-2 text-start">
              {t("shelters.subtitle")}
            </p>
            <p className="text-center text-xs text-slate-400 mb-6">
              {t("shelters.totalCount", { count: shelters.length })}
            </p>

            <h2 className="text-lg font-bold text-slate-800 text-center mb-4">
              {t("shelters.whereAreYou")}
            </h2>
            <p className="text-sm text-slate-500 text-center mb-5">
              {t("shelters.pickArea")}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {GOVERNORATES.map(({ id, letterEn, letterAr, color }) => {
                const letter = isAr ? letterAr : letterEn;
                const count = govCounts[id] || 0;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedGov(id)}
                    className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-slate-200 bg-white text-center hover:border-emerald-500 hover:bg-emerald-50 active:bg-emerald-100 transition-colors tap-target"
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
                      <circle cx="18" cy="18" r="17" fill={color} />
                      <text x="18" y="19" textAnchor="middle" dominantBaseline="central" fill="white" fontSize={letter.length > 1 ? "11" : "14"} fontWeight="700" fontFamily="system-ui, sans-serif">{letter}</text>
                    </svg>
                    <span className="text-sm font-semibold text-slate-800">
                      {t(`request.governorates.${id}`)}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-100 px-2 py-0.5 rounded-full">
                      {count} {t("shelters.viewShelters").toLowerCase()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Map */}
            {Object.keys(govCounts).length > 0 && (
              <div className="mt-6">
                <LebanonMap
                  counts={govCounts}
                  onSelect={(gov) => setSelectedGov(gov as Governorate)}
                  tooltipLabel={t("shelters.viewShelters").toLowerCase()}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Show shelters for selected area */}
        {!loading && !error && selectedGov && (
          <div>
            {/* Area header with back button */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-slate-800 leading-tight">
                  {t("shelters.sheltersIn", { area: t(`request.governorates.${selectedGov}`) })}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("shelters.showing", { count: filtered.length })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => { setSelectedGov(null); setSearch(""); }}
              >
                {t("shelters.changeArea")}
              </Button>
            </div>

            {/* Search within area */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("shelters.searchPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors mb-4"
            />

            {/* Empty state */}
            {filtered.length === 0 && (
              <EmptyState
                icon="🏫"
                title={t("shelters.noResults")}
                description={t("shelters.noResultsSearch")}
              />
            )}

            {/* Shelter list grouped by district */}
            {Object.entries(grouped).map(([district, items]) => (
              <div key={district} className="mb-5">
                <h3 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1.5 text-start">
                  {district}
                  <span className="text-slate-400 font-normal ms-2">({items.length})</span>
                </h3>
                <div className="space-y-2">
                  {items.map((shelter) => (
                    <Card key={shelter.id} className="!p-3">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 text-xl mt-0.5" aria-hidden="true">🏫</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-900 text-sm text-start leading-snug">
                            {isAr ? shelter.nameAr : shelter.nameEn}
                          </h4>
                          {isAr && shelter.nameEn && (
                            <p className="text-xs text-slate-400 mt-0.5 text-start" dir="ltr">
                              {shelter.nameEn}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1 text-start">
                            {shelter.area}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {shelter.phone && (
                              <a
                                href={`tel:${shelter.phone}`}
                                dir="ltr"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors tap-target"
                              >
                                <span aria-hidden="true">📞</span>
                                {t("shelters.callShelter")}
                              </a>
                            )}
                            {shelter.classrooms && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                                {t("shelters.classrooms", { count: shelter.classrooms })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        {!loading && !error && (
          <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-start">
            <p className="text-xs text-emerald-800 leading-relaxed">
              {t("shelters.disclaimer")}
            </p>
            <p className="text-xs text-emerald-600 mt-2 pt-2 border-t border-emerald-200 leading-relaxed">
              {t("shelters.disclaimerSource")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
