"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LogOut,
  MapPin,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { getActors, getPendingSubmissions } from "@/lib/data/platform-api";
import { getSectorName, getZoneName } from "@/lib/data/zones";
import { getPlatformUser, onAuthChange, signOut } from "@/lib/firebase/auth";
import { createLogger } from "@/lib/logger";
import type { Actor, IntakeSubmission, PlatformUser } from "@/lib/types/platform";
import {
  formatPlatformDateTime,
  getActorTypeLabel,
  isRtlPlatformLocale,
} from "@/lib/utils/platform-user-display";

const log = createLogger("page:platform-review");

const copyByLocale = {
  en: {
    heading: "Intake Review Queue",
    signedOutBody:
      "Sign in with a Shabaka platform-admin account to review intake submissions.",
    goToSignIn: "Go to Shabaka Sign In",
    platformAdminOnly: "Platform Admin Only",
    platformAdminOnlyBody:
      "This queue is reserved for Shabaka platform admins. Your account is signed in, but it does not have review access.",
    backToMyOrganization: "Back to My Organization",
    queueBody: "Pending Shabaka onboarding submissions for manual review.",
    signOut: "Sign Out",
    pendingSubmissions: "Pending submissions",
    mappedActors: "Mapped actors",
    reviewActions: "Review actions",
    reviewActionsBody:
      "Read-only queue for now. Approval and rejection actions can be added next.",
    noPending: "No pending submissions",
    noPendingBody: "The intake queue is clear right now.",
    contact: "Contact",
    sectors: "Sectors",
    operationalZones: "Operational zones",
    possibleDuplicate: "Possible duplicate actor",
    duplicateBodyPrefix: "Matches existing actor",
    duplicateBodySuffix: "Review before approving.",
    openExistingActorProfile: "Open existing actor profile",
    loadErrorTitle: "Unable to load review queue",
    loadErrorBody: "Try again in a moment or sign out and back in.",
  },
  ar: {
    heading: "طابور مراجعة طلبات الانضمام",
    signedOutBody:
      "سجّل الدخول بحساب مدير منصة على شبكة لمراجعة طلبات الانضمام.",
    goToSignIn: "الانتقال إلى تسجيل الدخول",
    platformAdminOnly: "للمشرفين فقط",
    platformAdminOnlyBody:
      "هذا الطابور مخصص لمديري منصة شبكة فقط. حسابك مسجّل الدخول لكنه لا يملك صلاحية المراجعة.",
    backToMyOrganization: "العودة إلى منظمتي",
    queueBody: "طلبات انضمام شبكة المعلّقة والتي تنتظر مراجعة يدوية.",
    signOut: "تسجيل الخروج",
    pendingSubmissions: "الطلبات المعلّقة",
    mappedActors: "الجهات المرتبطة",
    reviewActions: "إجراءات المراجعة",
    reviewActionsBody:
      "الطابور للقراءة حالياً. يمكن إضافة إجراءات القبول والرفض لاحقاً.",
    noPending: "لا توجد طلبات معلّقة",
    noPendingBody: "طابور التسجيل خالٍ حالياً.",
    contact: "التواصل",
    sectors: "القطاعات",
    operationalZones: "المناطق التشغيلية",
    possibleDuplicate: "جهة مكررة محتملة",
    duplicateBodyPrefix: "يتطابق مع الجهة الحالية",
    duplicateBodySuffix: "راجعه قبل الاعتماد.",
    openExistingActorProfile: "فتح ملف الجهة الحالية",
    loadErrorTitle: "تعذر تحميل طابور المراجعة",
    loadErrorBody: "حاول مرة أخرى بعد قليل أو سجّل الخروج ثم ادخل من جديد.",
  },
} as const;

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function PlatformReviewPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = isRtlPlatformLocale(locale);
  const copy = isArabic ? copyByLocale.ar : copyByLocale.en;
  const [loading, setLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<IntakeSubmission[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthChange((user) => {
      if (!active) return;

      if (!user) {
        setPlatformUser(null);
        setPendingSubmissions([]);
        setActors([]);
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
              operation: "loadPlatformReviewQueue",
              uid: user.uid,
            });
            setPendingSubmissions([]);
            setActors([]);
            return;
          }

          if (profile.role !== "platform_admin") {
            log.warn("non-admin attempted to access review queue", undefined, {
              operation: "loadPlatformReviewQueue",
              uid: user.uid,
              role: profile.role,
            });
            setPendingSubmissions([]);
            setActors([]);
            return;
          }

          const [submissions, actorList] = await Promise.all([
            getPendingSubmissions(),
            getActors(),
          ]);

          if (!active) return;

          setPendingSubmissions(submissions);
          setActors(actorList);
        } catch (error) {
          if (!active) return;
          setPlatformUser(null);
          setPendingSubmissions([]);
          setActors([]);
          setHasLoadError(true);
          log.error("failed to load platform review queue", error, {
            operation: "loadPlatformReviewQueue",
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
    log.info("platform review sign-out", {
      operation: "platformReviewSignOut",
    });
    await signOut();
    router.push("/platform/login");
  }

  const duplicateMatches = useMemo(() => {
    const actorNameMap = new Map(
      actors.map((actor) => [normalizeName(actor.name), actor])
    );

    return new Map(
      pendingSubmissions.map((submission) => [
        submission.id,
        actorNameMap.get(normalizeName(submission.organizationName)) ?? null,
      ])
    );
  }, [actors, pendingSubmissions]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-3xl border border-slate-200 bg-white"
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
          data-testid="platform-review-heading"
        >
          {copy.heading}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{copy.signedOutBody}</p>
        <Link
          href="/platform/login"
          data-testid="platform-review-sign-in-cta"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2d5a8e]"
        >
          {copy.goToSignIn}
        </Link>
      </div>
    );
  }

  if (platformUser.role !== "platform_admin") {
    return (
      <div
        className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm"
        data-testid="platform-review-access-denied"
      >
        <div className="flex items-center gap-2 text-amber-900">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="text-xl font-bold">{copy.platformAdminOnly}</h2>
        </div>
        <p className="mt-2 text-sm text-amber-800">{copy.platformAdminOnlyBody}</p>
        <Link
          href="/platform/me"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100/40"
        >
          {copy.backToMyOrganization}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <ClipboardList className="h-5 w-5 text-[#1e3a5f]" />
              <h2
                className="text-xl font-bold"
                data-testid="platform-review-heading"
              >
                {copy.heading}
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">{copy.queueBody}</p>
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{copy.pendingSubmissions}</p>
          <p className="mt-2 text-3xl font-bold text-[#1e3a5f]">
            {pendingSubmissions.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{copy.mappedActors}</p>
          <p className="mt-2 text-3xl font-bold text-[#e8913a]">{actors.length}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">{copy.reviewActions}</p>
          <p className="mt-2 text-sm text-slate-700">{copy.reviewActionsBody}</p>
        </div>
      </div>

      {pendingSubmissions.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
            <h3 className="text-lg font-semibold">{copy.noPending}</h3>
          </div>
          <p className="mt-2 text-sm text-slate-500">{copy.noPendingBody}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingSubmissions.map((submission) => {
            const duplicate = duplicateMatches.get(submission.id);
            const duplicateName =
              duplicate && isArabic && duplicate.nameAr ? duplicate.nameAr : duplicate?.name;

            return (
              <div
                key={submission.id}
                data-testid={`platform-review-card-${submission.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {submission.organizationName}
                      </h3>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {getActorTypeLabel(submission.type, locale)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {copy.contact}: {submission.contactName} ·{" "}
                      <span dir="ltr">{submission.contactPhone}</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatPlatformDateTime(submission.submittedAt, locale)}
                  </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Users className="h-4 w-4 text-[#1e3a5f]" />
                      {copy.sectors}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {submission.sectors.map((sector) => (
                        <span
                          key={sector}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                        >
                          {getSectorName(sector, locale)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <MapPin className="h-4 w-4 text-[#e8913a]" />
                      {copy.operationalZones}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {submission.operationalZones.map((zoneId) => (
                        <span
                          key={zoneId}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                        >
                          {getZoneName(zoneId, locale)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {duplicate ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      {copy.possibleDuplicate}
                    </div>
                    <p className="mt-1">
                      {copy.duplicateBodyPrefix} <strong>{duplicateName}</strong>.{" "}
                      {copy.duplicateBodySuffix}
                    </p>
                    <Link
                      href={`/actors/${duplicate.id}`}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-amber-900 underline underline-offset-2"
                    >
                      {copy.openExistingActorProfile}
                      <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
