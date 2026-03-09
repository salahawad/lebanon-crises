"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { RequestCard } from "./request-card";
import type { RequestCluster } from "@/lib/types";

const categoryIcons: Record<string, string> = {
  medicine: "\u{1F48A}", shelter: "\u{1F3E0}", food: "\u{1F35E}", baby_milk: "\u{1F37C}",
  transport: "\u{1F697}", clothing: "\u{1F455}", hygiene: "\u{1F9F4}", other: "\u{1F4E6}",
};

export function ClusterCard({ cluster }: { cluster: RequestCluster }) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[cluster.category] || "\u{1F4E6}"}</span>
            <div>
              <h3 className="font-semibold text-slate-900">
                {t("matching.requestsInArea", {
                  count: cluster.requests.length,
                  category: t(`request.categories.${cluster.category}`),
                  governorate: t(`request.governorates.${cluster.governorate}`),
                })}
              </h3>
              <p className="text-xs text-slate-500">
                {t("matching.totalPeople", { count: cluster.totalPeople })}
                {cluster.city && ` \u2014 ${cluster.city}`}
              </p>
            </div>
          </div>
          <span className="text-slate-400 text-lg">{expanded ? "\u25B2" : "\u25BC"}</span>
        </div>
      </Card>

      {expanded && (
        <div className="ms-4 mt-2 space-y-2">
          {cluster.requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
