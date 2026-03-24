/**
 * Seed the coordination-platform collections into Firestore.
 *
 * Safety behavior:
 * - Reads the current remote documents first.
 * - Refuses to write if a target collection contains extra docs or
 *   same-id docs with conflicting payloads.
 * - Creates only missing documents.
 * - In emulator mode, clears Firestore first and reseeds the platform
 *   collections through the Admin SDK so client rules stay unchanged.
 *
 * Requirements:
 * - Live Firestore mode:
 *   - .env must contain NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   - firebase-tools must be logged in on this machine
 * - Emulator mode:
 *   - FIRESTORE_EMULATOR_HOST must be available
 *   - project id can come from GCLOUD_PROJECT / PLAYWRIGHT_FIREBASE_PROJECT_ID
 *
 * Usage:
 *   npx tsx scripts/seed-platform.ts --check
 *   npx tsx scripts/seed-platform.ts
 *   npx tsx scripts/seed-platform.ts --emulator
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { config } from 'dotenv';
import {
  deleteApp as deleteAdminApp,
  getApps as getAdminApps,
  initializeApp as initializeAdminApp,
} from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

import {
  ACTORS,
  ASSESSMENT_SNAPSHOTS,
  CAPACITY_CARDS,
  CAPACITY_CHANGES,
  COLLABORATIONS,
  COMMUNITY_FEEDBACK,
  FLASH_ASSESSMENTS,
  GAP_ANALYSES,
  INTAKE_SUBMISSIONS,
  JOINT_OPERATIONS,
  MESSAGE_THREADS,
  MESSAGES,
  NEEDS,
  NETWORK_OUTCOMES,
  OUTCOME_REPORTS,
  PATTERN_ALERTS,
  PLATFORM_STATS,
  SECTOR_PLANS,
  SHARED_TASKS,
  URGENCY_ALERTS,
  VOUCHES,
} from '../src/lib/data/synthetic';
import { ZONES } from '../src/lib/data/zones';

config({ path: '.env' });

type SeedDoc = {
  id: string;
  data: PlainObject;
};

type SeedCollection = {
  name: string;
  docs: SeedDoc[];
};

type FirebaseToolsConfig = {
  tokens?: {
    access_token?: string;
    expires_at?: number;
  };
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } };

type PlainObject = Record<string, unknown>;

const FIREBASE_CONFIG_PATH = path.join(
  os.homedir(),
  '.config',
  'configstore',
  'firebase-tools.json'
);

const dryRun = process.argv.includes('--check') || process.argv.includes('--dry-run');
const emulatorMode =
  process.argv.includes('--emulator') || Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const projectId =
  process.env.PLAYWRIGHT_FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const VOLATILE_TIME_KEYS = new Set([
  'createdAt',
  'updatedAt',
  'lastUpdated',
  'submittedAt',
  'reviewedAt',
  'changedAt',
  'expiresAt',
  'respondedAt',
  'dueDate',
  'closedAt',
  'generatedAt',
  'lastMessageAt',
]);

if (!projectId) {
  throw new Error(
    'Missing Firebase project id. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID for live mode or GCLOUD_PROJECT / PLAYWRIGHT_FIREBASE_PROJECT_ID for emulator mode.'
  );
}

function asPlainObject<T extends object>(value: T): PlainObject {
  return value as unknown as PlainObject;
}

const collections: SeedCollection[] = [
  { name: 'actors', docs: ACTORS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })) },
  {
    name: 'intake_submissions',
    docs: INTAKE_SUBMISSIONS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'capacity_cards',
    docs: CAPACITY_CARDS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'capacity_changes',
    docs: CAPACITY_CHANGES.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  { name: 'vouches', docs: VOUCHES.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })) },
  { name: 'needs', docs: NEEDS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })) },
  {
    name: 'pattern_alerts',
    docs: PATTERN_ALERTS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'urgency_alerts',
    docs: URGENCY_ALERTS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'collaborations',
    docs: COLLABORATIONS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'joint_operations',
    docs: JOINT_OPERATIONS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'shared_tasks',
    docs: SHARED_TASKS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'flash_assessments',
    docs: FLASH_ASSESSMENTS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'assessment_snapshots',
    docs: ASSESSMENT_SNAPSHOTS.map((doc) => ({
      id: doc.assessmentId,
      data: asPlainObject(doc),
    })),
  },
  {
    name: 'sector_plans',
    docs: SECTOR_PLANS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'gap_analyses',
    docs: GAP_ANALYSES.map((doc) => ({ id: doc.zone, data: asPlainObject(doc) })),
  },
  {
    name: 'message_threads',
    docs: MESSAGE_THREADS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  { name: 'messages', docs: MESSAGES.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })) },
  {
    name: 'community_feedback',
    docs: COMMUNITY_FEEDBACK.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'outcome_reports',
    docs: OUTCOME_REPORTS.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })),
  },
  {
    name: 'network_outcomes',
    docs: NETWORK_OUTCOMES.map((doc) => ({ id: doc.weekOf, data: asPlainObject(doc) })),
  },
  {
    name: 'platform_stats',
    docs: [{ id: 'global', data: asPlainObject(PLATFORM_STATS) }],
  },
  { name: 'zones', docs: ZONES.map((doc) => ({ id: doc.id, data: asPlainObject(doc) })) },
];

function readFirebaseToolsConfig(): FirebaseToolsConfig {
  return JSON.parse(readFileSync(FIREBASE_CONFIG_PATH, 'utf8')) as FirebaseToolsConfig;
}

function ensureFirebaseAccessToken(): string {
  const initialConfig = readFirebaseToolsConfig();
  const stillValid =
    initialConfig.tokens?.access_token &&
    initialConfig.tokens.expires_at &&
    initialConfig.tokens.expires_at > Date.now() + 60_000;

  if (!stillValid) {
    execSync('npx firebase-tools projects:list --json', { stdio: 'ignore' });
  }

  const refreshedConfig = readFirebaseToolsConfig();
  const token = refreshedConfig.tokens?.access_token;
  if (!token) {
    throw new Error(
      'No Firebase CLI access token found. Run `npx firebase-tools login` first.'
    );
  }

  return token;
}

function documentPath(collectionName: string, docId?: string): string {
  const baseRoot = emulatorMode
    ? `http://${emulatorHost}/v1/projects/${projectId}/databases/(default)/documents`
    : `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const base = `${baseRoot}/${collectionName}`;
  return docId ? `${base}/${encodeURIComponent(docId)}` : base;
}

async function firestoreRequest<T>(
  url: string,
  init?: RequestInit,
  token?: string
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${body}`);
  }

  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

async function clearEmulatorDocuments(): Promise<void> {
  const response = await fetch(
    `http://${emulatorHost}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore emulator reset failed (${response.status}): ${body}`);
  }
}

async function listRemoteDocuments(
  collectionName: string,
  token?: string
): Promise<Map<string, Record<string, unknown>>> {
  const documents = new Map<string, PlainObject>();
  let nextPageToken: string | undefined;

  do {
    const url = new URL(documentPath(collectionName));
    url.searchParams.set('pageSize', '500');
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }

    const response = await firestoreRequest<{
      documents?: FirestoreDocument[];
      nextPageToken?: string;
    }>(url.toString(), undefined, token);

    for (const document of response.documents ?? []) {
      const id = document.name.split('/').pop();
      if (!id) continue;
      documents.set(id, fromFirestoreDocument(document));
    }

    nextPageToken = response.nextPageToken;
  } while (nextPageToken);

  return documents;
}

async function createRemoteDocument(
  collectionName: string,
  docId: string,
  data: PlainObject,
  token?: string
): Promise<void> {
  const url = new URL(documentPath(collectionName, docId));
  url.searchParams.set('currentDocument.exists', 'false');

  await firestoreRequest(url.toString(), {
    method: 'PATCH',
    body: JSON.stringify(toFirestoreDocument(data)),
  }, token);
}

function toFirestoreDocument(data: PlainObject): { fields: Record<string, FirestoreValue> } {
  return {
    fields: Object.fromEntries(
      Object.entries(data)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, toFirestoreValue(value)])
    ),
  };
}

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: value.length
        ? { values: value.filter((item) => item !== undefined).map((item) => toFirestoreValue(item)) }
        : {},
    };
  }

  if (typeof value === 'object') {
    const fields = Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, toFirestoreValue(nestedValue)])
    );
    return { mapValue: { fields } };
  }

  throw new Error(`Unsupported Firestore value: ${String(value)}`);
}

function fromFirestoreDocument(document: FirestoreDocument): PlainObject {
  return Object.fromEntries(
    Object.entries(document.fields ?? {}).map(([key, value]) => [key, fromFirestoreValue(value)])
  );
}

function fromFirestoreValue(value: FirestoreValue): unknown {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map((item) => fromFirestoreValue(item));
  if ('mapValue' in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields ?? {}).map(([key, nestedValue]) => [
        key,
        fromFirestoreValue(nestedValue),
      ])
    );
  }

  return null;
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key, nestedValue]) =>
            nestedValue !== undefined && !VOLATILE_TIME_KEYS.has(key)
        )
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalize(nestedValue)])
    );
  }

  return value;
}

function isSameDocument(left: PlainObject, right: PlainObject): boolean {
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

async function main() {
  const token = emulatorMode ? undefined : ensureFirebaseAccessToken();

  const conflicts: string[] = [];
  const createQueue: Array<{ collectionName: string; docId: string; data: PlainObject }> = [];
  const identicalCountByCollection = new Map<string, number>();

  if (emulatorMode && !dryRun) {
    console.log(`Resetting Firestore emulator for project ${projectId}...`);
    await clearEmulatorDocuments();
  }

  console.log(
    emulatorMode
      ? `Checking platform collections in Firestore emulator (${projectId})...`
      : `Checking platform collections in project ${projectId}...`
  );

  for (const collection of collections) {
    const remoteDocs = await listRemoteDocuments(collection.name, token);
    const expectedIds = new Set(collection.docs.map((doc) => doc.id));
    const extraIds = [...remoteDocs.keys()].filter((id) => !expectedIds.has(id));

    if (extraIds.length > 0) {
      conflicts.push(
        `${collection.name}: found unexpected remote docs [${extraIds.sort().join(', ')}]`
      );
      continue;
    }

    let identicalCount = 0;

    for (const doc of collection.docs) {
      const remoteDoc = remoteDocs.get(doc.id);
      if (!remoteDoc) {
        createQueue.push({
          collectionName: collection.name,
          docId: doc.id,
          data: doc.data,
        });
        continue;
      }

      if (!isSameDocument(remoteDoc, doc.data)) {
        conflicts.push(`${collection.name}/${doc.id}: remote data differs from local source`);
        continue;
      }

      identicalCount += 1;
    }

    identicalCountByCollection.set(collection.name, identicalCount);
  }

  if (conflicts.length > 0) {
    console.error('\nConflict check failed. No writes were performed.');
    for (const conflict of conflicts) {
      console.error(`- ${conflict}`);
    }
    process.exit(1);
  }

  const missingByCollection = new Map<string, number>();
  for (const item of createQueue) {
    missingByCollection.set(
      item.collectionName,
      (missingByCollection.get(item.collectionName) ?? 0) + 1
    );
  }

  console.log('\nRemote comparison summary:');
  for (const collection of collections) {
    const sameCount = identicalCountByCollection.get(collection.name) ?? 0;
    const missingCount = missingByCollection.get(collection.name) ?? 0;
    console.log(`- ${collection.name}: ${sameCount} identical, ${missingCount} missing`);
  }

  if (dryRun) {
    console.log('\nCheck complete. No writes requested.');
    return;
  }

  console.log(
    emulatorMode
      ? `\nCreating ${createQueue.length} platform documents in the emulator...`
      : `\nCreating ${createQueue.length} missing platform documents...`
  );

  if (emulatorMode) {
    const shouldDeleteApp = getAdminApps().length === 0;
    const adminApp = shouldDeleteApp
      ? initializeAdminApp({ projectId })
      : getAdminApps()[0];
    const db = getAdminFirestore(adminApp);
    db.settings({ ignoreUndefinedProperties: true });

    try {
      for (const item of createQueue) {
        await db.collection(item.collectionName).doc(item.docId).set(item.data);
        console.log(`- created ${item.collectionName}/${item.docId}`);
      }
    } finally {
      if (shouldDeleteApp) {
        await deleteAdminApp(adminApp);
      }
    }

    console.log('\nPlatform emulator seed complete.');
    return;
  }

  for (const item of createQueue) {
    await createRemoteDocument(item.collectionName, item.docId, item.data, token);
    console.log(`- created ${item.collectionName}/${item.docId}`);
  }

  console.log('\nPlatform seed complete.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
