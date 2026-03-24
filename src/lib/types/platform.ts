// ============================================================
// Platform types for the Crisis Coordination Platform (Shabaka)
// 23 features — all data models
// ============================================================

// ---- Shared Enums ----

export type Sector =
  | 'food'
  | 'medical'
  | 'shelter'
  | 'psychosocial'
  | 'legal'
  | 'logistics'
  | 'wash'
  | 'education'
  | 'protection';

export type ActorType = 'ngo' | 'municipality' | 'grassroots' | 'shelter_org';

export type VerificationStatus = 'pending' | 'provisional' | 'verified' | 'suspended';

export type NeedUrgency = 'red' | 'amber' | 'gray';

export type StockLevel = 'low' | 'some' | 'good';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';

export type AlertStatus = 'active' | 'expired' | 'escalated';

export type CollabStatus = 'proposed' | 'accepted' | 'declined' | 'completed';

export type AssessmentStatus = 'active' | 'closed';

export type FeedbackType = 'food' | 'medical' | 'shelter' | 'psychosocial' | 'other';

export type NotificationChannel = 'push' | 'whatsapp' | 'sms' | 'all';

export type VisibilityLevel = 'public' | 'verified_peers' | 'private';

export type Region = 'beirut_suburbs' | 'south_lebanon' | 'bekaa_valley' | 'north_lebanon';

export type PlatformUserRole = 'actor_admin' | 'platform_admin';

// ---- Zone Types ----

export interface Zone {
  id: string;
  nameEn: string;
  nameAr: string;
  region: Region;
  lat: number;
  lng: number;
}

// ---- Platform Identity ----

export interface PlatformUser {
  id: string;
  email: string;
  displayName: string;
  role: PlatformUserRole;
  actorId?: string;
  actorName?: string;
  createdAt: number;
  updatedAt: number;
}

// ---- Feature 2: Actor Intake Form ----

export interface IntakeSubmission {
  id: string;
  organizationName: string;
  type: ActorType;
  sectors: Sector[];
  operationalZones: string[]; // zone ids
  contactName: string;
  contactPhone: string;
  contactWhatsapp?: string;
  language: 'ar' | 'en' | 'fr';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  duplicateOf?: string;
}

// ---- Feature 5: Actor Registry ----

export interface Actor {
  id: string;
  name: string;
  nameAr?: string;
  logo?: string;
  type: ActorType;
  sectors: Sector[];
  operationalZones: string[]; // zone ids
  officeAddress?: string;
  contactName: string;
  contactPhone: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  verificationStatus: VerificationStatus;
  vouchCount: number;
  vouchedBy: string[]; // actor ids
  lastUpdated: number;
  fieldTimestamps: Record<string, number>; // per-field freshness
  createdAt: number;
  notificationPreference: NotificationChannel;
  region: Region;
}

// ---- Feature 6: Capacity Cards ----

export interface ServiceToggle {
  serviceId: string;
  label: string;
  labelAr: string;
  active: boolean;
  updatedAt: number;
}

export interface ResourceCount {
  resourceId: string;
  label: string;
  labelAr: string;
  count: number;
  updatedAt: number;
}

export interface CapacityCard {
  id: string;
  actorId: string;
  actorName: string;
  actorNameAr?: string;
  zone: string;
  services: ServiceToggle[];
  resources: ResourceCount[];
  stockLevels: Record<string, StockLevel>;
  urgentNeeds: string[]; // from taxonomy
  note: string; // max 140 chars
  paused: boolean;
  lastUpdated: number;
  createdAt: number;
}

export interface CapacityChange {
  id: string;
  cardId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: number;
}

// ---- Feature 7: Peer Verification ----

export interface Vouch {
  id: string;
  voucherId: string; // actor who vouches
  voucherName: string;
  targetId: string; // actor being vouched for
  targetName: string;
  observedInField: boolean;
  coverageAccurate: boolean;
  willingToAssociate: boolean;
  createdAt: number;
}

export interface SuspensionReport {
  id: string;
  targetActorId: string;
  reportedBy: string; // actor id
  reason: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: number;
  resolvedAt?: number;
}

// ---- Feature 9: Needs Board ----

export interface NeedEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorNameAr?: string;
  category: Sector;
  description: string; // max 200 chars
  zone: string;
  urgency: NeedUrgency;
  canReceive: boolean;
  needsPickup: boolean;
  respondedCount: number;
  respondedBy: string[]; // actor ids
  status: 'open' | 'closed';
  closedAt?: number;
  autoFromCapacity: boolean; // true if auto-generated from capacity card
  createdAt: number;
  updatedAt: number;
}

export interface PatternAlert {
  id: string;
  category: Sector;
  zone: string;
  actorCount: number;
  actorIds: string[];
  type: 'systemic_gap' | 'collective_shortfall' | 'surplus';
  message: string;
  createdAt: number;
}

// ---- Feature 10: Live Map ----

export interface MapZoneData {
  zoneId: string;
  activeSectors: Sector[];
  actorCount: number;
  gaps: Sector[]; // sectors with zero coverage
  hasUrgencyAlert: boolean;
  freshness: 'fresh' | 'stale' | 'outdated';
}

// ---- Feature 11: Resource Tracker ----

export interface ZoneResource {
  zone: string;
  category: string;
  totalCount: number;
  actorBreakdown: { actorId: string; actorName: string; count: number; updatedAt: number }[];
  lastUpdated: number;
}

// ---- Feature 13: Urgency Alerts ----

