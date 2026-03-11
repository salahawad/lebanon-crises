"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { RequestStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusStyles: Record<RequestStatus, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  open: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  fulfilled: "bg-slate-100 text-slate-600",
  archived: "bg-slate-100 text-slate-500",
  flagged: "bg-red-100 text-red-800",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("status");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      {t(status)}
    </span>
  );
}
