"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
import { getPlatformUser, onAuthChange } from "@/lib/firebase/auth";
import type { PlatformUser } from "@/lib/types/platform";

const NAV_ITEMS = [
  { href: "/platform", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/map", label: "Map", labelAr: "خريطة", icon: Map },
  { href: "/needs", label: "Needs", labelAr: "احتياجات", icon: AlertCircle },
  { href: "/actors", label: "Actors", labelAr: "الجهات", icon: Users },
  { href: "/more", label: "More", labelAr: "المزيد", icon: MoreHorizontal },
];

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);

  // Extract locale from pathname (e.g., /en/platform -> en)
  const locale = pathname.split("/")[1] || "en";

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
              href={`/${locale}`}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight truncate">
              Shabaka <span className="font-normal opacity-80">·</span>{" "}
              <span className="font-semibold">شبكة</span>
            </h1>
          </div>
          <Link
            href={`/${locale}${platformUser ? "/platform/me" : "/platform/login"}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15 transition-colors shrink-0"
          >
            {platformUser ? (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Org</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-6">
        <div className="max-w-lg mx-auto md:max-w-5xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 md:hidden">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors tap-target ${
                  active
                    ? "text-[#1e3a5f]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar nav (shown on md+) */}
      <nav className="hidden md:block fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 h-14 px-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#1e3a5f] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                <span className="text-xs opacity-70">{item.labelAr}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
