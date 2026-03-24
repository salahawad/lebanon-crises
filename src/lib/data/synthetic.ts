// ============================================================
// Synthetic data layer for all 23 platform features
// This is a LOCAL data source — does NOT touch Firebase
// All new platform features read from here
// ============================================================

import type {
  Actor, ActorType, CapacityCard, CapacityChange, Vouch,
  NeedEntry, NeedUrgency, UrgencyAlert, CollaborationRequest,
  JointOperation, SharedTask, FlashAssessment, AssessmentSnapshot,
  SectorPlan, GapAnalysis, Message, MessageThread, CommunityFeedback,
  OutcomeReport, NetworkOutcome, PatternAlert, PlatformStats,
  Sector, VerificationStatus, StockLevel, IntakeSubmission,
  MapZoneData, ZoneResource, Region,
} from '@/lib/types/platform';
import { ZONES } from './zones';

const DAY = 86400000;
const HOUR = 3600000;
const now = Date.now();

// ---- Actors (Feature 5) ----

export const ACTORS: Actor[] = [
  {
    id: 'a1', name: 'Amel Association', nameAr: 'جمعية أمل', type: 'ngo',
    sectors: ['medical', 'psychosocial', 'education'],
    operationalZones: ['bourj_hammoud', 'dekwaneh', 'sabra'],
    contactName: 'Dr. Karim Makdisi', contactPhone: '+961 1 300 005', contactWhatsapp: '+961 71 300 005',
    contactEmail: 'info@amel.org', verificationStatus: 'verified', vouchCount: 5,
    vouchedBy: ['a2', 'a3', 'a5', 'a7', 'a10'],
    lastUpdated: now - 1 * DAY, fieldTimestamps: {}, createdAt: now - 90 * DAY,
    notificationPreference: 'whatsapp', region: 'beirut_suburbs', logo: undefined,
  },
  {
    id: 'a2', name: 'Arcenciel', nameAr: 'قوس قزح', type: 'ngo',
    sectors: ['medical', 'logistics', 'wash'],
    operationalZones: ['sin_el_fil', 'bourj_hammoud', 'dekwaneh'],
    contactName: 'Nadia Haddad', contactPhone: '+961 1 496 401', contactWhatsapp: '+961 70 496 401',
    contactEmail: 'contact@arcenciel.org', verificationStatus: 'verified', vouchCount: 4,
    vouchedBy: ['a1', 'a3', 'a5', 'a8'],
    lastUpdated: now - 2 * DAY, fieldTimestamps: {}, createdAt: now - 85 * DAY,
    notificationPreference: 'all', region: 'beirut_suburbs', logo: undefined,
  },
  {
    id: 'a3', name: 'Bourj Hammoud Municipality', nameAr: 'بلدية برج حمود', type: 'municipality',
    sectors: ['logistics', 'shelter', 'food'],
    operationalZones: ['bourj_hammoud'],
    contactName: 'Antoine Agopian', contactPhone: '+961 1 260 260', contactWhatsapp: '+961 76 260 260',
    contactEmail: 'info@bourjhammoud.gov.lb', verificationStatus: 'verified', vouchCount: 6,
    vouchedBy: ['a1', 'a2', 'a5', 'a6', 'a7', 'a10'],
    lastUpdated: now - 0.5 * DAY, fieldTimestamps: {}, createdAt: now - 88 * DAY,
    notificationPreference: 'whatsapp', region: 'beirut_suburbs', logo: undefined,
  },
  {
    id: 'a4', name: 'Wajd Beirut', nameAr: 'وجد بيروت', type: 'grassroots',
    sectors: ['food', 'logistics'],
    operationalZones: ['dekwaneh', 'sin_el_fil', 'bourj_hammoud'],
    contactName: 'Lina Sarkis', contactPhone: '+961 3 556 789',
    verificationStatus: 'verified', vouchCount: 3, vouchedBy: ['a1', 'a3', 'a6'],
    lastUpdated: now - 3 * DAY, fieldTimestamps: {}, createdAt: now - 60 * DAY,
    notificationPreference: 'sms', region: 'beirut_suburbs', logo: undefined,
  },
  {
    id: 'a5', name: 'YWCA Lebanon', nameAr: 'جمعية الشابات المسيحيات', type: 'ngo',
    sectors: ['psychosocial', 'protection', 'education'],
    operationalZones: ['hamra', 'achrafieh', 'mar_elias'],
    contactName: 'Ghida Anani', contactPhone: '+961 1 345 678',
    verificationStatus: 'verified', vouchCount: 4, vouchedBy: ['a1', 'a2', 'a7', 'a10'],
    lastUpdated: now - 1.5 * DAY, fieldTimestamps: {}, createdAt: now - 80 * DAY,
    notificationPreference: 'push', region: 'beirut_suburbs', logo: undefined,
  },
  {
    id: 'a6', name: 'Haret Hreik Food Kitchen', nameAr: 'مطبخ حارة حريك', type: 'grassroots',
    sectors: ['food'],
    operationalZones: ['haret_hreik', 'dahieh', 'jnah'],
    contactName: 'Ahmad Nasrallah', contactPhone: '+961 3 890 123',
    verificationStatus: 'verified', vouchCount: 3, vouchedBy: ['a3', 'a4', 'a8'],
    lastUpdated: now - 5 * DAY, fieldTimestamps: {}, createdAt: now - 55 * DAY,
    notificationPreference: 'whatsapp', region: 'beirut_suburbs', logo: undefined,
  },
  {
    id: 'a7', name: 'Saida Relief Network', nameAr: 'شبكة إغاثة صيدا', type: 'ngo',
    sectors: ['food', 'medical', 'shelter'],
    operationalZones: ['saida'],
    contactName: 'Hala Othman', contactPhone: '+961 7 720 500',
    verificationStatus: 'verified', vouchCount: 3, vouchedBy: ['a1', 'a5', 'a10'],
    lastUpdated: now - 2 * DAY, fieldTimestamps: {}, createdAt: now - 70 * DAY,
    notificationPreference: 'all', region: 'south_lebanon', logo: undefined,
  },
  {
    id: 'a8', name: 'Sour Community Center', nameAr: 'مركز صور المجتمعي', type: 'grassroots',
    sectors: ['shelter', 'psychosocial'],
    operationalZones: ['sour'],
    contactName: 'Fatima Jaber', contactPhone: '+961 7 741 200',
    verificationStatus: 'provisional', vouchCount: 1, vouchedBy: ['a7'],
    lastUpdated: now - 4 * DAY, fieldTimestamps: {}, createdAt: now - 30 * DAY,
    notificationPreference: 'sms', region: 'south_lebanon', logo: undefined,
  },
  {
    id: 'a9', name: 'Zahle Medical Relief', nameAr: 'إغاثة زحلة الطبية', type: 'ngo',
    sectors: ['medical', 'wash'],
    operationalZones: ['zahle', 'chtaura', 'bar_elias'],
    contactName: 'Dr. Michel Khoury', contactPhone: '+961 8 800 123',
    verificationStatus: 'verified', vouchCount: 3, vouchedBy: ['a1', 'a10', 'a11'],
    lastUpdated: now - 1 * DAY, fieldTimestamps: {}, createdAt: now - 65 * DAY,
    notificationPreference: 'whatsapp', region: 'bekaa_valley', logo: undefined,
  },
  {
    id: 'a10', name: 'Tripoli Aid Hub', nameAr: 'مركز طرابلس للمساعدة', type: 'ngo',
    sectors: ['food', 'shelter', 'education'],
    operationalZones: ['tripoli', 'mina'],
    contactName: 'Omar Mawlawi', contactPhone: '+961 6 431 200',
    verificationStatus: 'verified', vouchCount: 4, vouchedBy: ['a1', 'a5', 'a7', 'a11'],
    lastUpdated: now - 2 * DAY, fieldTimestamps: {}, createdAt: now - 75 * DAY,
    notificationPreference: 'all', region: 'north_lebanon', logo: undefined,
  },
  {
    id: 'a11', name: 'Baalbek Emergency Shelter', nameAr: 'مأوى بعلبك الطارئ', type: 'shelter_org',
    sectors: ['shelter', 'food'],
    operationalZones: ['baalbek', 'hermel'],
    contactName: 'Rania Hariri', contactPhone: '+961 8 370 400',
    verificationStatus: 'verified', vouchCount: 3, vouchedBy: ['a9', 'a10', 'a1'],
    lastUpdated: now - 3 * DAY, fieldTimestamps: {}, createdAt: now - 50 * DAY,
    notificationPreference: 'sms', region: 'bekaa_valley', logo: undefined,
  },
  {
    id: 'a12', name: 'Dekwaneh Women\'s Initiative', nameAr: 'مبادرة نساء الدكوانة', type: 'grassroots',
    sectors: ['psychosocial', 'protection'],
    operationalZones: ['dekwaneh', 'bourj_hammoud'],
    contactName: 'Maya Chamoun', contactPhone: '+961 3 667 890',
    verificationStatus: 'pending', vouchCount: 0, vouchedBy: [],
    lastUpdated: now - 1 * DAY, fieldTimestamps: {}, createdAt: now - 5 * DAY,
    notificationPreference: 'whatsapp', region: 'beirut_suburbs', logo: undefined,
  },
  {
    id: 'a13', name: 'Nabatieh Relief Committee', nameAr: 'لجنة إغاثة النبطية', type: 'municipality',
    sectors: ['food', 'logistics', 'wash'],
    operationalZones: ['nabatieh', 'marjayoun'],
    contactName: 'Hassan Mroue', contactPhone: '+961 7 760 100',
    verificationStatus: 'provisional', vouchCount: 1, vouchedBy: ['a7'],
    lastUpdated: now - 8 * DAY, fieldTimestamps: {}, createdAt: now - 20 * DAY,
    notificationPreference: 'sms', region: 'south_lebanon', logo: undefined,
  },
  {
    id: 'a14', name: 'Akkar Food Bank', nameAr: 'بنك طعام عكار', type: 'ngo',
    sectors: ['food'],
    operationalZones: ['akkar_town', 'halba'],
    contactName: 'Bilal Itani', contactPhone: '+961 6 690 200',
    verificationStatus: 'verified', vouchCount: 3, vouchedBy: ['a10', 'a1', 'a5'],
    lastUpdated: now - 15 * DAY, fieldTimestamps: {}, createdAt: now - 45 * DAY,
    notificationPreference: 'whatsapp', region: 'north_lebanon', logo: undefined,
  },
];

