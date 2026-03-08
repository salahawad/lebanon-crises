"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const t = useTranslations("errors");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="text-4xl mb-3" aria-hidden="true">
        ⚠️
      </span>
      <h3 className="text-lg font-semibold text-slate-700">
        {message || t("generic")}
      </h3>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          {t("generic")}
        </Button>
      )}
    </div>
  );
}
