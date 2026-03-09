/**
 * Smoke test: verifies all Firestore CRUD operations work.
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { config } from 'dotenv';

config({ path: '.env' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ❌ ${name} — ${err.message || err}`);
    failed++;
  }
}

async function run() {
  console.log('\n🔥 Firestore Smoke Test\n');

  // Track IDs for cleanup
  let testRequestId = '';
  let testContactId = '';
  let testClaimId = '';

  // ── REQUESTS ──
  console.log('📋 Requests collection:');

  await test('CREATE request', async () => {
    const docRef = await addDoc(collection(db, 'requests'), {
      category: 'food',
      description: 'Smoke test request',
      governorate: 'beirut',
      city: 'Test City',
      area: 'Test Area',
      peopleCount: 1,
      urgency: 'low',
      contactMethod: 'no_contact',
      language: 'en',
      status: 'open',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdByType: 'anonymous',
      moderationFlags: [],
      referenceCode: 'TEST-0000',
    });
    testRequestId = docRef.id;
    if (!testRequestId) throw new Error('No ID returned');
  });

  await test('READ request', async () => {
    const snap = await getDoc(doc(db, 'requests', testRequestId));
    if (!snap.exists()) throw new Error('Document not found');
    if (snap.data().referenceCode !== 'TEST-0000') throw new Error('Data mismatch');
  });

  await test('UPDATE request status', async () => {
    await updateDoc(doc(db, 'requests', testRequestId), {
      status: 'fulfilled',
      updatedAt: Date.now(),
    });
    const snap = await getDoc(doc(db, 'requests', testRequestId));
    if (snap.data()?.status !== 'fulfilled') throw new Error('Update failed');
  });

  await test('QUERY requests (filter by status)', async () => {
    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    // Just verify the query doesn't throw (index exists)
    if (typeof snap.size !== 'number') throw new Error('Query failed');
  });

  await test('CREATE request private contact subcollection', async () => {
    await setDoc(doc(db, 'requests', testRequestId, 'private', 'contact'), {
      phone: '03000000',
      phoneCountryCode: '+961',
      name: 'Test User',
    });
    const snap = await getDoc(doc(db, 'requests', testRequestId, 'private', 'contact'));
    if (!snap.exists()) throw new Error('Subcollection write failed');
  });

  // ── CONTACTS ──
  console.log('\n📞 Contacts collection:');

  await test('CREATE contact', async () => {
    const docRef = await addDoc(collection(db, 'contacts'), {
      fullName: 'Smoke Test Person',
      phone: '+96100000000',
      governorate: 'beirut',
      area: 'Test Area',
      available: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testContactId = docRef.id;
    if (!testContactId) throw new Error('No ID returned');
  });

  await test('READ contacts', async () => {
    const snap = await getDocs(collection(db, 'contacts'));
    if (snap.size === 0) throw new Error('No contacts found');
  });

  await test('QUERY contacts (filter by governorate)', async () => {
    const q = query(
      collection(db, 'contacts'),
      where('available', '==', true),
      where('governorate', '==', 'beirut')
    );
    const snap = await getDocs(q);
    if (snap.size === 0) throw new Error('Filtered query returned 0');
  });

  // ── CLAIMS ──
  console.log('\n🤝 Claims collection:');

  await test('CREATE claim', async () => {
    const docRef = await addDoc(collection(db, 'claims'), {
      requestId: testRequestId,
      helperId: 'smoke-test-helper',
      helperName: 'Test Helper',
      message: 'Smoke test claim',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    testClaimId = docRef.id;
    if (!testClaimId) throw new Error('No ID returned');
  });

  await test('READ claim', async () => {
    const snap = await getDoc(doc(db, 'claims', testClaimId));
    if (!snap.exists()) throw new Error('Claim not found');
  });

  // ── STATS ──
  console.log('\n📊 Stats collection:');

  await test('READ/WRITE stats', async () => {
    await setDoc(doc(db, 'stats', 'global'), {
      totalRequests: 0,
      openRequests: 0,
      fulfilledRequests: 0,
      totalHelpers: 0,
      totalClaims: 0,
      lastUpdated: Date.now(),
    }, { merge: true });
    const snap = await getDoc(doc(db, 'stats', 'global'));
    if (!snap.exists()) throw new Error('Stats doc not found');
  });

  // ── CLEANUP ──
  console.log('\n🧹 Cleanup:');

  await test('DELETE test request + subcollection', async () => {
    await deleteDoc(doc(db, 'requests', testRequestId, 'private', 'contact'));
    await deleteDoc(doc(db, 'requests', testRequestId));
  });

  await test('DELETE test contact', async () => {
    await deleteDoc(doc(db, 'contacts', testContactId));
  });

  await test('DELETE test claim', async () => {
    await deleteDoc(doc(db, 'claims', testClaimId));
  });

  // ── SUMMARY ──
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'─'.repeat(40)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