// ---- Capacity Cards (Feature 6) ----

export const CAPACITY_CARDS: CapacityCard[] = [
  {
    id: 'cc1', actorId: 'a1', actorName: 'Amel Association', actorNameAr: 'جمعية أمل',
    zone: 'bourj_hammoud',
    services: [
      { serviceId: 'consultations', label: 'Medical Consultations', labelAr: 'استشارات طبية', active: true, updatedAt: now - 1 * DAY },
      { serviceId: 'medications', label: 'Medication Distribution', labelAr: 'توزيع أدوية', active: true, updatedAt: now - 1 * DAY },
      { serviceId: 'counseling', label: 'Psychosocial Counseling', labelAr: 'إرشاد نفسي', active: true, updatedAt: now - 2 * DAY },
    ],
    resources: [
      { resourceId: 'medical_staff', label: 'Medical Staff', labelAr: 'طاقم طبي', count: 3, updatedAt: now - 1 * DAY },
      { resourceId: 'consult_slots', label: 'Consultation Slots', labelAr: 'مواعيد استشارة', count: 8, updatedAt: now - 1 * DAY },
    ],
    stockLevels: { medication: 'some', bandages: 'good', antibiotics: 'low' },
    urgentNeeds: ['antibiotics'], note: '', paused: false,
    lastUpdated: now - 1 * DAY, createdAt: now - 80 * DAY,
  },
  {
    id: 'cc2', actorId: 'a2', actorName: 'Arcenciel', actorNameAr: 'قوس قزح',
    zone: 'sin_el_fil',
    services: [
      { serviceId: 'wound_care', label: 'Wound Dressing', labelAr: 'تضميد جروح', active: true, updatedAt: now - 2 * DAY },
      { serviceId: 'transport', label: 'Medical Transport', labelAr: 'نقل طبي', active: true, updatedAt: now - 2 * DAY },
      { serviceId: 'water', label: 'Water Distribution', labelAr: 'توزيع مياه', active: false, updatedAt: now - 5 * DAY },
    ],
    resources: [
      { resourceId: 'vehicles', label: 'Vehicles', labelAr: 'مركبات', count: 2, updatedAt: now - 2 * DAY },
      { resourceId: 'drivers', label: 'Drivers', labelAr: 'سائقون', count: 3, updatedAt: now - 2 * DAY },
    ],
    stockLevels: { medication: 'good', supplies: 'some' },
    urgentNeeds: [], note: '', paused: false,
    lastUpdated: now - 2 * DAY, createdAt: now - 75 * DAY,
  },
  {
    id: 'cc3', actorId: 'a3', actorName: 'Bourj Hammoud Municipality', actorNameAr: 'بلدية برج حمود',
    zone: 'bourj_hammoud',
    services: [
      { serviceId: 'shelter_beds', label: 'Shelter Beds', labelAr: 'أسرّة مأوى', active: true, updatedAt: now - 0.5 * DAY },
      { serviceId: 'food_parcels', label: 'Food Parcel Distribution', labelAr: 'توزيع طرود غذائية', active: true, updatedAt: now - 0.5 * DAY },
      { serviceId: 'logistics_support', label: 'Logistics Coordination', labelAr: 'تنسيق لوجستي', active: true, updatedAt: now - 1 * DAY },
    ],
    resources: [
      { resourceId: 'shelter_beds', label: 'Available Beds', labelAr: 'أسرّة متاحة', count: 18, updatedAt: now - 0.5 * DAY },
      { resourceId: 'food_parcels', label: 'Food Parcels', labelAr: 'طرود غذائية', count: 45, updatedAt: now - 0.5 * DAY },
      { resourceId: 'volunteers', label: 'Volunteers', labelAr: 'متطوعون', count: 12, updatedAt: now - 1 * DAY },
    ],
    stockLevels: { food: 'good', blankets: 'some', hygiene_kits: 'low' },
    urgentNeeds: ['hygiene_kits'], note: 'Active distribution every Saturday', paused: false,
    lastUpdated: now - 0.5 * DAY, createdAt: now - 80 * DAY,
  },
  {
    id: 'cc4', actorId: 'a4', actorName: 'Wajd Beirut', actorNameAr: 'وجد بيروت',
    zone: 'dekwaneh',
    services: [
      { serviceId: 'hot_meals', label: 'Hot Meals', labelAr: 'وجبات ساخنة', active: true, updatedAt: now - 3 * DAY },
      { serviceId: 'transport', label: 'Transport', labelAr: 'نقل', active: true, updatedAt: now - 3 * DAY },
    ],
    resources: [
      { resourceId: 'vehicles', label: 'Vehicles', labelAr: 'مركبات', count: 1, updatedAt: now - 3 * DAY },
      { resourceId: 'volunteers', label: 'Volunteers', labelAr: 'متطوعون', count: 6, updatedAt: now - 3 * DAY },
    ],
    stockLevels: { food: 'some' },
    urgentNeeds: [], note: '', paused: false,
    lastUpdated: now - 3 * DAY, createdAt: now - 50 * DAY,
  },
  {
    id: 'cc5', actorId: 'a7', actorName: 'Saida Relief Network', actorNameAr: 'شبكة إغاثة صيدا',
    zone: 'saida',
    services: [
      { serviceId: 'consultations', label: 'Medical Consultations', labelAr: 'استشارات طبية', active: true, updatedAt: now - 2 * DAY },
      { serviceId: 'food_parcels', label: 'Food Distribution', labelAr: 'توزيع طعام', active: true, updatedAt: now - 2 * DAY },
      { serviceId: 'shelter_beds', label: 'Shelter Beds', labelAr: 'أسرّة مأوى', active: true, updatedAt: now - 2 * DAY },
    ],
    resources: [
      { resourceId: 'medical_staff', label: 'Medical Staff', labelAr: 'طاقم طبي', count: 2, updatedAt: now - 2 * DAY },
      { resourceId: 'shelter_beds', label: 'Beds', labelAr: 'أسرّة', count: 12, updatedAt: now - 2 * DAY },
      { resourceId: 'food_parcels', label: 'Food Parcels', labelAr: 'طرود غذائية', count: 30, updatedAt: now - 2 * DAY },
    ],
    stockLevels: { medication: 'low', food: 'some', blankets: 'good' },
    urgentNeeds: ['baby_formula'], note: 'Urgent: baby formula needed', paused: false,
    lastUpdated: now - 2 * DAY, createdAt: now - 60 * DAY,
  },
  {
    id: 'cc6', actorId: 'a9', actorName: 'Zahle Medical Relief', actorNameAr: 'إغاثة زحلة الطبية',
    zone: 'zahle',
    services: [
      { serviceId: 'consultations', label: 'Medical Consultations', labelAr: 'استشارات طبية', active: true, updatedAt: now - 1 * DAY },
      { serviceId: 'water', label: 'Water Distribution', labelAr: 'توزيع مياه', active: true, updatedAt: now - 1 * DAY },
    ],
    resources: [
      { resourceId: 'medical_staff', label: 'Medical Staff', labelAr: 'طاقم طبي', count: 4, updatedAt: now - 1 * DAY },
    ],
    stockLevels: { medication: 'good', water: 'some' },
    urgentNeeds: [], note: '', paused: false,
    lastUpdated: now - 1 * DAY, createdAt: now - 55 * DAY,
  },
  {
    id: 'cc7', actorId: 'a10', actorName: 'Tripoli Aid Hub', actorNameAr: 'مركز طرابلس للمساعدة',
    zone: 'tripoli',
    services: [
      { serviceId: 'food_parcels', label: 'Food Distribution', labelAr: 'توزيع طعام', active: true, updatedAt: now - 2 * DAY },
      { serviceId: 'shelter_beds', label: 'Shelter Beds', labelAr: 'أسرّة مأوى', active: true, updatedAt: now - 2 * DAY },
      { serviceId: 'tutoring', label: 'Tutoring', labelAr: 'دروس خصوصية', active: true, updatedAt: now - 4 * DAY },
    ],
    resources: [
      { resourceId: 'shelter_beds', label: 'Beds', labelAr: 'أسرّة', count: 25, updatedAt: now - 2 * DAY },
      { resourceId: 'volunteers', label: 'Volunteers', labelAr: 'متطوعون', count: 34, updatedAt: now - 3 * DAY },
      { resourceId: 'food_parcels', label: 'Food Parcels', labelAr: 'طرود غذائية', count: 80, updatedAt: now - 2 * DAY },
    ],
    stockLevels: { food: 'good', blankets: 'some' },
    urgentNeeds: [], note: '', paused: false,
    lastUpdated: now - 2 * DAY, createdAt: now - 65 * DAY,
  },
  {
    id: 'cc8', actorId: 'a11', actorName: 'Baalbek Emergency Shelter', actorNameAr: 'مأوى بعلبك الطارئ',
    zone: 'baalbek',
    services: [
      { serviceId: 'shelter_beds', label: 'Emergency Shelter', labelAr: 'مأوى طوارئ', active: true, updatedAt: now - 3 * DAY },
      { serviceId: 'food_parcels', label: 'Food Distribution', labelAr: 'توزيع طعام', active: true, updatedAt: now - 3 * DAY },
    ],
    resources: [
      { resourceId: 'shelter_beds', label: 'Beds', labelAr: 'أسرّة', count: 40, updatedAt: now - 3 * DAY },
      { resourceId: 'food_parcels', label: 'Food Parcels', labelAr: 'طرود غذائية', count: 60, updatedAt: now - 3 * DAY },
    ],
    stockLevels: { food: 'some', blankets: 'low' },
    urgentNeeds: ['blankets'], note: 'Running low on blankets', paused: false,
    lastUpdated: now - 3 * DAY, createdAt: now - 40 * DAY,
  },
];

