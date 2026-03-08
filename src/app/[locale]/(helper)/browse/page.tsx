"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { RequestCard } from "@/components/shared/request-card";
import { FilterSheet } from "@/components/shared/filter-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { getRequests } from "@/lib/firebase/requests";
import type { HelpRequest, RequestFilters } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";

export default function BrowsePage() {
  const t = useTranslations();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState<RequestFilters>({});
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchRequests = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(false);
        const result = await getRequests(
          filters,
          20,
          reset ? undefined : lastDoc || undefined
        );
        if (reset) {
          setRequests(result.requests);
        } else {
          setRequests((prev) => [...prev, ...result.requests]);
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.requests.length === 20);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [filters, lastDoc]
  );

  useEffect(() => {
    fetchRequests(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters: RequestFilters) => {
    setFilters(newFilters);
    setLastDoc(null);
    setHasMore(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("browse.title")} />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Subtitle and filter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">{t("browse.subtitle")}</p>
          <FilterSheet filters={filters} onApply={handleFilterChange} />
        </div>

        {/* Helper registration CTA */}
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-700">
            {t("helper.subtitle")}
          </span>
          <Link href="/register">
            <Button variant="secondary" size="sm">
              {t("helper.register")}
            </Button>
          </Link>
        </div>

        {/* Request list */}
        {error ? (
          <ErrorState onRetry={() => fetchRequests(true)} />
        ) : loading && requests.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon="📋"
            title={t("browse.noRequests")}
            description={t("browse.noRequestsSubtitle")}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}

            {hasMore && (
              <Button
                variant="outline"
                size="md"
                className="w-full"
                loading={loading}
                onClick={() => fetchRequests(false)}
              >
                {t("common.loadMore")}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
