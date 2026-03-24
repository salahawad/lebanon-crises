// ============================================================
// Platform data access layer backed by Firestore
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';
import { createLogger } from '@/lib/logger';
import type {
  Actor,
  CapacityCard,
  CapacityChange,
  Vouch,
  NeedEntry,
  UrgencyAlert,
  CollaborationRequest,
  JointOperation,
  SharedTask,
  FlashAssessment,
  AssessmentSnapshot,
  SectorPlan,
  GapAnalysis,
  Message,
  MessageThread,
  CommunityFeedback,
  OutcomeReport,
  NetworkOutcome,
  PatternAlert,
  PlatformStats,
  IntakeSubmission,
  MapZoneData,
  ZoneResource,
  Sector,
} from '@/lib/types/platform';
import { ZONES } from './zones';

const log = createLogger('data:platform-api');
const DAY = 86400000;
const ALL_SECTORS: Sector[] = [
  'food',
  'medical',
  'shelter',
  'psychosocial',
  'legal',
  'logistics',
  'wash',
  'education',
  'protection',
];

type CollectionName =
  | 'actors'
  | 'intake_submissions'
  | 'capacity_cards'
  | 'capacity_changes'
  | 'vouches'
  | 'needs'
  | 'pattern_alerts'
  | 'urgency_alerts'
  | 'collaborations'
  | 'joint_operations'
  | 'shared_tasks'
  | 'flash_assessments'
  | 'assessment_snapshots'
  | 'sector_plans'
  | 'gap_analyses'
  | 'message_threads'
  | 'messages'
  | 'community_feedback'
  | 'outcome_reports'
  | 'network_outcomes';

function injectId<T extends { id: string }>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
  const data = snapshot.data() as Partial<T>;
  return {
    ...data,
    id: data.id ?? snapshot.id,
  } as T;
}

async function listCollection<T extends { id: string }>(name: CollectionName): Promise<T[]> {
  const start = Date.now();
  try {
    const snapshot = await getDocs(collection(db, name));
    const results = snapshot.docs.map((docSnapshot) => injectId<T>(docSnapshot));
    log.debug(`listed ${name}`, { collection: name, count: results.length, duration: Date.now() - start });
    return results;
  } catch (err) {
    log.error(`failed to list ${name}`, err, { collection: name, duration: Date.now() - start });
    throw err;
  }
}

async function listPlainCollection<T>(name: CollectionName): Promise<T[]> {
  const start = Date.now();
  try {
    const snapshot = await getDocs(collection(db, name));
    const results = snapshot.docs.map((docSnapshot) => docSnapshot.data() as T);
    log.debug(`listed ${name}`, { collection: name, count: results.length, duration: Date.now() - start });
    return results;
  } catch (err) {
    log.error(`failed to list ${name}`, err, { collection: name, duration: Date.now() - start });
    throw err;
  }
}

async function getCollectionDoc<T extends { id: string }>(
  name: CollectionName,
  id: string
): Promise<T | null> {
  const start = Date.now();
  try {
    const snapshot = await getDoc(doc(db, name, id));
    if (!snapshot.exists()) {
      log.debug(`${name} doc not found`, { collection: name, docId: id, duration: Date.now() - start });
      return null;
    }
    const data = snapshot.data() as Partial<T>;
    log.debug(`fetched ${name} doc`, { collection: name, docId: id, duration: Date.now() - start });
    return {
      ...data,
      id: data.id ?? snapshot.id,
    } as T;
  } catch (err) {
    log.error(`failed to get ${name} doc`, err, { collection: name, docId: id, duration: Date.now() - start });
    throw err;
  }
}

async function getSingletonDoc<T>(collectionName: string, id: string): Promise<T | null> {
  const start = Date.now();
  try {
    const snapshot = await getDoc(doc(db, collectionName, id));
    if (!snapshot.exists()) {
      log.debug(`${collectionName} singleton not found`, { collection: collectionName, docId: id, duration: Date.now() - start });
      return null;
    }
    log.debug(`fetched ${collectionName} singleton`, { collection: collectionName, docId: id, duration: Date.now() - start });
    return snapshot.data() as T;
  } catch (err) {
    log.error(`failed to get ${collectionName} singleton`, err, { collection: collectionName, docId: id, duration: Date.now() - start });
    throw err;
  }
}

// ---- Actors (Feature 5) ----