// ---- Capacity Changes (Feature 12) ----

export const CAPACITY_CHANGES: CapacityChange[] = [
  { id: 'ch1', cardId: 'cc3', field: 'Transport', oldValue: '3 vehicles', newValue: '3 + 1 vehicle', changedAt: now - 0.5 * DAY },
  { id: 'ch2', cardId: 'cc3', field: 'Volunteers', oldValue: '24', newValue: '12', changedAt: now - 3 * DAY },
  { id: 'ch3', cardId: 'cc3', field: 'Food Parcels', oldValue: 'Restored', newValue: 'Restored', changedAt: now - 7 * DAY },
  { id: 'ch4', cardId: 'cc1', field: 'Antibiotics', oldValue: 'Some', newValue: 'Low', changedAt: now - 1 * DAY },
  { id: 'ch5', cardId: 'cc5', field: 'Baby Formula', oldValue: 'Some', newValue: 'Low', changedAt: now - 2 * DAY },
];

// ---- Vouches (Feature 7) ----

export const VOUCHES: Vouch[] = [
  { id: 'v1', voucherId: 'a2', voucherName: 'Arcenciel', targetId: 'a1', targetName: 'Amel Association', observedInField: true, coverageAccurate: true, willingToAssociate: true, createdAt: now - 85 * DAY },
  { id: 'v2', voucherId: 'a3', voucherName: 'Bourj Hammoud Municipality', targetId: 'a1', targetName: 'Amel Association', observedInField: true, coverageAccurate: true, willingToAssociate: true, createdAt: now - 84 * DAY },
  { id: 'v3', voucherId: 'a1', voucherName: 'Amel Association', targetId: 'a2', targetName: 'Arcenciel', observedInField: true, coverageAccurate: true, willingToAssociate: true, createdAt: now - 83 * DAY },
  { id: 'v4', voucherId: 'a1', voucherName: 'Amel Association', targetId: 'a3', targetName: 'Bourj Hammoud Municipality', observedInField: true, coverageAccurate: true, willingToAssociate: true, createdAt: now - 82 * DAY },
  { id: 'v5', voucherId: 'a7', voucherName: 'Saida Relief Network', targetId: 'a8', targetName: 'Sour Community Center', observedInField: true, coverageAccurate: true, willingToAssociate: true, createdAt: now - 28 * DAY },
];

