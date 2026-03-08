"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { getRequest } from "@/lib/firebase/requests";
import { createClaim } from "@/lib/firebase/helpers";
import { getCurrentUser } from "@/lib/firebase/auth";
import { timeAgo, timeAgoAr } from "@/lib/utils/helpers";
import type { HelpRequest } from "@/lib/types";
import { Link } from "@/i18n/navigation";

export default function RequestDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getRequest(requestId);
        setRequest(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestId]);

  const handleClaim = async () => {
    const user = getCurrentUser();
    if (!user || user.isAnonymous) {
      // Need to be a registered helper
      return;
    }

    setClaiming(true);
    try {
      await createClaim(requestId, user.uid, user.displayName || "Helper", {
        message: claimMessage,
      });
      setClaimed(true);
      setShowClaimForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader />
        <main className="max-w-lg mx-auto px-4 py-8">
          {error ? (
            <ErrorState onRetry={() => window.location.reload()} />
          ) : (
            <EmptyState icon="🔍" title={t("errors.notFound")} />
          )}
        </main>
      </div>
    );
  }

  const timeStr =
    locale === "ar"
      ? timeAgoAr(request.createdAt)
      : timeAgo(request.createdAt);

  const categoryIcons: Record<string, string> = {
    medicine: "💊", shelter: "🏠", food: "🍞", baby_milk: "🍼",
    transport: "🚗", clothing: "👕", hygiene: "🧴", other: "📦",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("details.title")} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">
                {categoryIcons[request.category] || "📦"}
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t(`request.categories.${request.category}`)}
                </h2>
                <p className="text-xs text-slate-500">{timeStr}</p>
              </div>
            </div>
            <UrgencyBadge urgency={request.urgency} />
          </div>

          <p className="text-base text-slate-700 leading-relaxed mb-4">
            {request.description}
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500 block text-xs">
                {t("request.governorate")}
              </span>
              <span className="font-medium">
                {t(`request.governorates.${request.governorate}`)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">
                {t("request.city")}
              </span>
              <span className="font-medium">{request.city}</span>
            </div>
            {request.area && (
              <div>
                <span className="text-slate-500 block text-xs">
                  {t("request.area")}
                </span>
                <span className="font-medium">{request.area}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block text-xs">
                {t("request.peopleCount")}
              </span>
              <span className="font-medium">
                {request.peopleCount} {t("browse.people")}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
            <StatusBadge status={request.status} />
            <span className="text-xs text-slate-400">
              {t("details.referenceCode")}: {request.referenceCode}
            </span>
          </div>
        </Card>

        {/* Contact info notice */}
        <Card className="bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-800">
            🔒 {t("details.contactHidden")}
          </p>
        </Card>

        {/* Claim section */}
        {claimed ? (
          <Card className="bg-green-50 border-green-200 text-center">
            <span className="text-2xl block mb-1">🎉</span>
            <p className="text-sm font-medium text-green-800">
              {t("details.claimSuccess")}
            </p>
          </Card>
        ) : request.status === "in_progress" ? (
          <Card className="bg-slate-50">
            <p className="text-sm text-slate-600 text-center">
              {t("details.alreadyClaimed")}
            </p>
          </Card>
        ) : request.status === "open" ? (
          <div className="space-y-3">
            {!showClaimForm ? (
              <Button
                variant="primary"
                size="xl"
                onClick={() => {
                  const user = getCurrentUser();
                  if (!user || user.isAnonymous) {
                    // Redirect to register
                    setShowClaimForm(false);
                  } else {
                    setShowClaimForm(true);
                  }
                }}
              >
                {t("details.iCanHelp")}
              </Button>
            ) : (
              <Card>
                <Textarea
                  label={t("details.claimMessage")}
                  placeholder={t("details.claimMessagePlaceholder")}
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                />
                <div className="flex gap-3 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowClaimForm(false)}
                    className="flex-1"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="primary"
                    loading={claiming}
                    onClick={handleClaim}
                    className="flex-1"
                  >
                    {t("details.claimSubmit")}
                  </Button>
                </div>
              </Card>
            )}

            {/* Sign-in prompt for non-helpers */}
            <p className="text-center text-xs text-slate-500">
              {t("details.loginToHelp")}{" "}
              <Link
                href="/register"
                className="text-primary font-medium underline"
              >
                {t("helper.register")}
              </Link>
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
