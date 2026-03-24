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
import { createLogger } from '../logger';
import type { AdminUser, Helper } from '../types';
import type { PlatformUser } from '../types/platform';

const log = createLogger('firebase:auth');

// Anonymous sign-in for requesters (free, no phone needed)
export async function signInAnonymous(): Promise<User> {
  const result = await signInAnonymously(auth);
  log.info('anonymous sign-in', { operation: 'signInAnonymous' });
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
    log.warn('admin auth rejected: not in admins collection', undefined, { operation: 'signInAdmin', uid: result.user.uid });
    await firebaseSignOut(auth);
    throw new Error('Not authorized as admin');
  }

  log.info('admin sign-in', { operation: 'signInAdmin' });
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
  log.info('helper registered', { operation: 'registerHelper' });
  return { user: result.user, helper };
}

// Helper login
export async function signInHelper(
  email: string,
  password: string
): Promise<{ user: User; helper: Helper | null }> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const helperDoc = await getDoc(doc(db, 'helpers', result.user.uid));

  log.info('helper sign-in', { operation: 'signInHelper' });
  return {
    user: result.user,
    helper: helperDoc.exists() ? (helperDoc.data() as Helper) : null,
  };
}

export async function getPlatformUser(uid: string): Promise<PlatformUser | null> {
  const platformUserDoc = await getDoc(doc(db, 'platform_users', uid));
  if (!platformUserDoc.exists()) return null;

  return {
    id: platformUserDoc.id,
    ...(platformUserDoc.data() as Omit<PlatformUser, 'id'>),
  };
}

export async function signInPlatformUser(
  email: string,
  password: string
): Promise<{ user: User; platformUser: PlatformUser }> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const platformUser = await getPlatformUser(result.user.uid);

  if (!platformUser) {
    log.warn(
      'platform auth rejected: not in platform_users collection',
      undefined,
      { operation: 'signInPlatformUser', uid: result.user.uid }
    );
    await firebaseSignOut(auth);
    throw new Error('Not authorized as platform user');
  }

  log.info('platform sign-in', {
    operation: 'signInPlatformUser',
    role: platformUser.role,
    actorId: platformUser.actorId,
  });

  return {
    user: result.user,
    platformUser,
  };
}

export async function checkIsPlatformAdmin(uid: string): Promise<boolean> {
  const platformUser = await getPlatformUser(uid);
  return platformUser?.role === 'platform_admin';
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