// ---- Needs Board (Feature 9) ----

export const NEEDS: NeedEntry[] = [
  { id: 'n1', actorId: 'a1', actorName: 'Amel Association', actorNameAr: 'جمعية أمل', category: 'medical', description: 'Antibiotics completely out. 200 patients/week with no alternative.', zone: 'bourj_hammoud', urgency: 'red', canReceive: true, needsPickup: false, respondedCount: 0, respondedBy: [], status: 'open', autoFromCapacity: true, createdAt: now - 3 * HOUR, updatedAt: now - 3 * HOUR },
  { id: 'n2', actorId: 'a7', actorName: 'Saida Relief Network', actorNameAr: 'شبكة إغاثة صيدا', category: 'food', description: 'Baby formula urgently needed — Mar Elias distribution point', zone: 'saida', urgency: 'red', canReceive: true, needsPickup: false, respondedCount: 0, respondedBy: [], status: 'open', autoFromCapacity: true, createdAt: now - 1 * DAY, updatedAt: now - 1 * DAY },
  { id: 'n3', actorId: 'a5', actorName: 'YWCA Lebanon', actorNameAr: 'جمعية الشابات المسيحيات', category: 'psychosocial', description: 'Need volunteer psychologist for group sessions — 3 days/week', zone: 'hamra', urgency: 'amber', canReceive: false, needsPickup: false, respondedCount: 1, respondedBy: ['a1'], status: 'open', autoFromCapacity: false, createdAt: now - 4 * DAY, updatedAt: now - 2 * DAY },
  { id: 'n4', actorId: 'a11', actorName: 'Baalbek Emergency Shelter', actorNameAr: 'مأوى بعلبك الطارئ', category: 'shelter', description: 'Running critically low on blankets — 40 families in shelter', zone: 'baalbek', urgency: 'red', canReceive: true, needsPickup: false, respondedCount: 0, respondedBy: [], status: 'open', autoFromCapacity: true, createdAt: now - 1 * DAY, updatedAt: now - 1 * DAY },
  { id: 'n5', actorId: 'a4', actorName: 'Wajd Beirut', actorNameAr: 'وجد بيروت', category: 'logistics', description: 'Need additional vehicle for Dekwaneh food distribution — 2 days/week', zone: 'dekwaneh', urgency: 'amber', canReceive: false, needsPickup: false, respondedCount: 0, respondedBy: [], status: 'open', autoFromCapacity: false, createdAt: now - 5 * DAY, updatedAt: now - 5 * DAY },
  { id: 'n6', actorId: 'a10', actorName: 'Tripoli Aid Hub', actorNameAr: 'مركز طرابلس للمساعدة', category: 'education', description: 'English/French tutors needed for displaced children', zone: 'tripoli', urgency: 'gray', canReceive: false, needsPickup: false, respondedCount: 2, respondedBy: ['a14', 'a5'], status: 'open', autoFromCapacity: false, createdAt: now - 10 * DAY, updatedAt: now - 3 * DAY },
  { id: 'n7', actorId: 'a6', actorName: 'Haret Hreik Food Kitchen', actorNameAr: 'مطبخ حارة حريك', category: 'food', description: 'Rice and lentils supply running low — serves 300 families/day', zone: 'haret_hreik', urgency: 'amber', canReceive: true, needsPickup: false, respondedCount: 1, respondedBy: ['a3'], status: 'open', autoFromCapacity: true, createdAt: now - 2 * DAY, updatedAt: now - 1 * DAY },
  { id: 'n8', actorId: 'a9', actorName: 'Zahle Medical Relief', actorNameAr: 'إغاثة زحلة الطبية', category: 'wash', description: 'Hygiene kits needed for 150 families in informal settlements', zone: 'zahle', urgency: 'amber', canReceive: true, needsPickup: false, respondedCount: 0, respondedBy: [], status: 'open', autoFromCapacity: false, createdAt: now - 3 * DAY, updatedAt: now - 3 * DAY },
  { id: 'n9', actorId: 'a13', actorName: 'Nabatieh Relief Committee', actorNameAr: 'لجنة إغاثة النبطية', category: 'food', description: 'No supply for 2 weeks — critical food shortage', zone: 'nabatieh', urgency: 'red', canReceive: true, needsPickup: true, respondedCount: 0, respondedBy: [], status: 'open', autoFromCapacity: false, createdAt: now - 6 * HOUR, updatedAt: now - 6 * HOUR },
  { id: 'n10', actorId: 'a3', actorName: 'Bourj Hammoud Municipality', actorNameAr: 'بلدية برج حمود', category: 'medical', description: 'Chronic disease medications — diabetes and blood pressure', zone: 'bourj_hammoud', urgency: 'amber', canReceive: true, needsPickup: false, respondedCount: 1, respondedBy: ['a1'], status: 'open', autoFromCapacity: false, createdAt: now - 4 * DAY, updatedAt: now - 2 * DAY },
  { id: 'n11', actorId: 'a8', actorName: 'Sour Community Center', actorNameAr: 'مركز صور المجتمعي', category: 'psychosocial', description: 'Trauma support for children — experienced counselors needed', zone: 'sour', urgency: 'amber', canReceive: false, needsPickup: false, respondedCount: 0, respondedBy: [], status: 'open', autoFromCapacity: false, createdAt: now - 7 * DAY, updatedAt: now - 7 * DAY },
];