export interface UrgencyAlert {
  id: string;
  actorId: string;
  actorName: string;
  category: Sector;
  description: string; // max 140 chars
  zone: string;
  status: AlertStatus;
  expiresAt: number; // 48h from creation
  escalated: boolean;
  relatedAlerts: string[];
  createdAt: number;
}

// ---- Feature 14: Collaboration Request System ----

export interface CollaborationRequest {
  id: string;
  fromActorId: string;
  fromActorName: string;
  toActorId: string;
  toActorName: string;
  needId?: string;
  offering: Sector;
  offeringDetail: string;
  timeframe: string;
  logistics: 'pickup' | 'delivery' | 'onsite';
  contactInfo: string;
  status: CollabStatus;
  createdAt: number;
  respondedAt?: number;
  jointOpId?: string;
}

export interface JointOperation {
  id: string;
  title: string;
  collaborationId: string;
  actorIds: string[];
  actorNames: string[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
  completedAt?: number;
}

// ---- Feature 15: Shared Task Board ----

export interface SharedTask {
  id: string;
  jointOpId: string;
  title: string; // max 100 chars
  claimedBy?: string; // actor id
  claimedByName?: string;
  dueDate?: number;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

// ---- Feature 16: Flash Assessment ----

export interface FlashAssessment {
  id: string;
  zone: string;
  triggeredBy: string; // actor id
  triggeredByName: string;
  status: AssessmentStatus;
  responsesCount: number;
  totalActorsInZone: number;
  snapshotReady: boolean;
  createdAt: number;
  closedAt?: number;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  actorId: string;
  displacedEstimate: number;
  topUnmetNeeds: Sector[];
  zeroCoverageSectors: Sector[];
  capacityReduced: boolean;
  surplusCapacity: boolean;
  surplusSectors?: Sector[];
  newMovements: boolean;
  newMovementZone?: string;
  accessConstraints: boolean;
  accessDescription?: string;
  urgentAlerts: boolean;
  urgentAlertText?: string;
  familiesReached: number;
  notes: string;
  submittedAt: number;
}

export interface AssessmentSnapshot {
  assessmentId: string;
  zone: string;
  totalResponses: number;
  avgDisplaced: number;
  topNeeds: { sector: Sector; count: number }[];
  zeroCoverage: { sector: Sector; count: number }[];
  reducedCapacityPct: number;
  surplusSectors: { sector: Sector; count: number }[];
  totalFamiliesReached: number;
  generatedAt: number;
}

// ---- Feature 17: Sector Planning & Gap Analysis ----

export interface SectorPlan {
  id: string;
  sector: Sector;
  zone: string;
  actorId: string;
  actorName: string;
  note: string;
  plannedStart?: string;
  createdAt: number;
}

export interface GapAnalysis {
  zone: string;
  sectorCoverage: { sector: Sector; actorCount: number }[];
  persistentNeeds: { sector: Sector; daysFlagged: number }[];
  collectiveShortfalls: { resource: string; actorsFlagged: number }[];
  surpluses: { resource: string; actorsWithSurplus: number; withinKm: number }[];
  generatedAt: number;
}

// ---- Feature 17b: Secure Messaging ----

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string; // encrypted
  attachments?: { name: string; url: string; type: string }[];
  readBy: string[];
  createdAt: number;
}

export interface MessageThread {
  id: string;
  type: '1to1' | 'group';
  participants: string[]; // actor ids
  participantNames: string[];
  jointOpId?: string;
  lastMessage?: string;
  lastMessageAt?: number;
  createdAt: number;
}

// ---- Feature 19: Community Feedback ----

export interface CommunityFeedback {
  id: string;
  serviceType: FeedbackType;
  zone: string;
  feedback: string; // max 300 chars
  language: 'ar' | 'en' | 'fr';
  routedToActorId?: string;
  discrepancyFlagged: boolean;
  createdAt: number;
}

// ---- Feature 20: Outcome Monitoring ----

export interface OutcomeReport {
  id: string;
  actorId: string;
  actorName: string;
  weekOf: string; // ISO week
  familiesReached: number;
  needsResolved: number;
  referralsCompleted: number;
  collaborationsCompleted: number;
  createdAt: number;
}

export interface NetworkOutcome {
  weekOf: string;
  totalFamilies: number;
  totalNeedsResolved: number;
  totalCollaborations: number;
  gapsClosed: number;
}

// ---- Feature 21: Advanced API v1 ----

export interface ApiKey {
  id: string;
  actorId: string;
  key: string;
  label: string;
  rateLimit: number;
  requestsToday: number;
  createdAt: number;
  lastUsed?: number;
}

// ---- Feature 22: Privacy Controls ----

export interface PrivacySettings {
  actorId: string;
  fieldVisibility: Record<string, VisibilityLevel>;
  offlineEnabled: boolean;
  lastSyncedAt?: number;
}

// ---- Feature 23: Multi-Region ----

export interface RegionConfig {
  id: Region;
  nameEn: string;
  nameAr: string;
  zones: string[];
  actorCount: number;
  lastUpdated: number;
}

// ---- Platform Stats ----

export interface PlatformStats {
  totalActors: number;
  verifiedActors: number;
  coverageGaps: number;
  sectorsMissing: number;
  activeNeeds: number;
  activeAlerts: number;
  activeCollaborations: number;
  familiesReachedThisWeek: number;
  gapsClosedThisWeek: number;
  lastUpdated: number;
}
