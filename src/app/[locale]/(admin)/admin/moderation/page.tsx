"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getAdminRequests,
  updateRequestStatus,
  flagRequest,
  getRequestContactInfo,
} from "@/lib/firebase/requests";
import { getAdminHelpers, setHelperVerified } from "@/lib/firebase/helpers";
import { signOut, onAuthChange, checkIsAdmin, getCurrentUser } from "@/lib/firebase/auth";
import { timeAgo } from "@/lib/utils/helpers";
import type {
  HelpRequest,
  Helper,
  RequestFilters,
  RequestStatus,
  ModerationFlag,
  RequestContactInfo,
} from "@/lib/types";
import type { DocumentSnapshot } from "firebase/firestore";

const STATUSES: RequestStatus[] = ["pending_review", "open", "in_progress", "fulfilled", "archived", "flagged"];
const FLAGS: ModerationFlag[] = ["spam", "inappropriate", "duplicate", "suspicious"];

export default function ModerationPage() {
  const t = useTranslations();
  const router = useRouter();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "">("");
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [contactInfo, setContactInfo] = useState<Record<string, RequestContactInfo>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"requests" | "helpers">("requests");
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [helpersLoading, setHelpersLoading] = useState(false);

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
    });
    return () => unsubscribe();
  }, [router]);

  const fetchRequests = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const filters: RequestFilters = {};
        if (filterStatus) filters.status = filterStatus;

        const result = await getAdminRequests(
          filters,
          30,
          reset ? undefined : lastDoc || undefined
        );
        if (reset) {
          setRequests(result.requests);
        } else {
          setRequests((prev) => [...prev, ...result.requests]);
        }
        setLastDoc(result.lastDoc);
        setHasMore(result.requests.length === 30);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, lastDoc]
  );

  useEffect(() => {
    if (authorized) {
      fetchRequests(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, filterStatus]);

  const handleStatusChange = async (reqId: string, status: RequestStatus) => {
    const user = getCurrentUser();
    if (!user) return;
    await updateRequestStatus(reqId, status, user.uid);
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status, updatedAt: Date.now() } : r))
    );
  };

  const handleFlag = async (reqId: string, flag: ModerationFlag) => {
    const user = getCurrentUser();
    if (!user) return;
    await flagRequest(reqId, flag, user.uid);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              moderationFlags: r.moderationFlags.includes(flag)
                ? r.moderationFlags
                : [...r.moderationFlags, flag],
            }
          : r
      )
    );
  };

  const loadContactInfo = async (reqId: string) => {
    if (contactInfo[reqId]) {
      setExpandedId(expandedId === reqId ? null : reqId);
      return;
    }
    const info = await getRequestContactInfo(reqId);
    setContactInfo((prev) => ({ ...prev, [reqId]: info || {} }));
    setExpandedId(reqId);
  };

  const fetchHelpers = async () => {
    setHelpersLoading(true);
    try {
      const data = await getAdminHelpers();
      setHelpers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHelpersLoading(false);
    }
  };

  const handleVerifyToggle = async (helperId: string, currentVerified: boolean) => {
    const user = getCurrentUser();
    if (!user) return;
    await setHelperVerified(helperId, !currentVerified, user.uid);
    setHelpers((prev) =>
      prev.map((h) => (h.id === helperId ? { ...h, verified: !currentVerified } : h))
    );
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const exportCsv = () => {
    const headers = [
      "ID", "Category", "Description", "Governorate", "City",
      "People", "Urgency", "Status", "Contact Method", "Created",
      "Reference Code", "Flags",
    ];
    const rows = requests.map((r) => [
      r.id,
      r.category,
      `"${r.description.replace(/"/g, '""')}"`,
      r.governorate,
      r.city,
      r.peopleCount,
      r.urgency,
      r.status,
      r.contactMethod,
      new Date(r.createdAt).toISOString(),
      r.referenceCode,
      r.moderationFlags.join(";"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="max-w-4xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-sm text-white/90 hover:text-white">
              {t("admin.dashboard")}
            </Link>
            <h1 className="text-base font-bold">{t("admin.moderation")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportCsv} className="text-white hover:bg-white/20">
              {t("admin.exportCsv")}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:bg-white/20">
              {t("admin.signOut")}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("admin.moderation")}
          </button>
          <button
            onClick={() => {
              setActiveTab("helpers");
              if (helpers.length === 0) fetchHelpers();
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "helpers"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("admin.helpers")}
          </button>
        </div>

        {activeTab === "requests" && (
        <>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setFilterStatus("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === ""
                ? "bg-primary text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {t("admin.all")}
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? "bg-primary text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {t(`admin.statuses.${s}`)}
            </button>
          ))}
        </div>

        {/* Request list */}
        {loading && requests.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState icon="📋" title={t("empty.noRequests")} description={t("empty.noRequestsDesc")} />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id} className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {t(`request.categories.${req.category}`)}
                      </h3>
                      <UrgencyBadge urgency={req.urgency} />
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {req.referenceCode} · {timeAgo(req.createdAt)} ·{" "}
                      {t(`request.governorates.${req.governorate}`)} — {req.city}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-700">{req.description}</p>

                {/* Flags */}
                {req.moderationFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {req.moderationFlags.map((flag) => (
                      <span
                        key={flag}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"
                      >
                        {t(`admin.flags.${flag}`)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact info (expandable) */}
                {expandedId === req.id && contactInfo[req.id] && (
                  <div className="bg-blue-50 rounded-lg p-3 text-sm break-words">
                    <p className="font-medium text-blue-800 mb-1">
                      {t("details.contactInfo")}
                    </p>
                    {contactInfo[req.id].name && (
                      <p>{t("admin.contactName", { name: contactInfo[req.id].name as string })}</p>
                    )}
                    {contactInfo[req.id].phone && (
                      <p dir="ltr" className="text-start">
                        {t("admin.contactPhone", { phone: `${contactInfo[req.id].phoneCountryCode} ${contactInfo[req.id].phone}` })}
                      </p>
                    )}
                    {!contactInfo[req.id].phone && !contactInfo[req.id].name && (
                      <p className="text-slate-500">{t("admin.noContactInfo")}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadContactInfo(req.id)}
                  >
                    {t("admin.viewContact")}
                  </Button>

                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleStatusChange(req.id, e.target.value as RequestStatus);
                      }
                    }}
                    className="text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-white min-h-[44px] tap-target focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                  >
                    <option value="">{t("admin.changeStatus")}</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`admin.statuses.${s}`)}
                      </option>
                    ))}
                  </select>

                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFlag(req.id, e.target.value as ModerationFlag);
                      }
                    }}
                    className="text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-white min-h-[44px] tap-target focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                  >
                    <option value="">{t("admin.flagAs")}</option>
                    {FLAGS.map((f) => (
                      <option key={f} value={f}>
                        {t(`admin.flags.${f}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>
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
        </>
        )}

        {/* Helpers tab */}
        {activeTab === "helpers" && (
          <div className="space-y-3">
            {helpersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  </div>
                ))}
              </div>
            ) : helpers.length === 0 ? (
              <EmptyState icon="👥" title={t("admin.noHelpers")} />
            ) : (
              helpers.map((helper) => (
                <Card key={helper.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{helper.name}</h3>
                      {helper.verified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {t("admin.verified")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {helper.email} · {helper.governorate ? t(`request.governorates.${helper.governorate}`) : "—"}
                      {helper.organization ? ` · ${helper.organization}` : ""}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t("admin.deliveries", { count: helper.completedDeliveries || 0 })}
                    </p>
                  </div>
                  <Button
                    variant={helper.verified ? "outline" : "primary"}
                    size="sm"
                    onClick={() => handleVerifyToggle(helper.id, helper.verified)}
                  >
                    {helper.verified ? t("admin.unverifyHelper") : t("admin.verifyHelper")}
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
