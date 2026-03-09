import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  setDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  HelpRequest,
  HelpRequestFormData,
  RequestContactInfo,
  RequestFilters,
  RequestStatus,
  ModerationFlag,
} from '../types';
import { generateReferenceCode } from '../utils/helpers';

const REQUESTS_COLLECTION = 'requests';
const PAGE_SIZE = 20;

// Generate a new help request
export async function createHelpRequest(
  data: HelpRequestFormData,
  uid?: string
): Promise<{ id: string; referenceCode: string }> {
  const now = Date.now();
  const referenceCode = generateReferenceCode();

  const requestData: Omit<HelpRequest, 'id'> = {
    category: data.category,
    description: data.description,
    governorate: data.governorate,
    city: data.city,
    area: data.area,
    peopleCount: data.peopleCount,
    urgency: data.urgency,
    contactMethod: data.contactMethod,
    language: data.language,
    status: 'open',
    createdAt: now,
    updatedAt: now,
    createdByType: uid ? 'authenticated' : 'anonymous',
    createdByUid: uid || undefined,
    moderationFlags: [],
    referenceCode,
  };

  const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), requestData);

  // Store sensitive contact info in subcollection
  if (data.phone || data.name) {
    const contactInfo: RequestContactInfo = {};
    if (data.phone) {
      contactInfo.phone = data.phone;
      contactInfo.phoneCountryCode = data.phoneCountryCode || '+961';
    }
    if (data.name) contactInfo.name = data.name;

    await setDoc(
      doc(db, REQUESTS_COLLECTION, docRef.id, 'private', 'contact'),
      contactInfo
    );
  }

  // Increment stats counter (cost-efficient: 1 write instead of reading all docs)
  await updateDoc(doc(db, 'stats', 'global'), {
    totalRequests: increment(1),
    openRequests: increment(1),
    lastUpdated: now,
  }).catch(() => {
    // Stats doc may not exist yet; create it
    setDoc(doc(db, 'stats', 'global'), {
      totalRequests: 1,
      openRequests: 1,
      fulfilledRequests: 0,
      totalHelpers: 0,
      totalClaims: 0,
      lastUpdated: now,
    });
  });

  return { id: docRef.id, referenceCode };
}

// Get paginated requests with filters
export async function getRequests(
  filters: RequestFilters = {},
  pageSize: number = PAGE_SIZE,
  lastDoc?: DocumentSnapshot
): Promise<{ requests: HelpRequest[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, REQUESTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  // Apply filters - Firestore requires composite indexes for combined filters
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  } else {
    // Default: show only open requests to helpers
    q = query(q, where('status', 'in', ['open', 'in_progress']));
  }

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }

  if (filters.governorate) {
    q = query(q, where('governorate', '==', filters.governorate));
  }

  if (filters.urgency) {
    q = query(q, where('urgency', '==', filters.urgency));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const requests = snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  })) as HelpRequest[];

  const last = snapshot.docs[snapshot.docs.length - 1] || null;
  return { requests, lastDoc: last };
}

// Get all requests for admin (includes all statuses)
export async function getAdminRequests(
  filters: RequestFilters = {},
  pageSize: number = 50,
  lastDoc?: DocumentSnapshot
): Promise<{ requests: HelpRequest[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, REQUESTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters.governorate) {
    q = query(q, where('governorate', '==', filters.governorate));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const requests = snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
  })) as HelpRequest[];

  const last = snapshot.docs[snapshot.docs.length - 1] || null;
  return { requests, lastDoc: last };
}

// Get single request
export async function getRequest(id: string): Promise<HelpRequest | null> {
  const docRef = doc(db, REQUESTS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id } as HelpRequest;
}

// Get contact info (admin/claimed helper only)
export async function getRequestContactInfo(
  requestId: string
): Promise<RequestContactInfo | null> {
  const docRef = doc(db, REQUESTS_COLLECTION, requestId, 'private', 'contact');
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as RequestContactInfo;
}

// Update request status
export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  adminUid: string
): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, REQUESTS_COLLECTION, id), {
    status,
    updatedAt: now,
  });

  // Update stats
  const oldDoc = await getDoc(doc(db, REQUESTS_COLLECTION, id));
  if (status === 'fulfilled') {
    await updateDoc(doc(db, 'stats', 'global'), {
      fulfilledRequests: increment(1),
      openRequests: increment(-1),
      lastUpdated: now,
    }).catch(() => {});
  }

  // Audit log
  await addDoc(collection(db, 'audit_logs'), {
    action: `status_changed_to_${status}`,
    targetType: 'request',
    targetId: id,
    performedBy: adminUid,
    createdAt: now,
  });
}

// Flag request
export async function flagRequest(
  id: string,
  flag: ModerationFlag,
  adminUid: string
): Promise<void> {
  const now = Date.now();
  const requestRef = doc(db, REQUESTS_COLLECTION, id);
  const requestDoc = await getDoc(requestRef);

  if (!requestDoc.exists()) return;

  const currentFlags = requestDoc.data().moderationFlags || [];
  if (!currentFlags.includes(flag)) {
    await updateDoc(requestRef, {
      moderationFlags: [...currentFlags, flag],
      updatedAt: now,
    });
  }

  await addDoc(collection(db, 'audit_logs'), {
    action: `flagged_${flag}`,
    targetType: 'request',
    targetId: id,
    performedBy: adminUid,
    createdAt: now,
  });
}

// Get open request counts per governorate (for map heatmap)
export async function getRequestCountsByGovernorate(): Promise<Record<string, number>> {
  const q = query(
    collection(db, REQUESTS_COLLECTION),
    where('status', 'in', ['open', 'in_progress'])
  );
  const snapshot = await getDocs(q);
  const counts: Record<string, number> = {};
  snapshot.docs.forEach((d) => {
    const gov = d.data().governorate as string;
    counts[gov] = (counts[gov] || 0) + 1;
  });
  return counts;
}

// Get app stats by counting actual documents, then cache to stats/global
export async function getAppStats() {
  const now = Date.now();

  const [requestsSnap, helpersSnap, claimsSnap] = await Promise.all([
    getDocs(collection(db, REQUESTS_COLLECTION)),
    getDocs(collection(db, 'helpers')),
    getDocs(collection(db, 'claims')),
  ]);

  let openRequests = 0;
  let fulfilledRequests = 0;
  requestsSnap.docs.forEach((d) => {
    const status = d.data().status;
    if (status === 'open' || status === 'in_progress') openRequests++;
    if (status === 'fulfilled') fulfilledRequests++;
  });

  const stats = {
    totalRequests: requestsSnap.size,
    openRequests,
    fulfilledRequests,
    totalHelpers: helpersSnap.size,
    totalClaims: claimsSnap.size,
    lastUpdated: now,
  };

  // Cache the computed stats
  setDoc(doc(db, 'stats', 'global'), stats).catch(() => {});

  return stats;
}
