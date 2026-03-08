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
  increment,
} from 'firebase/firestore';
import { db } from './config';
import type { Claim, ClaimFormData, Helper } from '../types';

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
  }).catch(() => {});

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

// Get claims by helper
export async function getClaimsByHelper(helperId: string): Promise<Claim[]> {
  const q = query(
    collection(db, 'claims'),
    where('helperId', '==', helperId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Claim[];
}