// ---- Pattern Alerts ----

export const PATTERN_ALERTS: PatternAlert[] = [
  { id: 'pa1', category: 'food', zone: 'bourj_hammoud', actorCount: 3, actorIds: ['a3', 'a4', 'a6'], type: 'systemic_gap', message: '3 actors flagged food needs in Bourj Hammoud within 7 days', createdAt: now - 1 * DAY },
  { id: 'pa2', category: 'medical', zone: 'bourj_hammoud', actorCount: 2, actorIds: ['a1', 'a3'], type: 'collective_shortfall', message: 'Medication stock flagged as Low by 2 actors', createdAt: now - 2 * DAY },
];

// ---- Urgency Alerts (Feature 13) ----

export const URGENCY_ALERTS: UrgencyAlert[] = [
  { id: 'ua1', actorId: 'a1', actorName: 'Amel Association', category: 'medical', description: 'Antibiotics completely out. 200 patients/week with no alternative.', zone: 'bourj_hammoud', status: 'active', expiresAt: now + 45 * HOUR, escalated: false, relatedAlerts: [], createdAt: now - 3 * HOUR },
  { id: 'ua2', actorId: 'a13', actorName: 'Nabatieh Relief Committee', category: 'food', description: 'No food supply for 2 weeks — critical shortage affecting 500+ families', zone: 'nabatieh', status: 'active', expiresAt: now + 42 * HOUR, escalated: true, relatedAlerts: ['ua3'], createdAt: now - 6 * HOUR },
  { id: 'ua3', actorId: 'a7', actorName: 'Saida Relief Network', category: 'food', description: 'Baby formula completely out — no supply yet', zone: 'saida', status: 'active', expiresAt: now + 24 * HOUR, escalated: false, relatedAlerts: [], createdAt: now - 24 * HOUR },
];

