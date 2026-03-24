import type {
  ActorType,
  NotificationChannel,
  VerificationStatus,
} from '@/lib/types/platform';

export type PlatformLocale = 'en' | 'ar';

const actorTypeLabels: Record<ActorType, Record<PlatformLocale, string>> = {
  ngo: { en: 'NGO', ar: 'منظمة غير حكومية' },
  municipality: { en: 'Municipality', ar: 'بلدية' },
  grassroots: { en: 'Grassroots', ar: 'مبادرة مجتمعية' },
  shelter_org: { en: 'Shelter', ar: 'مأوى' },
};

const notificationLabels: Record<
  NotificationChannel,
  Record<PlatformLocale, string>
> = {
  push: { en: 'Push', ar: 'إشعارات التطبيق' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  sms: { en: 'SMS', ar: 'رسائل نصية' },
  all: { en: 'All channels', ar: 'كل القنوات' },
};

const verificationLabels: Record<
  VerificationStatus,
  Record<PlatformLocale, string>
> = {
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  provisional: { en: 'Provisional', ar: 'مبدئي' },
  verified: { en: 'Verified', ar: 'موثوق' },
  suspended: { en: 'Suspended', ar: 'معلّق' },
};

export function normalizePlatformLocale(locale: string): PlatformLocale {
  return locale === 'ar' ? 'ar' : 'en';
}

export function isRtlPlatformLocale(locale: string): boolean {
  return normalizePlatformLocale(locale) === 'ar';
}

export function getActorTypeLabel(type: ActorType, locale: string): string {
  return actorTypeLabels[type][normalizePlatformLocale(locale)];
}

export function getNotificationChannelLabel(
  channel: NotificationChannel,
  locale: string
): string {
  return notificationLabels[channel][normalizePlatformLocale(locale)];
}

export function getVerificationStatusLabel(
  status: VerificationStatus,
  locale: string
): string {
  return verificationLabels[status][normalizePlatformLocale(locale)];
}

export function formatPlatformDate(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleDateString(normalizePlatformLocale(locale));
}

export function formatPlatformDateTime(
  timestamp: number,
  locale: string
): string {
  return new Date(timestamp).toLocaleString(normalizePlatformLocale(locale));
}
