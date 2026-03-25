"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  AlertCircle,
  Users,
  MoreHorizontal,
  ArrowLeft,
  LogIn,
  Building2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPlatformUser, onAuthChange } from "@/lib/firebase/auth";
import type { PlatformUser } from "@/lib/types/platform";

type NavItemKey = "dashboard" | "map" | "needs" | "actors" | "more";

const NAV_ITEMS: Array<{ href: string; key: NavItemKey; icon: typeof LayoutDashboard }> = [
  { href: "/platform", key: "dashboard", icon: LayoutDashboard },
  { href: "/map", key: "map", icon: Map },
  { href: "/needs", key: "needs", icon: AlertCircle },
  { href: "/actors", key: "actors", icon: Users },
  { href: "/more", key: "more", icon: MoreHorizontal },
];

const copyByLocale = {
  en: {
    back: "Back",
    accountSignIn: "Sign In",
    accountWorkspace: "My Org",
    nav: {
      dashboard: "Dashboard",
      map: "Map",
      needs: "Needs",
      actors: "Actors",
      more: "More",
    },
  },
  ar: {
    back: "رجوع",
    accountSignIn: "تسجيل الدخول",
    accountWorkspace: "منظمتي",
    nav: {
      dashboard: "لوحة التحكم",
      map: "الخريطة",
      needs: "الاحتياجات",
      actors: "الجهات",
      more: "المزيد",
    },
  },
} as const;

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const locale = useLocale() === "ar" ? "ar" : "en";
  const copy = copyByLocale[locale];
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);

  useEffect(() => {
    return onAuthChange((user) => {
      if (!user) {
        setPlatformUser(null);
        return;
      }

      getPlatformUser(user.uid)
        .then((profile) => setPlatformUser(profile))
        .catch(() => setPlatformUser(null));
    });
  }, []);

  function isActive(href: string): boolean {
    const fullPath = `/${locale}${href}`;
    if (href === "/platform") {
      return pathname === fullPath || pathname === fullPath + "/";
    }
    return pathname.startsWith(fullPath);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white sticky top-0 z-40">
        <div className="max-w-lg mx-auto md:max-w-5xl px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={copy.back}
            >
              <ArrowLeft className="w-5 h-5 rtl:-scale-x-100" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight truncate">
              Shabaka <span className="font-normal opacity-80">·</span>{" "}
              <span className="font-semibold">شبكة</span>
            </h1>
          </div>
          <Link
            href={platformUser ? "/platform/me" : "/platform/login"}
            data-testid="platform-header-account-link"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15 transition-colors shrink-0"
          >
            {platformUser ? (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{copy.accountWorkspace}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{copy.accountSignIn}</span>
              </>
            )}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-32 md:pb-20">
        <div className="max-w-lg mx-auto md:max-w-5xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-11 inset-x-0 bg-white border-t border-slate-200 z-40 md:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors tap-target ${
                  active
                    ? "text-[#1e3a5f]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`}
                />
                <span className="text-[10px] font-medium">{copy.nav[item.key]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar nav (shown on md+) */}
      <nav className="hidden md:block fixed bottom-11 inset-x-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 h-14 px-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#1e3a5f] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{copy.nav[item.key]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