// ---- Collaboration Requests (Feature 14) ----

export const COLLABORATIONS: CollaborationRequest[] = [
  { id: 'col1', fromActorId: 'a4', fromActorName: 'Wajd Beirut', toActorId: 'a2', toActorName: 'Arcenciel', needId: 'n5', offering: 'logistics', offeringDetail: 'Can provide vehicle + driver for 2 days/week', timeframe: 'Ongoing', logistics: 'onsite', contactInfo: '+961 3 556 789', status: 'accepted', createdAt: now - 4 * DAY, respondedAt: now - 3 * DAY, jointOpId: 'jo1' },
  { id: 'col2', fromActorId: 'a3', fromActorName: 'Bourj Hammoud Municipality', toActorId: 'a6', toActorName: 'Haret Hreik Food Kitchen', needId: 'n7', offering: 'food', offeringDetail: 'Can supply rice and lentils from municipal reserves', timeframe: 'This week', logistics: 'delivery', contactInfo: '+961 76 260 260', status: 'accepted', createdAt: now - 1 * DAY, respondedAt: now - 0.5 * DAY, jointOpId: 'jo2' },
  { id: 'col3', fromActorId: 'a9', fromActorName: 'Zahle Medical Relief', toActorId: 'a1', toActorName: 'Amel Association', offering: 'medical', offeringDetail: 'Have surplus medication supply — can share antibiotics', timeframe: 'Immediate', logistics: 'pickup', contactInfo: '+961 8 800 123', status: 'proposed', createdAt: now - 2 * HOUR },
];

// ---- Joint Operations (Feature 14) ----

export const JOINT_OPERATIONS: JointOperation[] = [
  { id: 'jo1', title: 'Dekwaneh Food Distribution Transport', collaborationId: 'col1', actorIds: ['a4', 'a2'], actorNames: ['Wajd Beirut', 'Arcenciel'], status: 'active', createdAt: now - 3 * DAY },
  { id: 'jo2', title: 'Haret Hreik Rice & Lentils Supply', collaborationId: 'col2', actorIds: ['a3', 'a6'], actorNames: ['Bourj Hammoud Municipality', 'Haret Hreik Food Kitchen'], status: 'active', createdAt: now - 0.5 * DAY },
];

// ---- Shared Tasks (Feature 15) ----

export const SHARED_TASKS: SharedTask[] = [
  { id: 'st1', jointOpId: 'jo1', title: 'Confirm pickup time', claimedBy: 'a4', claimedByName: 'Wajd', dueDate: now + 1 * DAY, status: 'todo', createdAt: now - 2 * DAY, updatedAt: now - 2 * DAY },
  { id: 'st2', jointOpId: 'jo1', title: 'Pack medication', claimedBy: 'a2', claimedByName: 'Arcenciel', status: 'in_progress', createdAt: now - 2 * DAY, updatedAt: now - 1 * DAY },
  { id: 'st3', jointOpId: 'jo1', title: 'Route agreed', claimedBy: 'a4', claimedByName: 'Both', status: 'completed', createdAt: now - 3 * DAY, updatedAt: now - 2 * DAY },
  { id: 'st4', jointOpId: 'jo2', title: 'Arrange delivery vehicle', claimedBy: 'a3', claimedByName: 'Bourj Hammoud Municipality', status: 'todo', createdAt: now - 0.5 * DAY, updatedAt: now - 0.5 * DAY },
  { id: 'st5', jointOpId: 'jo2', title: 'Prepare storage space', claimedBy: 'a6', claimedByName: 'Haret Hreik Food Kitchen', status: 'in_progress', createdAt: now - 0.5 * DAY, updatedAt: now - 0.25 * DAY },
];

// ---- Flash Assessment (Feature 16) ----

