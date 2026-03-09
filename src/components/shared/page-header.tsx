"use client";

import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "next-intl";

interface PageHeaderProps {
  showBack?: boolean;
  showLang?: boolean;
  title?: string;
}

export function PageHeader({
  showBack = true,
  showLang = true,
  title,
}: PageHeaderProps) {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href="/"
              className="text-sm text-primary font-medium tap-target flex items-center"
            >
              <span className="rtl-flip">←</span>
              <span className="ms-1">{t("back")}</span>
            </Link>
          )}
          {title && (
            <Link href="/">
              <h1 className="text-base font-bold text-slate-900 truncate">
                {title}
              </h1>
            </Link>
          )}
        </div>
        {showLang && <LanguageSwitcher />}
      </div>
    </header>
  );
}
