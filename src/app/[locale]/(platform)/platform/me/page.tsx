"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  Bell,
  Building2,
  Clock3,
  Layers3,
  LogOut,
  MapPin,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { getActor, getCapacityCard } from "@/lib/data/platform-api";
import { getZoneName, getSectorName } from "@/lib/data/zones";
import { getPlatformUser, onAuthChange, signOut } from "@/lib/firebase/auth";
import { createLogger } from "@/lib/logger";
import type { Actor, CapacityCard, PlatformUser } from "@/lib/types/platform";
import {
  formatPlatformDate,
  getActorTypeLabel,
  getNotificationChannelLabel,
  getVerificationStatusLabel,
  isRtlPlatformLocale,
} from "@/lib/utils/platform-user-display";

const log = createLogger("page:platform-me");

const copyByLocale = {
  en: {
    myOrganization: "My Organization",
    signedOutBody:
      "Sign in with a Shabaka organization or platform-admin account to open this workspace.",
    goToSignIn: "Go to Shabaka Sign In",
    platformAdminWorkspace: "Platform Admin Workspace",
    signOut: "Sign Out",
    reviewIntakeQueue: "Review Intake Queue",
    reviewIntakeQueueBody:
      "Open pending organization submissions and review what needs follow-up.",
    openReviewQueue: "Open Review Queue",
    publicPlatformView: "Public Platform View",
    publicPlatformViewBody:
      "Jump back to the public dashboard, actors map, and shared coordination pages.",
    openDashboard: "Open Dashboard",
    zones: "Zones",
    sectors: "Sectors",
    contact: "Contact",
    freshness: "Freshness",
    notifications: "Notifications",
    workspaceShortcuts: "Workspace Shortcuts",
    editCapacityCard: "Edit Capacity Card",
    privacySettings: "Privacy & Settings",
    publicActorProfile: "Public Actor Profile",
    capacitySnapshot: "Capacity Snapshot",
    activeServices: "Active services",
    trackedResources: "Tracked resources",
    urgentNeeds: "Urgent needs",
    noCapacityCard: "No capacity card is linked yet for this actor.",
    actorMappingMissing: "Actor mapping missing",
    actorMappingMissingBody:
      "This Shabaka account is signed in, but it is not mapped to an actor record yet.",
    openIntakeForm: "Open Intake Form",
    loadErrorTitle: "Unable to load workspace",
    loadErrorBody: "Try again in a moment or sign out and back in.",
  },
  ar: {
    myOrganization: "منظمتي",
    signedOutBody:
      "سجّل الدخول بحساب منظمة على شبكة أو بحساب مدير المنصة لفتح هذه المساحة.",
    goToSignIn: "الانتقال إلى تسجيل الدخول",
    platformAdminWorkspace: "مساحة مدير المنصة",
    signOut: "تسجيل الخروج",
    reviewIntakeQueue: "مراجعة طلبات الانضمام",
    reviewIntakeQueueBody:
      "افتح طلبات المنظمات المعلّقة وراجع ما يحتاج إلى متابعة.",
    openReviewQueue: "فتح طابور المراجعة",
    publicPlatformView: "واجهة المنصة العامة",
    publicPlatformViewBody:
      "العودة إلى اللوحة العامة وخريطة الجهات وصفحات التنسيق المشتركة.",
    openDashboard: "فتح اللوحة العامة",
    zones: "المناطق",
    sectors: "القطاعات",
    contact: "التواصل",
    freshness: "تحديث البيانات",
    notifications: "الإشعارات",
    workspaceShortcuts: "اختصارات المساحة",
    editCapacityCard: "تعديل بطاقة القدرة",
    privacySettings: "الخصوصية والإعدادات",
    publicActorProfile: "الملف العام للجهة",
    capacitySnapshot: "ملخص القدرة",
    activeServices: "الخدمات النشطة",
    trackedResources: "الموارد المتابعة",
    urgentNeeds: "الاحتياجات العاجلة",
    noCapacityCard: "لا توجد بطاقة قدرة مرتبطة بهذه الجهة حتى الآن.",
    actorMappingMissing: "لا يوجد ربط مع جهة",
    actorMappingMissingBody:
      "هذا الحساب مسجّل الدخول، لكنه غير مربوط بعد بسجل جهة داخل شبكة.",
    openIntakeForm: "فتح استمارة التسجيل",
    loadErrorTitle: "تعذر تحميل المساحة",
    loadErrorBody: "حاول مرة أخرى بعد قليل أو سجّل الخروج ثم ادخل من جديد.",
  },
} as const;

