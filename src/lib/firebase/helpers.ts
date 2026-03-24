import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { createLogger } from '../logger';
import type { Claim, ClaimFormData, Helper } from '../types';

const log = createLogger('firebase:helpers');

// Get helper profile
export async function getHelper(uid: string): Promise<Helper | null> {
  const snapshot = await getDoc(doc(db, 'helpers', uid));
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id } as Helper;
}

// Update helper profile
export async function updateHelper(
  uid: string,
  data: Partial<Helper>
): Promise<void> {
  await updateDoc(doc(db, 'helpers', uid), {
    ...data,
    updatedAt: Date.now(),
  });
}

// Create a claim on a request
export async function createClaim(
  requestId: string,
  helperId: string,
  helperName: string,
  data: ClaimFormData
): Promise<string> {
  const now = Date.now();

  const claim: Omit<Claim, 'id'> = {
    requestId,
    helperId,
    helperName,
    message: data.message || '',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'claims'), claim);

  // Update request
  await updateDoc(doc(db, 'requests', requestId), {
    status: 'in_progress',
    claimedBy: helperId,
    claimedAt: now,
    updatedAt: now,
  });

  // Update stats
  await updateDoc(doc(db, 'stats', 'global'), {
    totalClaims: increment(1),
    lastUpdated: now,
  }).catch((err) => log.warn('stats update failed', err, { operation: 'createClaim' }));

  log.info('claim created', { operation: 'createClaim', claimId: docRef.id, requestId });
  return docRef.id;
}

// Get claims for a request
export async function getClaimsForRequest(requestId: string): Promise<Claim[]> {
  const q = query(
    collection(db, 'claims'),
    where('requestId', '==', requestId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Claim[];
}

// Set helper verification status (admin action)
export async function setHelperVerified(
  uid: string,
  verified: boolean,
  adminUid: string
): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(db, 'helpers', uid), { verified, updatedAt: now });
  await addDoc(collection(db, 'audit_logs'), {
    action: verified ? 'helper_verified' : 'helper_unverified',
    targetType: 'helper',
    targetId: uid,
    performedBy: adminUid,
    createdAt: now,
  });
}

// Confirm delivery (called by helper or requester)
export async function confirmDelivery(
  claimId: string,
  role: 'helper' | 'requester',
  requestId: string
): Promise<{ bothConfirmed: boolean }> {
  const now = Date.now();
  const claimRef = doc(db, 'claims', claimId);
  const claimSnap = await getDoc(claimRef);
  if (!claimSnap.exists()) throw new Error('Claim not found');

  const claim = claimSnap.data() as Claim;
  const field = role === 'helper' ? 'helperConfirmedDelivery' : 'requesterConfirmedDelivery';

  await updateDoc(claimRef, { [field]: true, updatedAt: now });

  const otherConfirmed = role === 'helper'
    ? claim.requesterConfirmedDelivery
    : claim.helperConfirmedDelivery;

  if (otherConfirmed) {
    // Both confirmed — mark as completed and fulfilled
    await updateDoc(claimRef, { status: 'completed', updatedAt: now });
    await updateDoc(doc(db, 'requests', requestId), {
      status: 'fulfilled',
      updatedAt: now,
    });
    // Increment helper reputation
    await updateDoc(doc(db, 'helpers', claim.helperId), {
      completedDeliveries: increment(1),
      updatedAt: now,
    });
    // Update stats
    await updateDoc(doc(db, 'stats', 'global'), {
      fulfilledRequests: increment(1),
      openRequests: increment(-1),
      lastUpdated: now,
    }).catch((err) => log.warn('stats update failed', err, { operation: 'confirmDelivery' }));

    log.info('delivery confirmed by both parties', { operation: 'confirmDelivery', claimId, requestId });
  }

  return { bothConfirmed: !!otherConfirmed };
}

// Get all helpers for admin (with optional verified filter)
export async function getAdminHelpers(
  verifiedFilter?: boolean
): Promise<Helper[]> {
  let q;
  if (verifiedFilter !== undefined) {
    q = query(
      collection(db, 'helpers'),
      where('verified', '==', verifiedFilter),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, 'helpers'), orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Helper[];
}

// Get claims by helper
export async function getClaimsByHelper(helperId: string): Promise<Claim[]> {
  const q = query(
    collection(db, 'claims'),
    where('helperId', '==', helperId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Claim[];
}
