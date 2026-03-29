"use client";

import { useOffline } from "@/lib/hooks/use-offline";
import { WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function OfflineBanner() {
  const { isOffline } = useOffline();
  const t = useTranslations("offline");

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>{t("banner")}</span>
    </div>
  );
}
