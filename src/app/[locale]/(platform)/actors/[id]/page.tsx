"use client";

import { useState, useEffect, use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  MapPin,
  Phone,
  Mail,
  Lock,
  Heart,
  HandHelping,
  X,
  ChevronDown,
  ChevronUp,
  Activity,
} from "lucide-react";
import { getActor, getCapacityCard, getVouchesForActor } from "@/lib/data/platform-api";
import { ZONES, SECTORS_META, getSectorColor, getZoneName } from "@/lib/data/zones";
import type { Actor, CapacityCard, Vouch, StockLevel } from "@/lib/types/platform";

const DAY = 86400000;

const STOCK_COLORS: Record<StockLevel, { bg: string; text: string; label: string }> = {
  good: { bg: "bg-green-100", text: "text-green-800", label: "Good" },
  some: { bg: "bg-amber-100", text: "text-amber-800", label: "Some" },
  low: { bg: "bg-red-100", text: "text-red-800", label: "Low" },
};

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function freshnessIndicator(timestamp: number): {
  color: string;
  dotClass: string;
  label: string;
} {
  const diff = Date.now() - timestamp;
  const days = diff / DAY;
  if (days < 7) return { color: "text-green-600", dotClass: "bg-green-500", label: "Fresh" };
  if (days < 14) return { color: "text-amber-600", dotClass: "bg-amber-500", label: "Aging" };
  return { color: "text-slate-400", dotClass: "bg-slate-400", label: "Stale" };
}

const VERIFICATION_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }
> = {
  verified: {
    label: "Verified",
    color: "text-green-800",
    bgColor: "bg-green-100",
    icon: CheckCircle2,
  },
  provisional: {
    label: "Provisional",
    color: "text-amber-800",
    bgColor: "bg-amber-100",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    icon: AlertCircle,
  },
  suspended: {
    label: "Suspended",
    color: "text-red-800",
    bgColor: "bg-red-100",
    icon: AlertCircle,
  },
};

const ACTOR_TYPE_LABELS: Record<string, string> = {
  ngo: "NGO",
  municipality: "Municipality",
  grassroots: "Grassroots",
  shelter_org: "Shelter Org",
};

