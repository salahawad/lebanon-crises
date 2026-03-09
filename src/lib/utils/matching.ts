import type {
  HelpRequest,
  Helper,
  Claim,
  ScoredRequest,
  RequestCluster,
  UrgencyLevel,
} from '../types';

// ── Scoring weights ──
const WEIGHT_GOVERNORATE = 50;
const WEIGHT_CATEGORY = 30;
const WEIGHT_AVAILABLE = 20;
const WEIGHT_CITY = 15;
const WEIGHT_REPUTATION_HIGH = 10;
const WEIGHT_REPUTATION_LOW = 5;
const MAX_ACTIVE_CLAIMS = 3;

const URGENCY_WEIGHTS: Record<UrgencyLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ── Feature 1: Score a request for a specific helper ──

export function scoreRequestForHelper(
  request: HelpRequest,
  helper: Helper,
  completedClaims: number
): ScoredRequest {
  let score = 0;
  const matchReasons: string[] = [];

  // Same governorate
  if (helper.governorate && request.governorate === helper.governorate) {
    score += WEIGHT_GOVERNORATE;
    matchReasons.push('nearYou');
  }

  // Category match
  if (helper.suppliesCanProvide.includes(request.category)) {
    score += WEIGHT_CATEGORY;
    matchReasons.push('categoryMatch');
  }

  // Request is open (not claimed yet)
  if (request.status === 'open') {
    score += WEIGHT_AVAILABLE;
  }

  // Same city
  if (helper.city && request.city && helper.city.toLowerCase() === request.city.toLowerCase()) {
    score += WEIGHT_CITY;
    matchReasons.push('sameArea');
  }

  // Reputation (based on completed claims)
  if (completedClaims >= 3) {
    score += WEIGHT_REPUTATION_HIGH;
  } else if (completedClaims >= 1) {
    score += WEIGHT_REPUTATION_LOW;
  }

  return { request, score, matchReasons };
}

// ── Rank all requests for a helper ──

export function rankRequestsForHelper(
  requests: HelpRequest[],
  helper: Helper,
  claims: Claim[]
): ScoredRequest[] {
  const completedClaims = claims.filter((c) => c.status === 'completed').length;

  return requests
    .map((r) => scoreRequestForHelper(r, helper, completedClaims))
    .filter((sr) => sr.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ── Feature 3: Cluster nearby same-category requests ──

export function clusterRequests(requests: HelpRequest[]): RequestCluster[] {
  const groups = new Map<string, HelpRequest[]>();

  for (const req of requests) {
    const key = `${req.governorate}__${req.category}`;
    const group = groups.get(key) || [];
    group.push(req);
    groups.set(key, group);
  }

  const clusters: RequestCluster[] = [];
  for (const [key, reqs] of groups) {
    if (reqs.length < 2) continue; // only cluster 2+

    const cities = new Set(reqs.map((r) => r.city));
    clusters.push({
      key,
      governorate: reqs[0].governorate,
      category: reqs[0].category,
      city: cities.size === 1 ? reqs[0].city : undefined,
      requests: reqs,
      totalPeople: reqs.reduce((sum, r) => sum + r.peopleCount, 0),
    });
  }

  return clusters.sort((a, b) => b.totalPeople - a.totalPeople);
}

// ── Feature 4: Priority score for sorting ──

export function computePriorityScore(request: HelpRequest): number {
  const urgencyWeight = URGENCY_WEIGHTS[request.urgency] || 1;
  const hoursOld = (Date.now() - request.createdAt) / 3_600_000;
  const timeBoost = 1 + Math.min(hoursOld / 24, 5) * 0.2; // older unfulfilled = higher
  const peopleBoost = Math.log2(request.peopleCount + 1);
  return urgencyWeight * timeBoost * peopleBoost;
}

export function sortByPriority(requests: HelpRequest[]): HelpRequest[] {
  return [...requests].sort(
    (a, b) => computePriorityScore(b) - computePriorityScore(a)
  );
}

// ── Feature 5: Helper capacity tracking ──

export function getActiveClaimCount(claims: Claim[]): number {
  return claims.filter((c) => c.status === 'pending' || c.status === 'accepted').length;
}

export function isHelperAtCapacity(claims: Claim[]): boolean {
  return getActiveClaimCount(claims) >= MAX_ACTIVE_CLAIMS;
}