export const FLASH_ASSESSMENTS: FlashAssessment[] = [
  { id: 'fa1', zone: 'bourj_hammoud', triggeredBy: 'a3', triggeredByName: 'Bourj Hammoud Municipality', status: 'closed', responsesCount: 4, totalActorsInZone: 5, snapshotReady: true, createdAt: now - 2 * DAY, closedAt: now - 1.5 * DAY },
];

export const ASSESSMENT_SNAPSHOTS: AssessmentSnapshot[] = [
  { assessmentId: 'fa1', zone: 'bourj_hammoud', totalResponses: 4, avgDisplaced: 850, topNeeds: [{ sector: 'medical', count: 3 }, { sector: 'food', count: 3 }, { sector: 'psychosocial', count: 2 }], zeroCoverage: [{ sector: 'psychosocial', count: 3 }, { sector: 'legal', count: 4 }], reducedCapacityPct: 50, surplusSectors: [{ sector: 'logistics', count: 1 }], totalFamiliesReached: 420, generatedAt: now - 1.5 * DAY },
];

// ---- Sector Planning (Feature 17) ----

export const SECTOR_PLANS: SectorPlan[] = [
  { id: 'sp1', sector: 'food', zone: 'tarik_jdide', actorId: 'a4', actorName: 'Wajd Beirut', note: 'Plan to cover Tarik Jdide starting next week', plannedStart: '2026-03-30', createdAt: now - 2 * DAY },
  { id: 'sp2', sector: 'medical', zone: 'dekwaneh', actorId: 'a1', actorName: 'Amel Association', note: 'Expanding mobile clinic to Dekwaneh — 2 days/week', plannedStart: '2026-04-01', createdAt: now - 3 * DAY },
];

export const GAP_ANALYSES: GapAnalysis[] = [
  {
    zone: 'bourj_hammoud',
    sectorCoverage: [{ sector: 'food', actorCount: 4 }, { sector: 'medical', actorCount: 2 }, { sector: 'shelter', actorCount: 1 }, { sector: 'psychosocial', actorCount: 0 }, { sector: 'logistics', actorCount: 2 }, { sector: 'legal', actorCount: 0 }, { sector: 'wash', actorCount: 1 }, { sector: 'education', actorCount: 1 }, { sector: 'protection', actorCount: 0 }],
    persistentNeeds: [{ sector: 'medical', daysFlagged: 12 }, { sector: 'psychosocial', daysFlagged: 8 }],
    collectiveShortfalls: [{ resource: 'Medication stock', actorsFlagged: 2 }],
    surpluses: [{ resource: 'Medical supplies', actorsWithSurplus: 3, withinKm: 5 }],
    generatedAt: now - 1 * DAY,
  },
];

// ---- Messages (Feature 17b) ----

export const MESSAGE_THREADS: MessageThread[] = [
  { id: 'mt1', type: '1to1', participants: ['a1', 'a9'], participantNames: ['Amel Association', 'Zahle Medical Relief'], lastMessage: 'We can send 500 units of amoxicillin tomorrow', lastMessageAt: now - 2 * HOUR, createdAt: now - 5 * HOUR },
  { id: 'mt2', type: 'group', participants: ['a3', 'a4', 'a6'], participantNames: ['Bourj Hammoud Municipality', 'Wajd Beirut', 'Haret Hreik Food Kitchen'], jointOpId: 'jo2', lastMessage: 'Delivery confirmed for Saturday 10am', lastMessageAt: now - 30 * 60000, createdAt: now - 1 * DAY },
  { id: 'mt3', type: '1to1', participants: ['a5', 'a1'], participantNames: ['YWCA Lebanon', 'Amel Association'], lastMessage: 'Can your counselor join our Thursday sessions?', lastMessageAt: now - 1 * DAY, createdAt: now - 3 * DAY },
];

export const MESSAGES: Message[] = [
  { id: 'm1', threadId: 'mt1', senderId: 'a9', senderName: 'Zahle Medical Relief', content: 'We have surplus antibiotics — amoxicillin and azithromycin', readBy: ['a9', 'a1'], createdAt: now - 4 * HOUR },
  { id: 'm2', threadId: 'mt1', senderId: 'a1', senderName: 'Amel Association', content: 'That would save us! How many units can you spare?', readBy: ['a1', 'a9'], createdAt: now - 3 * HOUR },
  { id: 'm3', threadId: 'mt1', senderId: 'a9', senderName: 'Zahle Medical Relief', content: 'We can send 500 units of amoxicillin tomorrow', readBy: ['a9'], createdAt: now - 2 * HOUR },
  { id: 'm4', threadId: 'mt2', senderId: 'a3', senderName: 'Bourj Hammoud Municipality', content: 'Rice delivery arranged — 200kg arriving Saturday', readBy: ['a3', 'a4', 'a6'], createdAt: now - 2 * HOUR },
  { id: 'm5', threadId: 'mt2', senderId: 'a6', senderName: 'Haret Hreik Food Kitchen', content: 'Delivery confirmed for Saturday 10am', readBy: ['a6'], createdAt: now - 30 * 60000 },
];

// ---- Community Feedback (Feature 19) ----

export const COMMUNITY_FEEDBACK: CommunityFeedback[] = [
  { id: 'cf1', serviceType: 'food', zone: 'bourj_hammoud', feedback: 'Food distribution stopped 2 weeks ago but it\'s still showing as active.', language: 'en', routedToActorId: 'a3', discrepancyFlagged: true, createdAt: now - 3 * DAY },
  { id: 'cf2', serviceType: 'medical', zone: 'saida', feedback: 'الطبيب يأتي مرة واحدة فقط في الأسبوع بدلاً من ثلاث مرات', language: 'ar', routedToActorId: 'a7', discrepancyFlagged: false, createdAt: now - 5 * DAY },
  { id: 'cf3', serviceType: 'shelter', zone: 'baalbek', feedback: 'Need more blankets — nights are very cold', language: 'en', routedToActorId: 'a11', discrepancyFlagged: false, createdAt: now - 2 * DAY },
];

