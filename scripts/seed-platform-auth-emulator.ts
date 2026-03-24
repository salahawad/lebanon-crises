import { config } from 'dotenv';
import {
  deleteApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

config({ path: '.env' });

const projectId =
  process.env.PLAYWRIGHT_FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'Missing Firebase project id. Set PLAYWRIGHT_FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID.'
  );
}

const authEmulatorUrl =
  process.env.PLAYWRIGHT_FIREBASE_AUTH_EMULATOR_URL ??
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL ??
  'http://127.0.0.1:9099';

process.env.FIREBASE_AUTH_EMULATOR_HOST = new URL(authEmulatorUrl).host;

const app =
  getApps()[0] ??
  initializeApp({
    projectId,
  });

const auth = getAuth(app);
const db = getFirestore(app);
const now = Date.now();

type EmulatorPlatformUserSeed = {
  email: string;
  password: string;
  displayName: string;
  role: 'platform_admin' | 'actor_admin';
  actorId?: string;
  actorName?: string;
};

const platformUsers: EmulatorPlatformUserSeed[] = [
  {
    email: 'platformadmin@shabaka.lb',
    password: 'platform123',
    displayName: 'Shabaka Coordination Admin',
    role: 'platform_admin',
  },
  {
    email: 'actor.a1@shabaka.lb',
    password: 'platform123',
    displayName: 'Amel Association Desk',
    role: 'actor_admin',
    actorId: 'a1',
    actorName: 'Amel Association',
  },
] as const;

async function upsertPlatformUser() {
  console.log(`Seeding Shabaka auth users into emulator (${projectId})...`);

  for (const platformUser of platformUsers) {
    let user = null;

    try {
      user = await auth.getUserByEmail(platformUser.email);
      console.log(`  Auth user already exists: ${platformUser.email}`);
    } catch {
      user = await auth.createUser({
        email: platformUser.email,
        password: platformUser.password,
        displayName: platformUser.displayName,
      });
      console.log(`  Auth user created: ${platformUser.email}`);
    }

    await db
      .collection('platform_users')
      .doc(user.uid)
      .set(
        {
          id: user.uid,
          email: platformUser.email,
          displayName: platformUser.displayName,
          role: platformUser.role,
          ...(platformUser.actorId ? { actorId: platformUser.actorId } : {}),
          ...(platformUser.actorName ? { actorName: platformUser.actorName } : {}),
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

    console.log(`  platform_users/${user.uid} synced for ${platformUser.email}`);
  }
}

upsertPlatformUser()
  .then(async () => {
    console.log('Platform auth emulator seed complete.');
    await deleteApp(app);
  })
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await deleteApp(app).catch(() => undefined);
    process.exit(1);
  });
