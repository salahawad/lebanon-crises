import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { AdminUser, Helper } from '../types';

// Anonymous sign-in for requesters (free, no phone needed)
export async function signInAnonymous(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

// Admin email/password login
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ user: User; admin: AdminUser }> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const adminDoc = await getDoc(doc(db, 'admins', result.user.uid));

  if (!adminDoc.exists()) {
    await firebaseSignOut(auth);
    throw new Error('Not authorized as admin');
  }

  return {
    user: result.user,
    admin: adminDoc.data() as AdminUser,
  };
}

// Helper registration
export async function registerHelper(
  email: string,
  password: string,
  helperData: Omit<Helper, 'id' | 'createdAt' | 'updatedAt' | 'verified'>
): Promise<{ user: User; helper: Helper }> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const now = Date.now();

  const helper: Helper = {
    ...helperData,
    id: result.user.uid,
    verified: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'helpers', result.user.uid), helper);
  return { user: result.user, helper };
}

// Helper login
export async function signInHelper(
  email: string,
  password: string
): Promise<{ user: User; helper: Helper | null }> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const helperDoc = await getDoc(doc(db, 'helpers', result.user.uid));

  return {
    user: result.user,
    helper: helperDoc.exists() ? (helperDoc.data() as Helper) : null,
  };
}

// Sign out
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Check if user is admin
export async function checkIsAdmin(uid: string): Promise<boolean> {
  const adminDoc = await getDoc(doc(db, 'admins', uid));
  return adminDoc.exists();
}

// Auth state listener
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
