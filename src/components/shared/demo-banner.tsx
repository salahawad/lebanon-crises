"use client";

import { useTranslations } from "next-intl";

export function DemoBanner() {
  const t = useTranslations();

  return (
    <div className="bg-amber-400 text-amber-950 text-center text-xs font-medium py-1.5 px-4">
      {t("disclaimer.banner")}
    </div>
  );
}
