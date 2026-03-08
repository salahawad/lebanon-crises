import { describe, it, expect } from 'vitest';
import {
  generateReferenceCode,
  timeAgo,
  timeAgoAr,
  truncate,
  checkRateLimit,
} from '@/lib/utils/helpers';

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
});

describe('timeAgoAr', () => {
  it('returns Arabic "now" for recent times', () => {
    expect(timeAgoAr(Date.now() - 5000)).toBe('الآن');
  });
});

describe('truncate', () => {
  it('returns full text if under limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world foo bar', 10)).toBe('hello worl...');
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
});
