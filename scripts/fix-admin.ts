/**
 * Fix missing admin document in Firestore.
 * Signs in as the admin user and creates the admins collection doc.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

async function fixAdmin() {
  console.log('Signing in as admin...');
  const result = await signInWithEmailAndPassword(auth, 'admin@relief.lb', 'admin123');
  console.log(`  UID: ${result.user.uid}`);

  console.log('Writing admin document...');
  await setDoc(doc(db, 'admins', result.user.uid), {
    uid: result.user.uid,
    email: 'admin@relief.lb',
    role: 'admin',
    createdAt: Date.now(),
  });

  console.log('Writing helper document for helper@example.com...');
  const helperResult = await signInWithEmailAndPassword(auth, 'helper@example.com', 'helper123');
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.log('Done! Admin and helper documents created.');
  process.exit(0);
}

fixAdmin().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
