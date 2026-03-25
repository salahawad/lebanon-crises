"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Building2, LogIn, ShieldCheck } from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { signInPlatformUser } from "@/lib/firebase/auth";
import { createLogger } from "@/lib/logger";
import { isRtlPlatformLocale } from "@/lib/utils/platform-user-display";

const log = createLogger("page:platform-login");

type LoginErrorType = "" | "generic" | "mapping";

const copyByLocale = {
  en: {
    heading: "Shabaka Sign In",
    subheading: "Organization and platform-admin access for account-owned workflows.",
    devAccounts: "Development accounts",
    devAccountsHint: "Available after running npm run seed.",
    actorSampleLabel: "Organization Account",
    actorSampleDescription: "Amel Association org workspace",
    adminSampleLabel: "Platform Admin",
    adminSampleDescription: "Shabaka intake review queue",
    formTitle: "Account Access",
    formBody: "Sign in to open your org workspace or review queue.",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "name@example.org",
    passwordPlaceholder: "••••••••",
    errors: {
      mapping: "This account is not linked to a Shabaka org or platform admin role yet.",
      generic: "Unable to sign in right now. Check the credentials and try again.",
    },
    signingIn: "Signing In...",
    signIn: "Sign In",
    needAccount: "Need an account first?",
    needAccountBody: "Organizations that are not onboarded yet should start with the intake form.",
    registerOrganization: "Register Organization",
  },
  ar: {
    heading: "تسجيل الدخول إلى شبكة",
    subheading: "وصول المنظمات ومديري المنصة إلى المساحات المرتبطة بالحساب.",
    devAccounts: "حسابات التطوير",
    devAccountsHint: "تتوفر بعد تشغيل npm run seed.",
    actorSampleLabel: "حساب منظمة",
    actorSampleDescription: "مساحة عمل جمعية أمل",
    adminSampleLabel: "مدير المنصة",
    adminSampleDescription: "طابور مراجعة طلبات شبكة",
    formTitle: "دخول الحساب",
    formBody: "سجّل الدخول لفتح مساحة منظمتك أو طابور المراجعة.",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    emailPlaceholder: "name@example.org",
    passwordPlaceholder: "••••••••",
    errors: {
      mapping: "هذا الحساب غير مرتبط بعد بمنظمة على شبكة أو بدور مدير للمنصة.",
      generic: "تعذر تسجيل الدخول حالياً. تحقق من البيانات ثم حاول مرة أخرى.",
    },
    signingIn: "جارٍ تسجيل الدخول...",
    signIn: "تسجيل الدخول",
    needAccount: "هل تحتاج إلى حساب أولاً؟",
    needAccountBody: "إذا لم تكن منظمتك منضمة بعد، ابدأ من استمارة التسجيل.",
    registerOrganization: "تسجيل المنظمة",
  },
} as const;

export default function PlatformLoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = isRtlPlatformLocale(locale);
  const copy = isArabic ? copyByLocale.ar : copyByLocale.en;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorType, setErrorType] = useState<LoginErrorType>("");

  const sampleAccounts = [
    {
      key: "actor",
      label: copy.actorSampleLabel,
      email: "actor.a1@shabaka.lb",
      password: "platform123",
      description: copy.actorSampleDescription,
    },
    {
      key: "admin",
      label: copy.adminSampleLabel,
      email: "platformadmin@shabaka.lb",
      password: "platform123",
      description: copy.adminSampleDescription,
    },
  ] as const;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorType("");

    try {
      const { platformUser } = await signInPlatformUser(email, password);
      log.info("platform login succeeded", {
        operation: "platformLogin",
        email,
        role: platformUser.role,
      });
      router.push(
        platformUser.role === "platform_admin" ? "/platform/review" : "/platform/me"
      );
    } catch (err: unknown) {
      const nextErrorType =
        err instanceof Error && err.message === "Not authorized as platform user"
          ? "mapping"
          : "generic";
      setErrorType(nextErrorType);
      log.warn("platform login failed", err, {
        operation: "platformLogin",
        email,
        reason: nextErrorType,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="platform-login-page">
      <div>
        <h2
          className="text-2xl font-bold text-slate-900"
          data-testid="platform-login-heading"
        >
          {copy.heading}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{copy.subheading}</p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          {copy.devAccounts}
        </div>
        <p className="mt-1 text-blue-800">{copy.devAccountsHint}</p>
        <div className="mt-3 space-y-2">
          {sampleAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              data-testid={`platform-login-sample-${account.key}`}
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
              className="flex w-full items-start justify-between gap-3 rounded-xl border border-blue-200 bg-white px-3 py-3 text-start transition-colors hover:border-blue-300 hover:bg-blue-50/60"
            >
              <div>
                <p className="font-medium text-slate-900">{account.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{account.description}</p>
              </div>
              <div className="shrink-0 text-end text-xs text-slate-600" dir="ltr">
                <p>{account.email}</p>
                <p>{account.password}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <LogIn className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{copy.formTitle}</h3>
            <p className="text-sm text-slate-500">{copy.formBody}</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {copy.emailLabel}
          </label>
          <input
            type="email"
            dir="ltr"
            value={email}
            data-testid="platform-login-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {copy.passwordLabel}
          </label>
          <input
            type="password"
            dir="ltr"
            value={password}
            data-testid="platform-login-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder={copy.passwordPlaceholder}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        {errorType ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {copy.errors[errorType]}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          data-testid="platform-login-submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />
          {submitting ? copy.signingIn : copy.signIn}
        </button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-900">{copy.needAccount}</p>
        <p className="mt-1">{copy.needAccountBody}</p>
        <Link
          href="/intake"
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Building2 className="h-4 w-4" />
          {copy.registerOrganization}
        </Link>
      </div>
    </div>
  );
}
