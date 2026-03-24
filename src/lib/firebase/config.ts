import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const authEmulatorUrl =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL ?? 'http://127.0.0.1:9099';
const firestoreEmulatorHost =
  process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ?? '127.0.0.1';
const firestoreEmulatorPort = Number(
  process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT ?? '8080'
);

// Connect to emulators in development
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
    connectFirestoreEmulator(db, firestoreEmulatorHost, firestoreEmulatorPort);
  } catch {
    // Already connected
  }
}

export { app, auth, db };
