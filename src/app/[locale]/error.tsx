"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/lib/logger";

const log = createLogger("error-boundary:locale");

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    log.error("unhandled error caught by boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-6xl block mb-4" aria-hidden="true">
          &#x26A0;&#xFE0F;
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t("errors.generic")}
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          {t("errors.network")}
        </p>
        <Button variant="primary" size="lg" onClick={reset}>
          {t("errors.tryAgain")}
        </Button>
      </div>
    </div>
  );
}