function verificationTone(status: Actor["verificationStatus"]) {
  switch (status) {
    case "verified":
      return "border-green-200 bg-green-50 text-green-700";
    case "provisional":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pending":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-red-200 bg-red-50 text-red-700";
  }
}

export default function PlatformMePage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = isRtlPlatformLocale(locale);
  const copy = isArabic ? copyByLocale.ar : copyByLocale.en;
  const [loading, setLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);
  const [actor, setActor] = useState<Actor | null>(null);
  const [capacityCard, setCapacityCard] = useState<CapacityCard | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthChange((user) => {
      if (!active) return;

      if (!user) {
        setPlatformUser(null);
        setActor(null);
        setCapacityCard(null);
        setHasLoadError(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasLoadError(false);

      void (async () => {
        try {
          const profile = await getPlatformUser(user.uid);
          if (!active) return;

          setPlatformUser(profile);

          if (!profile) {
            log.warn("authenticated user missing platform profile", undefined, {
              operation: "loadPlatformWorkspace",
              uid: user.uid,
            });
            setActor(null);
            setCapacityCard(null);
            return;
          }

          if (!profile.actorId) {
            setActor(null);
            setCapacityCard(null);
            return;
          }

          const [actorRecord, capacity] = await Promise.all([
            getActor(profile.actorId),
            getCapacityCard(profile.actorId),
          ]);

          if (!active) return;

          setActor(actorRecord);
          setCapacityCard(capacity);

          if (!actorRecord) {
            log.warn("platform actor mapping missing target record", undefined, {
              operation: "loadPlatformWorkspace",
              uid: user.uid,
              actorId: profile.actorId,
            });
          }
        } catch (error) {
          if (!active) return;
          setPlatformUser(null);
          setActor(null);
          setCapacityCard(null);
          setHasLoadError(true);
          log.error("failed to load platform workspace", error, {
            operation: "loadPlatformWorkspace",
          });
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    log.info("platform workspace sign-out", {
      operation: "platformWorkspaceSignOut",
      role: platformUser?.role,
    });
    await signOut();
    router.push("/platform/login");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (hasLoadError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-red-900">{copy.loadErrorTitle}</h2>
        <p className="mt-2 text-sm text-red-800">{copy.loadErrorBody}</p>
      </div>
    );
  }

  if (!platformUser) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2
          className="text-xl font-bold text-slate-900"
          data-testid="platform-me-heading"
        >
          {copy.myOrganization}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{copy.signedOutBody}</p>
        <Link
          href="/platform/login"
          data-testid="platform-me-sign-in-cta"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2d5a8e]"
        >
          <UserCircle2 className="h-4 w-4" />
          {copy.goToSignIn}
        </Link>
      </div>
    );
  }

  if (platformUser.role === "platform_admin") {
    return (
      <div className="space-y-4" data-testid="platform-me-admin-workspace">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-xl font-bold text-slate-900"
                data-testid="platform-me-heading"
              >
                {copy.platformAdminWorkspace}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{platformUser.displayName}</p>
              <p className="break-all text-sm text-slate-400" dir="ltr">
                {platformUser.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              {copy.signOut}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-5 w-5 text-[#1e3a5f]" />
              <h3 className="font-semibold">{copy.reviewIntakeQueue}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-500">{copy.reviewIntakeQueueBody}</p>
            <Link
              href="/platform/review"
              data-testid="platform-admin-review-link"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {copy.openReviewQueue}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900">
              <Building2 className="h-5 w-5 text-[#e8913a]" />
              <h3 className="font-semibold">{copy.publicPlatformView}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-500">{copy.publicPlatformViewBody}</p>
            <Link
              href="/platform"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {copy.openDashboard}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const actorPrimaryName =
    isArabic && actor?.nameAr ? actor.nameAr : actor?.name ?? platformUser.actorName ?? "";
  const actorSecondaryName =
    actor && isArabic ? actor.name : actor?.nameAr;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              className="text-xl font-bold text-slate-900"
              data-testid="platform-me-heading"
            >
              {copy.myOrganization}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{platformUser.displayName}</p>
            <p className="break-all text-sm text-slate-400" dir="ltr">
              {platformUser.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            {copy.signOut}
          </button>
        </div>
      </div>

      {actor ? (
        <>
          <div
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            data-testid="platform-me-actor-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className="text-lg font-bold text-slate-900"
                    dir={isArabic && actor.nameAr ? "rtl" : undefined}
                  >
                    {actorPrimaryName}
                  </h3>
                  <span
                    data-testid="platform-me-verification"
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${verificationTone(
                      actor.verificationStatus
                    )}`}
                  >
                    {getVerificationStatusLabel(actor.verificationStatus, locale)}
                  </span>
                </div>
                {actorSecondaryName ? (
                  <p
                    className="mt-1 text-sm text-slate-500"
                    dir={isArabic ? "ltr" : "rtl"}
                  >
                    {actorSecondaryName}
                  </p>
                ) : null}
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {getActorTypeLabel(actor.type, locale)}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin className="h-4 w-4 text-[#1e3a5f]" />
                  {copy.zones}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {actor.operationalZones.map((zoneId) => (
                    <span
                      key={zoneId}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                    >
                      {getZoneName(zoneId, locale)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Layers3 className="h-4 w-4 text-[#e8913a]" />
                  {copy.sectors}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {actor.sectors.map((sector) => (
                    <span
                      key={sector}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                    >
                      {getSectorName(sector, locale)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {copy.contact}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{actor.contactName}</p>
                <p className="text-sm text-slate-500" dir="ltr">
                  {actor.contactPhone}
                </p>
                {actor.contactEmail ? (
                  <p className="break-all text-sm text-slate-500" dir="ltr">
                    {actor.contactEmail}
                  </p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {copy.freshness}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  {formatPlatformDate(actor.lastUpdated, locale)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {copy.notifications}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Bell className="h-4 w-4 text-slate-400" />
                  {getNotificationChannelLabel(actor.notificationPreference, locale)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                {copy.workspaceShortcuts}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/capacity/${actor.id}`}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copy.editCapacityCard}
                </Link>
                <Link
                  href="/settings"
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copy.privacySettings}
                </Link>
                <Link
                  href={`/actors/${actor.id}`}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copy.publicActorProfile}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                {copy.capacitySnapshot}
              </h3>
              {capacityCard ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xl font-bold text-[#1e3a5f]">
                      {capacityCard.services.filter((service) => service.active).length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{copy.activeServices}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xl font-bold text-[#e8913a]">
                      {capacityCard.resources.reduce(
                        (total, resource) => total + resource.count,
                        0
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{copy.trackedResources}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-xl font-bold text-[#ef4444]">
                      {capacityCard.urgentNeeds.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{copy.urgentNeeds}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">{copy.noCapacityCard}</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div
          className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm"
          data-testid="platform-me-mapping-missing"
        >
          <h3 className="text-lg font-bold text-amber-900">{copy.actorMappingMissing}</h3>
          <p className="mt-2 text-sm text-amber-800">{copy.actorMappingMissingBody}</p>
          <Link
            href="/intake"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100/40"
          >
            {copy.openIntakeForm}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      )}
    </div>
  );
}
