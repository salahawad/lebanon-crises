"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { RequestCard } from "@/components/shared/request-card";
import { ClusterCard } from "@/components/shared/cluster-card";
import { FilterSheet } from "@/components/shared/filter-sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { getRequests } from "@/lib/firebase/requests";
import { getHelper, getClaimsByHelper } from "@/lib/firebase/helpers";
import { getCurrentUser } from "@/lib/firebase/auth";
import {
  rankRequestsForHelper,
  sortByPriority,
  clusterRequests,
  isHelperAtCapacity,
  getActiveClaimCount,
} from "@/lib/utils/matching";
import type { HelpRequest, Helper, Claim, RequestFilters, ScoredRequest, Governorate } from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";

type SortMode = "newest" | "priority";
type ViewMode = "list" | "clustered";

export default function BrowsePage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState<RequestFilters>(() => {
    const gov = searchParams.get("governorate");
    return gov ? { governorate: gov as Governorate } : {};
  });
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Matching state
  const [helper, setHelper] = useState<Helper | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [recommended, setRecommended] = useState<ScoredRequest[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Sync filters from URL query params
  useEffect(() => {
    const gov = searchParams.get("governorate");
    if (gov && gov !== filters.governorate) {
      setFilters((prev) => ({ ...prev, governorate: gov as Governorate }));
      setLastDoc(null);
      setHasMore(true);
    }
  }, [searchParams]);

  // Load helper profile for matching
  useEffect(() => {
    const user = getCurrentUser();
    if (user && !user.isAnonymous) {
      Promise.all([getHelper(user.uid), getClaimsByHelper(user.uid)])
        .then(([h, c]) => {
          if (h) setHelper(h);
          setClaims(c);
        })
        .catch(() => {});
    }
  }, []);

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
          setRequests((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const newRequests = result.requests.filter((r) => !existingIds.has(r.id));
            return [...prev, ...newRequests];
          });
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

  // Compute recommendations when requests or helper changes
  useEffect(() => {
    if (helper && requests.length > 0) {
      const scored = rankRequestsForHelper(requests, helper, claims);
      setRecommended(scored.slice(0, 5));
    } else {
      setRecommended([]);
    }
  }, [requests, helper, claims]);

  const handleFilterChange = (newFilters: RequestFilters) => {
    setFilters(newFilters);
    setLastDoc(null);
    setHasMore(true);
  };

  const hasActiveFilters = !!(filters.governorate || filters.category || filters.urgency || filters.status);

  const clearFilters = () => {
    setFilters({});
    setLastDoc(null);
    setHasMore(true);
  };

  const atCapacity = helper ? isHelperAtCapacity(claims) : false;
  const activeCount = getActiveClaimCount(claims);

  // Apply sort
  const sortedRequests =
    sortMode === "priority" ? sortByPriority(requests) : requests;

  // Clusters for grouped view
  const clusters = viewMode === "clustered" ? clusterRequests(sortedRequests) : [];
  // Unclustered requests (those not in any cluster)
  const clusteredIds = new Set(clusters.flatMap((c) => c.requests.map((r) => r.id)));
  const unclusteredRequests = sortedRequests.filter((r) => !clusteredIds.has(r.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title={t("browse.title")} />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Subtitle and filter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">{t("browse.subtitle")}</p>
          <FilterSheet filters={filters} onApply={handleFilterChange} />
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {filters.governorate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {t(`request.governorates.${filters.governorate}`)}
                <button
                  onClick={() => handleFilterChange({ ...filters, governorate: undefined })}
                  className="hover:text-primary-dark ml-0.5 text-base leading-none"
                  aria-label="Remove"
                >
                  &times;
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {t(`request.categories.${filters.category}`)}
                <button
                  onClick={() => handleFilterChange({ ...filters, category: undefined })}
                  className="hover:text-primary-dark ml-0.5 text-base leading-none"
                  aria-label="Remove"
                >
                  &times;
                </button>
              </span>
            )}
            {filters.urgency && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {t(`request.urgency.${filters.urgency}`)}
                <button
                  onClick={() => handleFilterChange({ ...filters, urgency: undefined })}
                  className="hover:text-primary-dark ml-0.5 text-base leading-none"
                  aria-label="Remove"
                >
                  &times;
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              {t("browse.clearFilters")}
            </button>
          </div>
        )}

        {/* Sort & View toggles */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            <button
              onClick={() => setSortMode("newest")}
              className={`px-3.5 py-2 ${sortMode === "newest" ? "bg-primary text-white" : "bg-white text-slate-600"}`}
            >
              {t("browse.sortNewest")}
            </button>
            <button
              onClick={() => setSortMode("priority")}
              className={`px-3.5 py-2 ${sortMode === "priority" ? "bg-primary text-white" : "bg-white text-slate-600"}`}
            >
              {t("browse.sortPriority")}
            </button>
          </div>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3.5 py-2 ${viewMode === "list" ? "bg-primary text-white" : "bg-white text-slate-600"}`}
            >
              {t("browse.listView")}
            </button>
            <button
              onClick={() => setViewMode("clustered")}
              className={`px-3.5 py-2 ${viewMode === "clustered" ? "bg-primary text-white" : "bg-white text-slate-600"}`}
            >
              {t("browse.clusteredView")}
            </button>
          </div>
        </div>

        {/* Helper registration CTA */}
        {!helper && (
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
        )}

        {/* Capacity warning */}
        {atCapacity && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-sm font-medium text-amber-800">{t("matching.atCapacity")}</p>
            <p className="text-xs text-amber-700 mt-1">
              {t("matching.atCapacityDesc")}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {t("matching.activeClaims", { count: activeCount })}
            </p>
          </div>
        )}

        {/* Recommended section */}
        {recommended.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-700 mb-2">
              {t("matching.recommendedForYou")}
            </h2>
            <div className="space-y-3">
              {recommended.map((sr) => (
                <RequestCard
                  key={sr.request.id}
                  request={sr.request}
                  matchReasons={sr.matchReasons}
                />
              ))}
            </div>
          </div>
        )}

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
        ) : viewMode === "clustered" ? (
          <div className="space-y-3">
            {clusters.map((cluster) => (
              <ClusterCard key={cluster.key} cluster={cluster} />
            ))}
            {unclusteredRequests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRequests.map((req) => (
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
