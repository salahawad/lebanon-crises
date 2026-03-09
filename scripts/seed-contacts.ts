/**
 * Seed script for the contacts collection.
 *
 * Usage:
 *   npx tsx scripts/seed-contacts.ts
 *
 * Make sure your .env.local has the Firebase config values set.
 * Edit the CONTACTS array below with real names and phone numbers.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { config } from 'dotenv';

// Load .env.local
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

// ============================================================
// EDIT THIS: Add your real contacts here
// ============================================================
const CONTACTS = [
  // Beirut
  {
    fullName: 'Ahmad Khalil',
    phone: '+96171123456',
    governorate: 'beirut',
    area: 'Hamra',
    available: true,
  },
  {
    fullName: 'Sara Nassar',
    phone: '+96170234567',
    governorate: 'beirut',
    area: 'Achrafieh',
    available: true,
  },
  // Mount Lebanon
  {
    fullName: 'Rami Haddad',
    phone: '+96176345678',
    governorate: 'mount_lebanon',
    area: 'Jounieh',
    available: true,
  },
  // North Lebanon
  {
    fullName: 'Nour El-Din',
    phone: '+96171456789',
    governorate: 'north',
    area: 'Tripoli',
    available: true,
  },
  // South Lebanon
  {
    fullName: 'Hassan Moussa',
    phone: '+96170567890',
    governorate: 'south',
    area: 'Saida',
    available: true,
  },
  // Bekaa
  {
    fullName: 'Maya Khoury',
    phone: '+96176678901',
    governorate: 'bekaa',
    area: 'Zahle',
    available: true,
  },
  // Baalbek-Hermel
  {
    fullName: 'Ali Safwan',
    phone: '+96171789012',
    governorate: 'baalbek_hermel',
    area: 'Baalbek',
    available: true,
  },
  // Akkar
  {
    fullName: 'Fatima Darwish',
    phone: '+96170890123',
    governorate: 'akkar',
    area: 'Halba',
    available: true,
  },
  // Nabatieh
  {
    fullName: 'Karim Jabr',
    phone: '+96176901234',
    governorate: 'nabatieh',
    area: 'Nabatieh',
    available: true,
  },
];

async function seed() {
  const now = Date.now();
  console.log(`Seeding ${CONTACTS.length} contacts...`);

  for (const contact of CONTACTS) {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contact,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✓ ${contact.fullName} (${contact.area}) → ${docRef.id}`);
  }

  console.log('\nDone! All contacts seeded.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