export default function ActorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations("platform");

  const [actor, setActor] = useState<Actor | null>(null);
  const [capacity, setCapacity] = useState<CapacityCard | null>(null);
  const [vouches, setVouches] = useState<Vouch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVouchModal, setShowVouchModal] = useState(false);
  const [showCapacity, setShowCapacity] = useState(true);
  const [vouchAnswers, setVouchAnswers] = useState({
    observedInField: false,
    coverageAccurate: false,
    willingToAssociate: false,
  });

  useEffect(() => {
    Promise.all([getActor(id), getCapacityCard(id), getVouchesForActor(id)])
      .then(([a, c, v]) => {
        setActor(a);
        setCapacity(c);
        setVouches(v);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 bg-primary text-white">
          <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center">
            <div className="h-5 bg-white/20 rounded w-32 animate-pulse" />
          </div>
        </header>
        <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse"
            >
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-full mb-2" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-40 bg-primary text-white">
          <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center">
            <Link href="/actors" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              {t("actors.backToRegistry")}
            </Link>
          </div>
        </header>
        <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-medium text-slate-700">{t("actors.actorNotFound")}</p>
          <p className="text-sm text-slate-500 mt-1">
            {t("actors.actorNotFoundHint")}
          </p>
        </main>
      </div>
    );
  }

  const verification = VERIFICATION_CONFIG[actor.verificationStatus];
  const VerifIcon = verification.icon;
  const freshness = freshnessIndicator(actor.lastUpdated);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-white">
        <div className="max-w-lg mx-auto md:max-w-4xl px-4 h-14 flex items-center justify-between">
          <Link href="/actors" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            {t("actors.registry")}
          </Link>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${freshness.dotClass}`} />
            <span className="text-xs text-white/70">{relativeTime(actor.lastUpdated)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto md:max-w-4xl px-4 py-4 space-y-4">
        {/* Profile header card */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {locale === "ar" && actor.nameAr ? actor.nameAr : actor.name}
              </h1>
            </div>
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${verification.bgColor} ${verification.color}`}
            >
              <VerifIcon className="w-3.5 h-3.5" />
              {t(`verification.${actor.verificationStatus}`)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {t(`actorTypes.${actor.type}`)}
            </span>
            {actor.verificationStatus === "verified" && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5" />
                {t("actors.vouches", { count: actor.vouchCount })}
              </span>
            )}
          </div>

          {/* Freshness indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${freshness.dotClass}`} />
            <span className={freshness.color}>
              {t("actors.updated", { time: relativeTime(actor.lastUpdated) })} &mdash; {t(`actors.${freshness.label.toLowerCase()}`)}
            </span>
          </div>
        </div>

        {/* About section */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">{t("actors.about")}</h2>

          {/* Sectors */}
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-1.5">{t("actors.sectors")}</p>
            <div className="flex flex-wrap gap-2">
              {actor.sectors.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getSectorColor(s) }}
                  />
                  {(() => { const meta = SECTORS_META.find((m) => m.id === s); return meta ? (locale === "ar" ? meta.nameAr : meta.nameEn) : s; })()}
                </span>
              ))}
            </div>
          </div>

          {/* Zones */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">{t("actors.operationalZones")}</p>
            <div className="flex flex-wrap gap-2">
              {actor.operationalZones.map((z) => (
                <span
                  key={z}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700"
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {getZoneName(z, locale)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Capacity Card section */}
        {capacity && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowCapacity(!showCapacity)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-bold text-slate-900">{t("actors.liveCapacity")}</h2>
                <span className="text-xs text-slate-400">
                  {relativeTime(capacity.lastUpdated)}
                </span>
              </div>
              {showCapacity ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {showCapacity && (
              <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                {/* Active services */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">{t("actors.services")}</p>
                  <div className="space-y-1.5">
                    {capacity.services.map((svc) => (
                      <div key={svc.serviceId} className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            svc.active ? "bg-success" : "bg-slate-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            svc.active ? "text-slate-800" : "text-slate-400 line-through"
                          }`}
                        >
                          {svc.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                {capacity.resources.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">{t("actors.resources")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {capacity.resources.map((r) => (
                        <div
                          key={r.resourceId}
                          className="bg-slate-50 rounded-xl px-3 py-2"
                        >
                          <p className="text-xs text-slate-500">{r.label}</p>
                          <p className="text-lg font-bold text-slate-900">{r.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock levels */}
                {Object.keys(capacity.stockLevels).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                      {t("actors.stockLevels")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(capacity.stockLevels).map(([item, level]) => {
                        const config = STOCK_COLORS[level];
                        return (
                          <span
                            key={item}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                          >
                            {item.replace(/_/g, " ")}:&nbsp;{t(`stockLevels.${level}`)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Urgent needs */}
                {capacity.urgentNeeds.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-2">{t("actors.urgentNeeds")}</p>
                    <div className="flex flex-wrap gap-2">
                      {capacity.urgentNeeds.map((need) => (
                        <span
                          key={need}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          {need.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {capacity.note && (
                  <p className="text-sm text-slate-600 italic border-s-2 border-accent ps-3">
                    {capacity.note}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vouch Chain */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            {t("actors.vouchChain")}
          </h2>
          {vouches.length > 0 ? (
            <div className="space-y-2">
              {vouches.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {v.voucherName}
                    </p>
                    <div className="flex gap-2 text-xs text-slate-500">
                      {v.observedInField && <span>{t("actors.observedInField")}</span>}
                      {v.coverageAccurate && <span>{t("actors.coverageVerified")}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ms-auto">
                    {relativeTime(v.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              {t("actors.noVouches")}
            </p>
          )}
        </div>

        {/* Contact section */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">{t("actors.contact")}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">{actor.contactName}</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm text-slate-500">{t("actors.phoneEmail")}</p>
                <p className="text-xs text-slate-400">{t("actors.visibleToVerifiedPeers")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowVouchModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Heart className="w-4 h-4" />
            {t("actors.vouchFor")}
          </button>
          {capacity && capacity.urgentNeeds.length > 0 && (
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
              <HandHelping className="w-4 h-4" />
              {t("actors.iCanHelp")}
            </button>
          )}
        </div>

        {/* Vouch modal */}
        {showVouchModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
            <div className="bg-white rounded-t-2xl sm:rounded-lg w-full max-w-lg mx-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {t("actors.vouchModalTitle", { name: actor.name })}
                </h3>
                <button
                  onClick={() => setShowVouchModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                {t("actors.vouchModalDescription")}
              </p>

              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vouchAnswers.observedInField}
                    onChange={(e) =>
                      setVouchAnswers((p) => ({
                        ...p,
                        observedInField: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {t("actors.observedQuestion")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t("actors.observedHint")}
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vouchAnswers.coverageAccurate}
                    onChange={(e) =>
                      setVouchAnswers((p) => ({
                        ...p,
                        coverageAccurate: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {t("actors.coverageQuestion")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t("actors.coverageHint")}
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vouchAnswers.willingToAssociate}
                    onChange={(e) =>
                      setVouchAnswers((p) => ({
                        ...p,
                        willingToAssociate: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {t("actors.associateQuestion")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t("actors.associateHint")}
                    </p>
                  </div>
                </label>
              </div>

              <button
                disabled={
                  !vouchAnswers.observedInField ||
                  !vouchAnswers.coverageAccurate ||
                  !vouchAnswers.willingToAssociate
                }
                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                {t("actors.submitVouch")}
              </button>
              <p className="text-xs text-slate-400 text-center mt-2">
                {t("actors.confirmAllQuestions")}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