// ---- Outcome Monitoring (Feature 20) ----

export const OUTCOME_REPORTS: OutcomeReport[] = [
  { id: 'or1', actorId: 'a1', actorName: 'Amel Association', weekOf: '2026-W12', familiesReached: 180, needsResolved: 12, referralsCompleted: 5, collaborationsCompleted: 2, createdAt: now - 1 * DAY },
  { id: 'or2', actorId: 'a3', actorName: 'Bourj Hammoud Municipality', weekOf: '2026-W12', familiesReached: 350, needsResolved: 8, referralsCompleted: 3, collaborationsCompleted: 1, createdAt: now - 1 * DAY },
  { id: 'or3', actorId: 'a7', actorName: 'Saida Relief Network', weekOf: '2026-W12', familiesReached: 220, needsResolved: 6, referralsCompleted: 2, collaborationsCompleted: 1, createdAt: now - 2 * DAY },
  { id: 'or4', actorId: 'a10', actorName: 'Tripoli Aid Hub', weekOf: '2026-W12', familiesReached: 450, needsResolved: 15, referralsCompleted: 4, collaborationsCompleted: 3, createdAt: now - 1 * DAY },
];

export const NETWORK_OUTCOMES: NetworkOutcome[] = [
  { weekOf: '2026-W12', totalFamilies: 1200, totalNeedsResolved: 41, totalCollaborations: 54, gapsClosed: 12 },
  { weekOf: '2026-W11', totalFamilies: 980, totalNeedsResolved: 35, totalCollaborations: 48, gapsClosed: 9 },
  { weekOf: '2026-W10', totalFamilies: 870, totalNeedsResolved: 28, totalCollaborations: 41, gapsClosed: 7 },
];

// ---- Intake Submissions (Feature 2) ----

export const INTAKE_SUBMISSIONS: IntakeSubmission[] = [
  { id: 'is1', organizationName: 'Dekwaneh Women\'s Initiative', type: 'grassroots', sectors: ['psychosocial', 'protection'], operationalZones: ['dekwaneh', 'bourj_hammoud'], contactName: 'Maya Chamoun', contactPhone: '+961 3 667 890', language: 'ar', status: 'pending', submittedAt: now - 5 * DAY },
  { id: 'is2', organizationName: 'Jnah Medical Aid', type: 'ngo', sectors: ['medical'], operationalZones: ['jnah', 'dahieh'], contactName: 'Sami Raad', contactPhone: '+961 3 445 678', language: 'en', status: 'pending', submittedAt: now - 2 * DAY },
];

// ---- Platform Stats ----

export const PLATFORM_STATS: PlatformStats = {
  totalActors: ACTORS.length,
  verifiedActors: ACTORS.filter(a => a.verificationStatus === 'verified').length,
  coverageGaps: 6,
  sectorsMissing: 3,
  activeNeeds: NEEDS.filter(n => n.status === 'open').length,
  activeAlerts: URGENCY_ALERTS.filter(a => a.status === 'active').length,
  activeCollaborations: JOINT_OPERATIONS.filter(j => j.status === 'active').length,
  familiesReachedThisWeek: 1200,
  gapsClosedThisWeek: 12,
  lastUpdated: now,
};

// ---- Map Zone Data (Feature 10) ----

export function getMapZoneData(): MapZoneData[] {
  return ZONES.map(zone => {
    const zoneActors = ACTORS.filter(a => a.operationalZones.includes(zone.id) && a.verificationStatus !== 'suspended');
    const activeSectors = [...new Set(zoneActors.flatMap(a => a.sectors))] as Sector[];
    const allSectors: Sector[] = ['food', 'medical', 'shelter', 'psychosocial', 'legal', 'logistics', 'wash', 'education', 'protection'];
    const gaps = allSectors.filter(s => !activeSectors.includes(s));
    const hasAlert = URGENCY_ALERTS.some(a => a.zone === zone.id && a.status === 'active');
    const oldestUpdate = zoneActors.length > 0 ? Math.min(...zoneActors.map(a => a.lastUpdated)) : 0;
    const staleDays = (now - oldestUpdate) / DAY;
    const freshness = staleDays < 7 ? 'fresh' : staleDays < 14 ? 'stale' : 'outdated';
    return { zoneId: zone.id, activeSectors, actorCount: zoneActors.length, gaps, hasUrgencyAlert: hasAlert, freshness };
  });
}

// ---- Zone Resources (Feature 11) ----

export function getZoneResources(): ZoneResource[] {
  const resourceMap = new Map<string, ZoneResource>();
  for (const card of CAPACITY_CARDS) {
    for (const res of card.resources) {
      const key = `${card.zone}_${res.resourceId}`;
      if (!resourceMap.has(key)) {
        resourceMap.set(key, { zone: card.zone, category: res.label, totalCount: 0, actorBreakdown: [], lastUpdated: 0 });
      }
      const zr = resourceMap.get(key)!;
      zr.totalCount += res.count;
      zr.actorBreakdown.push({ actorId: card.actorId, actorName: card.actorName, count: res.count, updatedAt: res.updatedAt });
      zr.lastUpdated = Math.max(zr.lastUpdated, res.updatedAt);
    }
  }
  return Array.from(resourceMap.values());
}
