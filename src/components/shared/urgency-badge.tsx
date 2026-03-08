"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { UrgencyLevel } from "@/lib/types";

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

const urgencyStyles: Record<UrgencyLevel, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const t = useTranslations("urgency");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        urgencyStyles[urgency],
        className
      )}
    >
      {urgency === "critical" && (
        <span className="me-1" aria-hidden="true">
          ●
        </span>
      )}
      {t(urgency)}
    </span>
  );
}
