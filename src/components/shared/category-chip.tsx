"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import type { RequestCategory } from "@/lib/types";

interface CategoryChipProps {
  category: RequestCategory;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const categoryIcons: Record<RequestCategory, string> = {
  medicine: "💊",
  shelter: "🏠",
  food: "🍞",
  baby_milk: "🍼",
  transport: "🚗",
  clothing: "👕",
  hygiene: "🧴",
  other: "📦",
};

export function CategoryChip({
  category,
  selected,
  onClick,
  className,
}: CategoryChipProps) {
  const t = useTranslations("request.categories");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
        "border transition-colors tap-target",
        selected
          ? "bg-primary text-white border-primary"
          : "bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary",
        className
      )}
    >
      <span aria-hidden="true">{categoryIcons[category]}</span>
      {t(category)}
    </button>
  );
}
