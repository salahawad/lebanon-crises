"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { UrgencyBadge } from "./urgency-badge";
import { cn } from "@/lib/utils/cn";
import { timeAgo, timeAgoAr, truncate } from "@/lib/utils/helpers";
import type { HelpRequest } from "@/lib/types";

interface RequestCardProps {
  request: HelpRequest;
  showActions?: boolean;
  adminView?: boolean;
}

const categoryIcons: Record<string, string> = {
  medicine: "💊",
  shelter: "🏠",
  food: "🍞",
  baby_milk: "🍼",
  transport: "🚗",
  clothing: "👕",
  hygiene: "🧴",
  other: "📦",
};

export function RequestCard({
  request,
  showActions = true,
  adminView = false,
}: RequestCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const timeStr =
    locale === "ar" ? timeAgoAr(request.createdAt) : timeAgo(request.createdAt);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl" aria-hidden="true">
            {categoryIcons[request.category] || "📦"}
          </span>
          <div>
            <h3 className="font-semibold text-base text-slate-900">
              {t(`request.categories.${request.category}`)}
            </h3>
            <p className="text-xs text-slate-500">{timeStr}</p>
          </div>
        </div>
        <UrgencyBadge urgency={request.urgency} />
      </div>

      <p className="mt-2 text-sm text-slate-700 leading-relaxed">
        {truncate(request.description, 120)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>
          📍 {t(`request.governorates.${request.governorate}`)}
          {request.city && ` — ${request.city}`}
        </span>
        <span>
          👥 {request.peopleCount} {t("browse.people")}
        </span>
        {adminView && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full font-medium",
              request.status === "open" && "bg-green-100 text-green-700",
              request.status === "in_progress" &&
                "bg-blue-100 text-blue-700",
              request.status === "fulfilled" &&
                "bg-slate-100 text-slate-600",
              request.status === "flagged" && "bg-red-100 text-red-700"
            )}
          >
            {t(`status.${request.status}`)}
          </span>
        )}
        {request.moderationFlags.length > 0 && adminView && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
            ⚠ {request.moderationFlags.join(", ")}
          </span>
        )}
      </div>

      {showActions && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <Link
            href={adminView ? `/admin/moderation?id=${request.id}` : `/request/${request.id}`}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors tap-target"
          >
            {adminView ? t("admin.moderation") : t("browse.viewDetails")}
            <span className="rtl-flip inline-block">→</span>
          </Link>
        </div>
      )}
    </Card>
  );
}
