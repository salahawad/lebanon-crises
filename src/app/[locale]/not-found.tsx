"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <span className="text-6xl block mb-4" aria-hidden="true">
          🔍
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {t("errors.notFound")}
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          {t("landing.subtitle")}
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            {t("success.backHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
