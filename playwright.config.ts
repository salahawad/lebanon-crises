import { defineConfig } from '@playwright/test';

const TEST_ARTIFACTS_DIR = '.test-artifacts/playwright';
const useFirebaseEmulators = process.env.PLAYWRIGHT_USE_FIREBASE_EMULATORS === 'true';
const appPort = process.env.PLAYWRIGHT_APP_PORT ?? '4001';
const appBaseUrl = `http://127.0.0.1:${appPort}`;
const nextDistDir =
  process.env.PLAYWRIGHT_NEXT_DIST_DIR ?? `.test-artifacts/next/playwright-${appPort}`;
const firebaseProjectId =
  process.env.PLAYWRIGHT_FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  'demo-lebanon-crises';
const firestoreEmulatorHost =
  process.env.PLAYWRIGHT_FIRESTORE_EMULATOR_HOST ?? '127.0.0.1';
const firestoreEmulatorPort =
  process.env.PLAYWRIGHT_FIRESTORE_EMULATOR_PORT ?? '8080';
const authEmulatorUrl =
  process.env.PLAYWRIGHT_FIREBASE_AUTH_EMULATOR_URL ?? 'http://127.0.0.1:9099';
const emulatorFirebaseEnv: Record<string, string> = useFirebaseEmulators
  ? {
      NEXT_PUBLIC_USE_EMULATORS: 'true',
      NEXT_PUBLIC_FIREBASE_API_KEY: 'demo-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${firebaseProjectId}.firebaseapp.com`,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseProjectId,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: `${firebaseProjectId}.appspot.com`,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:000000000000:web:emulator',
      NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: firestoreEmulatorHost,
      NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT: firestoreEmulatorPort,
      NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL: authEmulatorUrl,
      NEXT_DIST_DIR: nextDistDir,
    }
  : {};

function stringifyEnv(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: `${TEST_ARTIFACTS_DIR}/output`,
  reporter: 'list',
  use: {
    baseURL: appBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npx next build && npx next start --port ${appPort}`,
    url: appBaseUrl,
    env: {
      ...stringifyEnv(process.env),
      NEXT_DIST_DIR: nextDistDir,
      ...emulatorFirebaseEnv,
    },
    reuseExistingServer: !process.env.CI && !useFirebaseEmulators,
    timeout: 120000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
