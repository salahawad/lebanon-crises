import { describe, expect, it } from 'vitest';

import {
  formatPlatformDate,
  formatPlatformDateTime,
  getActorTypeLabel,
  getNotificationChannelLabel,
  getVerificationStatusLabel,
  isRtlPlatformLocale,
  normalizePlatformLocale,
} from '@/lib/utils/platform-user-display';

describe('platform-user-display', () => {
  it('normalizes unknown locales to English', () => {
    expect(normalizePlatformLocale('fr')).toBe('en');
    expect(normalizePlatformLocale('en')).toBe('en');
    expect(normalizePlatformLocale('ar')).toBe('ar');
  });

  it('detects RTL locale correctly', () => {
    expect(isRtlPlatformLocale('ar')).toBe(true);
    expect(isRtlPlatformLocale('en')).toBe(false);
    expect(isRtlPlatformLocale('fr')).toBe(false);
  });

  it('returns localized actor type labels', () => {
    expect(getActorTypeLabel('grassroots', 'en')).toBe('Grassroots');
    expect(getActorTypeLabel('grassroots', 'ar')).toBe('مبادرة مجتمعية');
  });

  it('returns localized notification channel labels', () => {
    expect(getNotificationChannelLabel('all', 'en')).toBe('All channels');
    expect(getNotificationChannelLabel('all', 'ar')).toBe('كل القنوات');
  });

  it('returns localized verification labels', () => {
    expect(getVerificationStatusLabel('verified', 'en')).toBe('Verified');
    expect(getVerificationStatusLabel('verified', 'ar')).toBe('موثوق');
  });

  it('formats dates using the normalized locale', () => {
    const timestamp = new Date('2026-03-20T12:34:56Z').getTime();

    expect(formatPlatformDate(timestamp, 'en')).toBe(
      new Date(timestamp).toLocaleDateString('en')
    );
    expect(formatPlatformDate(timestamp, 'ar')).toBe(
      new Date(timestamp).toLocaleDateString('ar')
    );
  });

  it('formats date-times using the normalized locale', () => {
    const timestamp = new Date('2026-03-20T12:34:56Z').getTime();

    expect(formatPlatformDateTime(timestamp, 'en')).toBe(
      new Date(timestamp).toLocaleString('en')
    );
    expect(formatPlatformDateTime(timestamp, 'ar')).toBe(
      new Date(timestamp).toLocaleString('ar')
    );
  });
});
