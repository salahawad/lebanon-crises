/**
 * Seed script for populating Firestore with realistic sample data.
 *
 * Usage:
 *   1. Set up .env.local with Firebase credentials
 *   2. Run: npx tsx scripts/seed.ts
 *
 * For emulator: set NEXT_PUBLIC_USE_EMULATORS=true in .env.local
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

// Load env
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
const auth = getAuth(app);

if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
}

const CATEGORIES = ['medicine', 'shelter', 'food', 'baby_milk', 'transport', 'clothing', 'hygiene', 'other'] as const;
const GOVERNORATES = ['beirut', 'mount_lebanon', 'north', 'south', 'bekaa', 'baalbek_hermel', 'akkar', 'nabatieh'] as const;
const URGENCIES = ['critical', 'high', 'medium', 'low'] as const;
const CONTACT_METHODS = ['phone', 'whatsapp', 'no_contact'] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRefCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return `HLP-${code}`;
}

const sampleRequests = [
  { category: 'medicine', description: 'Insulin needed urgently for elderly diabetic patient. Type 2 insulin, running out in 2 days.', city: 'Tripoli', urgency: 'critical', peopleCount: 1 },
  { category: 'shelter', description: 'Family of 6 displaced from South Lebanon, need temporary housing. Have 2 small children.', city: 'Sidon', urgency: 'high', peopleCount: 6 },
  { category: 'food', description: 'Food packages needed for 3 families sharing one apartment. Running low on basics — rice, oil, canned food.', city: 'Beirut', urgency: 'high', peopleCount: 15 },
  { category: 'baby_milk', description: 'Baby formula (0-6 months) for newborn. Mother unable to breastfeed. Any brand accepted.', city: 'Jounieh', urgency: 'critical', peopleCount: 1 },
  { category: 'transport', description: 'Need transport from Tyre to Beirut for hospital appointment. Patient has mobility issues.', city: 'Tyre', urgency: 'medium', peopleCount: 2 },
  { category: 'clothing', description: 'Winter clothing needed for children ages 3-10. Jackets, warm pants, and shoes.', city: 'Zahle', urgency: 'medium', peopleCount: 4 },
  { category: 'hygiene', description: 'Hygiene kits needed — soap, shampoo, toothbrush, sanitary pads for women. Family of 8.', city: 'Baalbek', urgency: 'medium', peopleCount: 8 },
  { category: 'medicine', description: 'Blood pressure medication (Amlodipine 5mg) for 70-year-old patient. Current supply runs out tomorrow.', city: 'Byblos', urgency: 'high', peopleCount: 1 },
  { category: 'food', description: 'Clean drinking water and basic food items for elderly couple. Cannot leave their home.', city: 'Nabatieh', urgency: 'high', peopleCount: 2 },
  { category: 'shelter', description: 'Single mother with 3 children needs safe place to stay. Currently sleeping in a community hall.', city: 'Akkar', urgency: 'critical', peopleCount: 4 },
  { category: 'other', description: 'Need blankets and mattresses. Sleeping on floor with no bedding. Family of 5 including pregnant woman.', city: 'Halba', urgency: 'high', peopleCount: 5 },
  { category: 'medicine', description: 'Asthma inhaler (Ventolin) for 8-year-old child. Attacks have been more frequent.', city: 'Saida', urgency: 'high', peopleCount: 1 },
  { category: 'food', description: 'Baby food and cereal for toddler (12 months). Also need diapers size 4.', city: 'Bint Jbeil', urgency: 'medium', peopleCount: 1 },
  { category: 'transport', description: 'Family needs transport from Bekaa to Mount Lebanon to reunite with relatives.', city: 'Chtaura', urgency: 'low', peopleCount: 5 },
  { category: 'hygiene', description: 'Diapers (newborn size) and wet wipes urgently needed. Baby is 2 weeks old.', city: 'Beirut', urgency: 'high', peopleCount: 1 },
];

async function seed() {
  console.log('Starting seed...');
  const now = Date.now();

  // 1. Create admin user
  console.log('Creating admin user...');
  try {
    const adminResult = await createUserWithEmailAndPassword(auth, 'admin@relief.lb', 'admin123');
    await setDoc(doc(db, 'admins', adminResult.user.uid), {
      uid: adminResult.user.uid,
      email: 'admin@relief.lb',
      role: 'admin',
      createdAt: now,
    });
    console.log('  Admin created: admin@relief.lb / admin123');
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('  Admin already exists');
    } else {
      console.error('  Error creating admin:', e.message);
    }
  }

  // 2. Create sample helper
  console.log('Creating sample helper...');
  try {
    const helperResult = await createUserWithEmailAndPassword(auth, 'helper@example.com', 'helper123');
    await setDoc(doc(db, 'helpers', helperResult.user.uid), {
      id: helperResult.user.uid,
      name: 'Ahmad Khalil',
      organization: 'Lebanese Red Cross',
      phone: '03111222',
      whatsapp: '03111222',
      email: 'helper@example.com',
      governorate: 'beirut',
      suppliesCanProvide: ['medicine', 'food', 'hygiene'],
      verified: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log('  Helper created: helper@example.com / helper123');
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('  Helper already exists');
    } else {
      console.error('  Error creating helper:', e.message);
    }
  }

  // 3. Create sample requests
  console.log('Creating sample requests...');
  let openCount = 0;
  let fulfilledCount = 0;

  for (let i = 0; i < sampleRequests.length; i++) {
    const sample = sampleRequests[i];
    const status = i < 10 ? 'open' : i < 13 ? 'in_progress' : 'fulfilled';
    if (status === 'open') openCount++;
    if (status === 'fulfilled') fulfilledCount++;

    const govIndex = i % GOVERNORATES.length;
    const contactMethod = randomItem(CONTACT_METHODS);
    const createdAt = now - (i * 3600000) - Math.random() * 7200000; // spread over hours

    const requestData = {
      category: sample.category,
      description: sample.description,
      governorate: GOVERNORATES[govIndex],
      city: sample.city,
      area: '',
      peopleCount: sample.peopleCount,
      urgency: sample.urgency || randomItem(URGENCIES),
      contactMethod,
      language: Math.random() > 0.4 ? 'ar' : 'en',
      status,
      createdAt,
      updatedAt: createdAt,
      createdByType: 'anonymous',
      moderationFlags: i === 14 ? ['suspicious'] : [],
      referenceCode: generateRefCode(),
    };

    const docRef = await addDoc(collection(db, 'requests'), requestData);

    // Add contact info for some
    if (contactMethod !== 'no_contact' && Math.random() > 0.3) {
      await setDoc(doc(db, 'requests', docRef.id, 'private', 'contact'), {
        phone: `03${Math.floor(100000 + Math.random() * 900000)}`,
        phoneCountryCode: '+961',
        name: ['Ahmad', 'Fatima', 'Hassan', 'Nour', 'Omar', 'Layla'][Math.floor(Math.random() * 6)],
      });
    }

    console.log(`  Request ${i + 1}/${sampleRequests.length}: ${sample.category} in ${sample.city} [${status}]`);
  }

  // 4. Create stats document
  console.log('Creating stats document...');
  await setDoc(doc(db, 'stats', 'global'), {
    totalRequests: sampleRequests.length,
    openRequests: openCount,
    fulfilledRequests: fulfilledCount,
    totalHelpers: 1,
    totalClaims: 0,
    lastUpdated: now,
  });

  console.log('\nSeed complete!');
  console.log(`  ${sampleRequests.length} requests created`);
  console.log(`  1 admin user: admin@relief.lb / admin123`);
  console.log(`  1 helper user: helper@example.com / helper123`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
