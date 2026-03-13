import { describe, it, expect } from 'vitest';
import {
  scoreRequestForHelper,
  rankRequestsForHelper,
  clusterRequests,
  computePriorityScore,
  sortByPriority,
  getActiveClaimCount,
  isHelperAtCapacity,
} from '@/lib/utils/matching';
import type { HelpRequest, Helper, Claim } from '@/lib/types';

// ── Fixtures ──

const makeRequest = (overrides: Partial<HelpRequest> = {}): HelpRequest => ({
  id: 'req-1',
  category: 'medicine',
  description: 'Need insulin',
  governorate: 'beirut',
  city: 'Beirut',
  area: '',
  peopleCount: 3,
  urgency: 'high',
  contactMethod: 'phone',
  status: 'open',
  language: 'en',
  createdAt: Date.now() - 3_600_000, // 1 hour ago
  updatedAt: Date.now() - 3_600_000,
  createdByType: 'anonymous',
  referenceCode: 'HLP-TEST',
  moderationFlags: [],
  ...overrides,
});

const makeHelper = (overrides: Partial<Helper> = {}): Helper => ({
  id: 'helper-1',
  name: 'Ahmad',
  email: 'ahmad@test.com',
  governorate: 'beirut',
  suppliesCanProvide: ['medicine', 'food'],
  verified: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

const makeClaim = (overrides: Partial<Claim> = {}): Claim => ({
  id: 'claim-1',
  requestId: 'req-1',
  helperId: 'helper-1',
  helperName: 'Ahmad',
  status: 'pending',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

// ── scoreRequestForHelper ──

describe('scoreRequestForHelper', () => {
  it('gives points for same governorate', () => {
    const result = scoreRequestForHelper(
      makeRequest({ governorate: 'beirut' }),
      makeHelper({ governorate: 'beirut' }),
      0
    );
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.matchReasons).toContain('nearYou');
  });

  it('gives no governorate points when different', () => {
    const result = scoreRequestForHelper(
      makeRequest({ governorate: 'north' }),
      makeHelper({ governorate: 'beirut' }),
      0
    );
    expect(result.matchReasons).not.toContain('nearYou');
  });

  it('gives points for matching category', () => {
    const result = scoreRequestForHelper(
      makeRequest({ category: 'medicine' }),
      makeHelper({ suppliesCanProvide: ['medicine'] }),
      0
    );
    expect(result.matchReasons).toContain('categoryMatch');
  });

  it('gives points for same city', () => {
    const result = scoreRequestForHelper(
      makeRequest({ city: 'Beirut' }),
      makeHelper({ city: 'beirut' }),
      0
    );
    expect(result.matchReasons).toContain('sameArea');
  });

  it('gives points for open status', () => {
    const open = scoreRequestForHelper(makeRequest({ status: 'open' }), makeHelper(), 0);
    const inProgress = scoreRequestForHelper(makeRequest({ status: 'in_progress' }), makeHelper(), 0);
    expect(open.score).toBeGreaterThan(inProgress.score);
  });

  it('gives reputation bonus for completed claims', () => {
    const newHelper = scoreRequestForHelper(makeRequest(), makeHelper(), 0);
    const experienced = scoreRequestForHelper(makeRequest(), makeHelper(), 3);
    expect(experienced.score).toBeGreaterThan(newHelper.score);
  });

  it('gives small reputation bonus for 1-2 completed claims', () => {
    const none = scoreRequestForHelper(makeRequest(), makeHelper(), 0);
    const some = scoreRequestForHelper(makeRequest(), makeHelper(), 1);
    expect(some.score).toBeGreaterThan(none.score);
  });
});

// ── rankRequestsForHelper ──

describe('rankRequestsForHelper', () => {
  it('returns scored requests sorted by score descending', () => {
    const requests = [
      makeRequest({ id: 'r1', governorate: 'north', category: 'shelter' }),
      makeRequest({ id: 'r2', governorate: 'beirut', category: 'medicine' }),
    ];
    const helper = makeHelper({ governorate: 'beirut', suppliesCanProvide: ['medicine'] });
    const result = rankRequestsForHelper(requests, helper, []);
    expect(result[0].request.id).toBe('r2');
  });

  it('filters out requests with score 0', () => {
    const requests = [
      makeRequest({ governorate: 'south', category: 'transport', status: 'fulfilled' }),
    ];
    const helper = makeHelper({ governorate: 'beirut', suppliesCanProvide: ['medicine'] });
    const result = rankRequestsForHelper(requests, helper, []);
    expect(result).toHaveLength(0);
  });

  it('counts completed claims for reputation', () => {
    const requests = [makeRequest()];
    const claims: Claim[] = [
      makeClaim({ status: 'completed' }),
      makeClaim({ id: 'c2', status: 'completed' }),
      makeClaim({ id: 'c3', status: 'completed' }),
    ];
    const helper = makeHelper();
    const result = rankRequestsForHelper(requests, helper, claims);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ── clusterRequests ──

describe('clusterRequests', () => {
  it('groups requests by governorate and category', () => {
    const requests = [
      makeRequest({ id: 'r1', governorate: 'beirut', category: 'medicine' }),
      makeRequest({ id: 'r2', governorate: 'beirut', category: 'medicine' }),
      makeRequest({ id: 'r3', governorate: 'north', category: 'food' }),
    ];
    const clusters = clusterRequests(requests);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].requests).toHaveLength(2);
    expect(clusters[0].governorate).toBe('beirut');
    expect(clusters[0].category).toBe('medicine');
  });

  it('does not cluster single requests', () => {
    const requests = [
      makeRequest({ id: 'r1', governorate: 'beirut', category: 'medicine' }),
      makeRequest({ id: 'r2', governorate: 'north', category: 'food' }),
    ];
    const clusters = clusterRequests(requests);
    expect(clusters).toHaveLength(0);
  });

  it('sums people count in cluster', () => {
    const requests = [
      makeRequest({ id: 'r1', governorate: 'beirut', category: 'food', peopleCount: 3 }),
      makeRequest({ id: 'r2', governorate: 'beirut', category: 'food', peopleCount: 5 }),
    ];
    const clusters = clusterRequests(requests);
    expect(clusters[0].totalPeople).toBe(8);
  });

  it('sets city when all requests share the same city', () => {
    const requests = [
      makeRequest({ id: 'r1', governorate: 'beirut', category: 'food', city: 'Beirut' }),
      makeRequest({ id: 'r2', governorate: 'beirut', category: 'food', city: 'Beirut' }),
    ];
    const clusters = clusterRequests(requests);
    expect(clusters[0].city).toBe('Beirut');
  });

  it('sets city to undefined when requests have different cities', () => {
    const requests = [
      makeRequest({ id: 'r1', governorate: 'beirut', category: 'food', city: 'Beirut' }),
      makeRequest({ id: 'r2', governorate: 'beirut', category: 'food', city: 'Jounieh' }),
    ];
    const clusters = clusterRequests(requests);
    expect(clusters[0].city).toBeUndefined();
  });

  it('sorts clusters by totalPeople descending', () => {
    const requests = [
      makeRequest({ id: 'r1', governorate: 'north', category: 'food', peopleCount: 2 }),
      makeRequest({ id: 'r2', governorate: 'north', category: 'food', peopleCount: 3 }),
      makeRequest({ id: 'r3', governorate: 'beirut', category: 'medicine', peopleCount: 10 }),
      makeRequest({ id: 'r4', governorate: 'beirut', category: 'medicine', peopleCount: 10 }),
    ];
    const clusters = clusterRequests(requests);
    expect(clusters[0].governorate).toBe('beirut');
  });
});

// ── computePriorityScore / sortByPriority ──

describe('computePriorityScore', () => {
  it('gives critical requests higher score than low', () => {
    const critical = computePriorityScore(makeRequest({ urgency: 'critical' }));
    const low = computePriorityScore(makeRequest({ urgency: 'low' }));
    expect(critical).toBeGreaterThan(low);
  });

  it('gives older requests higher score (time boost)', () => {
    const recent = computePriorityScore(makeRequest({ createdAt: Date.now() - 3_600_000 }));
    const old = computePriorityScore(makeRequest({ createdAt: Date.now() - 72 * 3_600_000 }));
    expect(old).toBeGreaterThan(recent);
  });

  it('gives more people a higher score', () => {
    const few = computePriorityScore(makeRequest({ peopleCount: 1 }));
    const many = computePriorityScore(makeRequest({ peopleCount: 20 }));
    expect(many).toBeGreaterThan(few);
  });
});

describe('sortByPriority', () => {
  it('sorts by priority score descending', () => {
    const requests = [
      makeRequest({ id: 'low', urgency: 'low', peopleCount: 1 }),
      makeRequest({ id: 'critical', urgency: 'critical', peopleCount: 10 }),
    ];
    const sorted = sortByPriority(requests);
    expect(sorted[0].id).toBe('critical');
  });

  it('does not mutate original array', () => {
    const requests = [
      makeRequest({ id: 'a' }),
      makeRequest({ id: 'b' }),
    ];
    const sorted = sortByPriority(requests);
    expect(sorted).not.toBe(requests);
  });
});

// ── getActiveClaimCount / isHelperAtCapacity ──

describe('getActiveClaimCount', () => {
  it('counts pending and accepted claims', () => {
    const claims = [
      makeClaim({ status: 'pending' }),
      makeClaim({ id: 'c2', status: 'accepted' }),
      makeClaim({ id: 'c3', status: 'completed' }),
      makeClaim({ id: 'c4', status: 'rejected' }),
    ];
    expect(getActiveClaimCount(claims)).toBe(2);
  });

  it('returns 0 for empty array', () => {
    expect(getActiveClaimCount([])).toBe(0);
  });
});

describe('isHelperAtCapacity', () => {
  it('returns false when under limit', () => {
    const claims = [
      makeClaim({ status: 'pending' }),
      makeClaim({ id: 'c2', status: 'accepted' }),
    ];
    expect(isHelperAtCapacity(claims)).toBe(false);
  });

  it('returns true when at limit (3 active)', () => {
    const claims = [
      makeClaim({ status: 'pending' }),
      makeClaim({ id: 'c2', status: 'accepted' }),
      makeClaim({ id: 'c3', status: 'pending' }),
    ];
    expect(isHelperAtCapacity(claims)).toBe(true);
  });

  it('returns true when over limit', () => {
    const claims = [
      makeClaim({ status: 'pending' }),
      makeClaim({ id: 'c2', status: 'accepted' }),
      makeClaim({ id: 'c3', status: 'pending' }),
      makeClaim({ id: 'c4', status: 'accepted' }),
    ];
    expect(isHelperAtCapacity(claims)).toBe(true);
  });

  it('ignores completed and rejected claims', () => {
    const claims = [
      makeClaim({ status: 'completed' }),
      makeClaim({ id: 'c2', status: 'rejected' }),
      makeClaim({ id: 'c3', status: 'completed' }),
      makeClaim({ id: 'c4', status: 'completed' }),
    ];
    expect(isHelperAtCapacity(claims)).toBe(false);
  });
});
