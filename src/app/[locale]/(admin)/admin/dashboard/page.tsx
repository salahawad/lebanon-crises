"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestCard } from "@/components/shared/request-card";
import { ErrorState } from "@/components/shared/error-state";
import { getAppStats, getAdminRequests } from "@/lib/firebase/requests";
import { signOut, onAuthChange, checkIsAdmin } from "@/lib/firebase/auth";
import type { HelpRequest, AppStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const [stats, setStats] = useState<AppStats | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        router.push("/admin/login");
        return;
      }
      const isAdmin = await checkIsAdmin(user.uid);
      if (!isAdmin) {
        router.push("/admin/login");
        return;
      }
      setAuthorized(true);

      try {
        const [statsData, requestsData] = await Promise.all([
          getAppStats(),
          getAdminRequests({}, 10),
        ]);
        setStats(statsData as AppStats);
        setRequests(requestsData.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-bold">{t("admin.dashboard")}</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/moderation"
              className="text-sm text-white/90 hover:text-white"
            >
              {t("admin.moderation")}
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:bg-white/20">
              {t("admin.signOut")}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                <div className="h-8 bg-slate-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats grid - single Firestore read for all stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <Card className="text-center">
                <p className="text-xs text-slate-500 mb-1">
                  {t("admin.totalRequests")}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.totalRequests || 0}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-xs text-slate-500 mb-1">
                  {t("admin.openRequests")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.openRequests || 0}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-xs text-slate-500 mb-1">
                  {t("admin.fulfilled")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.fulfilledRequests || 0}
                </p>
              </Card>
              <Card className="text-center">
                <p className="text-xs text-slate-500 mb-1">
                  {t("admin.totalHelpers")}
                </p>
                <p className="text-2xl font-bold text-accent">
                  {stats?.totalHelpers || 0}
                </p>
              </Card>
              <Card className="text-center col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 mb-1">
                  {t("admin.totalClaims")}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.totalClaims || 0}
                </p>
              </Card>
            </div>

            {/* Recent requests */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {t("admin.recentRequests")}
              </h2>
              <Link href="/admin/moderation">
                <Button variant="outline" size="sm">
                  {t("common.viewAll")}
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {requests.map((req) => (
                <RequestCard key={req.id} request={req} adminView />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