export async function getActors(): Promise<Actor[]> {
  return (await listCollection<Actor>('actors')).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getActor(id: string): Promise<Actor | null> {
  return getCollectionDoc<Actor>('actors', id);
}

export async function getActorsByZone(zoneId: string): Promise<Actor[]> {
  return (await getActors()).filter((actor) => actor.operationalZones.includes(zoneId));
}

export async function getActorsBySector(sector: Sector): Promise<Actor[]> {
  return (await getActors()).filter((actor) => actor.sectors.includes(sector));
}

export async function getVerifiedActors(): Promise<Actor[]> {
  return (await getActors()).filter((actor) => actor.verificationStatus === 'verified');
}

// ---- Intake Submissions (Feature 2) ----

export async function getIntakeSubmissions(): Promise<IntakeSubmission[]> {
  return (await listCollection<IntakeSubmission>('intake_submissions')).sort(
    (a, b) => b.submittedAt - a.submittedAt
  );
}

export async function getPendingSubmissions(): Promise<IntakeSubmission[]> {
  return (await getIntakeSubmissions()).filter((submission) => submission.status === 'pending');
}

// ---- Capacity Cards (Feature 6) ----

export async function getCapacityCards(): Promise<CapacityCard[]> {
  return (await listCollection<CapacityCard>('capacity_cards')).sort(
    (a, b) => b.lastUpdated - a.lastUpdated
  );
}

export async function getCapacityCard(actorId: string): Promise<CapacityCard | null> {
  const cards = await getCapacityCards();
  return cards.find((card) => card.actorId === actorId) ?? null;
}

export async function getCapacityCardsByZone(zoneId: string): Promise<CapacityCard[]> {
  return (await getCapacityCards()).filter((card) => card.zone === zoneId);
}

export async function getAllCapacityChanges(): Promise<CapacityChange[]> {
  return (await listCollection<CapacityChange>('capacity_changes')).sort(
    (a, b) => b.changedAt - a.changedAt
  );
}

export async function getCapacityChanges(cardId: string): Promise<CapacityChange[]> {
  if (!cardId) return [];
  return (await getAllCapacityChanges()).filter((change) => change.cardId === cardId);
}

// ---- Vouches (Feature 7) ----

export async function getVouchesForActor(actorId: string): Promise<Vouch[]> {
  return (await listCollection<Vouch>('vouches')).filter((vouch) => vouch.targetId === actorId);
}

export async function getVouchesByActor(actorId: string): Promise<Vouch[]> {
  return (await listCollection<Vouch>('vouches')).filter((vouch) => vouch.voucherId === actorId);
}

// ---- Needs (Feature 9) ----

export async function getNeeds(): Promise<NeedEntry[]> {
  const urgencyOrder = { red: 0, amber: 1, gray: 2 };
  return (await listCollection<NeedEntry>('needs')).sort(
    (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || b.updatedAt - a.updatedAt
  );
}

export async function getNeedsByZone(zoneId: string): Promise<NeedEntry[]> {
  return (await getNeeds()).filter((need) => need.zone === zoneId);
}

export async function getNeedsByCategory(category: Sector): Promise<NeedEntry[]> {
  return (await getNeeds()).filter((need) => need.category === category);
}

export async function getPatternAlerts(): Promise<PatternAlert[]> {
  return (await listCollection<PatternAlert>('pattern_alerts')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

// ---- Map Data (Feature 10) ----

export async function getMapData(): Promise<MapZoneData[]> {
  const [actors, alerts] = await Promise.all([getActors(), getUrgencyAlerts()]);
  const now = Date.now();

  return ZONES.map((zone) => {
    const zoneActors = actors.filter(
      (actor) =>
        actor.operationalZones.includes(zone.id) && actor.verificationStatus !== 'suspended'
    );
    const activeSectors = [...new Set(zoneActors.flatMap((actor) => actor.sectors))] as Sector[];
    const gaps = ALL_SECTORS.filter((sector) => !activeSectors.includes(sector));
    const hasAlert = alerts.some((alert) => alert.zone === zone.id && alert.status === 'active');
    const oldestUpdate = zoneActors.length > 0 ? Math.min(...zoneActors.map((actor) => actor.lastUpdated)) : 0;
    const staleDays = (now - oldestUpdate) / DAY;
    const freshness = staleDays < 7 ? 'fresh' : staleDays < 14 ? 'stale' : 'outdated';

    return {
      zoneId: zone.id,
      activeSectors,
      actorCount: zoneActors.length,
      gaps,
      hasUrgencyAlert: hasAlert,
      freshness,
    };
  });
}

// ---- Resources (Feature 11) ----

export async function getResources(): Promise<ZoneResource[]> {
  const cards = await getCapacityCards();
  const resourceMap = new Map<string, ZoneResource>();

  for (const card of cards) {
    for (const resource of card.resources) {
      const key = `${card.zone}_${resource.resourceId}`;
      if (!resourceMap.has(key)) {
        resourceMap.set(key, {
          zone: card.zone,
          category: resource.label,
          totalCount: 0,
          actorBreakdown: [],
          lastUpdated: 0,
        });
      }

      const zoneResource = resourceMap.get(key)!;
      zoneResource.totalCount += resource.count;
      zoneResource.actorBreakdown.push({
        actorId: card.actorId,
        actorName: card.actorName,
        count: resource.count,
        updatedAt: resource.updatedAt,
      });
      zoneResource.lastUpdated = Math.max(zoneResource.lastUpdated, resource.updatedAt);
    }
  }

  return Array.from(resourceMap.values());
}

export async function getResourcesByZone(zoneId: string): Promise<ZoneResource[]> {
  return (await getResources()).filter((resource) => resource.zone === zoneId);
}

// ---- Urgency Alerts (Feature 13) ----

export async function getUrgencyAlerts(): Promise<UrgencyAlert[]> {
  return (await listCollection<UrgencyAlert>('urgency_alerts')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function getActiveAlerts(): Promise<UrgencyAlert[]> {
  return (await getUrgencyAlerts()).filter((alert) => alert.status === 'active');
}

export async function getAlertsByZone(zoneId: string): Promise<UrgencyAlert[]> {
  return (await getUrgencyAlerts()).filter((alert) => alert.zone === zoneId);
}

// ---- Collaborations (Feature 14) ----

export async function getCollaborations(): Promise<CollaborationRequest[]> {
  return (await listCollection<CollaborationRequest>('collaborations')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function getCollaborationsForActor(actorId: string): Promise<CollaborationRequest[]> {
  return (await getCollaborations()).filter(
    (collaboration) =>
      collaboration.fromActorId === actorId || collaboration.toActorId === actorId
  );
}

export async function getJointOperations(): Promise<JointOperation[]> {
  return (await listCollection<JointOperation>('joint_operations')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function getJointOperation(id: string): Promise<JointOperation | null> {
  return getCollectionDoc<JointOperation>('joint_operations', id);
}

// ---- Tasks (Feature 15) ----

export async function getTasksForOperation(jointOpId: string): Promise<SharedTask[]> {
  return (await listCollection<SharedTask>('shared_tasks'))
    .filter((task) => task.jointOpId === jointOpId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

// ---- Flash Assessments (Feature 16) ----

export async function getFlashAssessments(): Promise<FlashAssessment[]> {
  return (await listCollection<FlashAssessment>('flash_assessments')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function getAssessmentSnapshot(
  assessmentId: string
): Promise<AssessmentSnapshot | null> {
  const snapshot = await getDoc(doc(db, 'assessment_snapshots', assessmentId));
  if (!snapshot.exists()) return null;
  return snapshot.data() as AssessmentSnapshot;
}

// ---- Sector Planning (Feature 17) ----

export async function getSectorPlans(): Promise<SectorPlan[]> {
  return (await listCollection<SectorPlan>('sector_plans')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function getGapAnalyses(): Promise<GapAnalysis[]> {
  return (await listPlainCollection<GapAnalysis>('gap_analyses')).sort(
    (a, b) => b.generatedAt - a.generatedAt
  );
}

// ---- Messaging (Feature 17b) ----

export async function getMessageThreads(actorId: string): Promise<MessageThread[]> {
  return (await listCollection<MessageThread>('message_threads'))
    .filter((thread) => thread.participants.includes(actorId))
    .sort((a, b) => (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt));
}

export async function getMessages(threadId: string): Promise<Message[]> {
  return (await listCollection<Message>('messages'))
    .filter((message) => message.threadId === threadId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

// ---- Community Feedback (Feature 19) ----

export async function getCommunityFeedback(): Promise<CommunityFeedback[]> {
  return (await listCollection<CommunityFeedback>('community_feedback')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function getFeedbackForActor(actorId: string): Promise<CommunityFeedback[]> {
  return (await getCommunityFeedback()).filter((feedback) => feedback.routedToActorId === actorId);
}

// ---- Outcomes (Feature 20) ----

export async function getOutcomeReports(): Promise<OutcomeReport[]> {
  return (await listCollection<OutcomeReport>('outcome_reports')).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function getNetworkOutcomes(): Promise<NetworkOutcome[]> {
  return (await listPlainCollection<NetworkOutcome>('network_outcomes')).sort((a, b) =>
    b.weekOf.localeCompare(a.weekOf)
  );
}

// ---- Platform Stats ----

export async function getPlatformStats(): Promise<PlatformStats> {
  const storedStats = await getSingletonDoc<PlatformStats>('platform_stats', 'global');
  if (storedStats) return storedStats;

  const [actors, needs, alerts, operations, mapData] = await Promise.all([
    getActors(),
    getNeeds(),
    getActiveAlerts(),
    getJointOperations(),
    getMapData(),
  ]);

  const coverageGaps = mapData.filter((zone) => zone.gaps.length > 0).length;
  const sectorsMissing = new Set(mapData.flatMap((zone) => zone.gaps)).size;

  return {
    totalActors: actors.length,
    verifiedActors: actors.filter((actor) => actor.verificationStatus === 'verified').length,
    coverageGaps,
    sectorsMissing,
    activeNeeds: needs.filter((need) => need.status === 'open').length,
    activeAlerts: alerts.length,
    activeCollaborations: operations.filter((operation) => operation.status === 'active').length,
    familiesReachedThisWeek: 0,
    gapsClosedThisWeek: 0,
    lastUpdated: Date.now(),
  };
}
