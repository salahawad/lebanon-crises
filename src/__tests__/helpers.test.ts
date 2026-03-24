import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateReferenceCode,
  timeAgo,
  timeAgoAr,
  truncate,
  checkRateLimit,
} from '@/lib/utils/helpers';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('generateReferenceCode', () => {
  it('generates a code in HLP-XXXX format', () => {
    const code = generateReferenceCode();
    expect(code).toMatch(/^HLP-[A-Z2-9]{4}$/);
  });

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateReferenceCode()));
    // Not guaranteed unique but statistically very likely with 100 out of ~1M possibilities
    expect(codes.size).toBeGreaterThan(90);
  });

  it('does not contain confusing characters', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateReferenceCode();
      expect(code).not.toMatch(/[IO01]/);
    }
  });
});

describe('timeAgo', () => {
  it('returns "just now" for recent times', () => {
    expect(timeAgo(Date.now() - 5000)).toBe('just now');
  });

  it('returns minutes for recent times', () => {
    expect(timeAgo(Date.now() - 300000)).toBe('5m ago');
  });

  it('returns hours', () => {
    expect(timeAgo(Date.now() - 7200000)).toBe('2h ago');
  });

  it('returns days', () => {
    expect(timeAgo(Date.now() - 172800000)).toBe('2d ago');
  });

  it('returns a locale date string for timestamps older than a week', () => {
    const timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;
    expect(timeAgo(timestamp)).toBe(new Date(timestamp).toLocaleDateString());
  });
});

describe('timeAgoAr', () => {
  it('returns Arabic "now" for recent times', () => {
    expect(timeAgoAr(Date.now() - 5000)).toBe('الآن');
  });

  it('returns Arabic minutes for recent times', () => {
    expect(timeAgoAr(Date.now() - 5 * 60 * 1000)).toBe('منذ 5 د');
  });

  it('returns Arabic hours', () => {
    expect(timeAgoAr(Date.now() - 2 * 60 * 60 * 1000)).toBe('منذ 2 س');
  });

  it('returns Arabic days', () => {
    expect(timeAgoAr(Date.now() - 2 * 24 * 60 * 60 * 1000)).toBe('منذ 2 ي');
  });

  it('returns an Arabic locale date string for timestamps older than a week', () => {
    const timestamp = Date.now() - 8 * 24 * 60 * 60 * 1000;
    expect(timeAgoAr(timestamp)).toBe(new Date(timestamp).toLocaleDateString('ar'));
  });
});

describe('truncate', () => {
  it('returns full text if under limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world foo bar', 10)).toBe('hello worl...');
  });

  it('trims trailing whitespace before appending an ellipsis', () => {
    expect(truncate('hello world   ', 11)).toBe('hello world...');
  });
});

describe('checkRateLimit', () => {
  it('allows first attempt', () => {
    // localStorage mock in jsdom
    expect(checkRateLimit('test_key_1', 5, 60000)).toBe(true);
  });

  it('blocks after max attempts', () => {
    const key = 'test_block_' + Date.now();
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 60000);
    }
    expect(checkRateLimit(key, 3, 60000)).toBe(false);
  });

  it('resets the stored count after the rate-limit window expires', () => {
    const key = 'test_reset_' + Date.now();
    const now = Date.now();

    localStorage.setItem(
      `rl_${key}`,
      JSON.stringify({ count: 3, start: now - 61000 })
    );

    expect(checkRateLimit(key, 3, 60000)).toBe(true);
    expect(localStorage.getItem(`rl_${key}`)).toBe(
      JSON.stringify({ count: 1, start: now })
    );
  });

  it('increments stored attempts while still under the limit', () => {
    const key = 'test_increment_' + Date.now();
    const now = Date.now();

    localStorage.setItem(
      `rl_${key}`,
      JSON.stringify({ count: 1, start: now })
    );

    expect(checkRateLimit(key, 3, 60000)).toBe(true);
    expect(localStorage.getItem(`rl_${key}`)).toBe(
      JSON.stringify({ count: 2, start: now })
    );
  });

  it('returns true during server-side execution when window is unavailable', () => {
    vi.stubGlobal('window', undefined);
    expect(checkRateLimit('server_key', 1, 1000)).toBe(true);
  });
});
