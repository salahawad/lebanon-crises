"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { RequestFilters, RequestCategory, Governorate, UrgencyLevel } from "@/lib/types";

interface FilterSheetProps {
  filters: RequestFilters;
  onApply: (filters: RequestFilters) => void;
}

const CATEGORIES: RequestCategory[] = [
  "medicine", "shelter", "food", "baby_milk", "transport", "clothing", "hygiene", "other",
];
const GOVERNORATES: Governorate[] = [
  "beirut", "mount_lebanon", "north", "south", "bekaa", "baalbek_hermel", "akkar", "nabatieh",
];
const URGENCIES: UrgencyLevel[] = ["critical", "high", "medium", "low"];

export function FilterSheet({ filters, onApply }: FilterSheetProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<RequestFilters>(filters);

  const handleApply = () => {
    onApply(local);
    setOpen(false);
  };

  const handleClear = () => {
    const cleared = {};
    setLocal(cleared);
    onApply(cleared);
    setOpen(false);
  };

  const hasFilters = local.category || local.governorate || local.urgency;

  return (
    <div>
      <Button
        variant={hasFilters ? "primary" : "outline"}
        size="sm"
        onClick={() => setOpen(!open)}
      >
        {t("common.filter")} {hasFilters && "●"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{t("browse.filterBy")}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 tap-target"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <Select
                label={t("request.category")}
                placeholder={t("browse.allCategories")}
                value={local.category || ""}
                onChange={(e) =>
                  setLocal({
                    ...local,
                    category: (e.target.value || undefined) as RequestCategory | undefined,
                  })
                }
                options={CATEGORIES.map((c) => ({
                  value: c,
                  label: t(`request.categories.${c}`),
                }))}
              />

              <Select
                label={t("request.governorate")}
                placeholder={t("browse.allAreas")}
                value={local.governorate || ""}
                onChange={(e) =>
                  setLocal({
                    ...local,
                    governorate: (e.target.value || undefined) as Governorate | undefined,
                  })
                }
                options={GOVERNORATES.map((g) => ({
                  value: g,
                  label: t(`request.governorates.${g}`),
                }))}
              />

              <Select
                label={t("request.urgency")}
                placeholder={t("browse.allUrgency")}
                value={local.urgency || ""}
                onChange={(e) =>
                  setLocal({
                    ...local,
                    urgency: (e.target.value || undefined) as UrgencyLevel | undefined,
                  })
                }
                options={URGENCIES.map((u) => ({
                  value: u,
                  label: t(`request.urgencyLevels.${u}`),
                }))}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleClear} className="flex-1">
                {t("browse.clearFilters")}
              </Button>
              <Button variant="primary" onClick={handleApply} className="flex-1">
                {t("common.filter")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
