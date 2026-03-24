import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const insideEmulators = process.argv.includes('--inside-emulators');
const passthroughArgs = process.argv.slice(2).filter((arg) => arg !== '--inside-emulators');
const projectId =
  process.env.PLAYWRIGHT_FIREBASE_PROJECT_ID ??
  process.env.GCLOUD_PROJECT ??
  process.env.GOOGLE_CLOUD_PROJECT ??
  'demo-lebanon-crises';
const emulatorHost = '127.0.0.1';
const firebaseArtifactsDir = path.join('.test-artifacts', 'firebase');
const firebaseLogFiles = [
  'firebase-debug.log',
  'firestore-debug.log',
  'auth-debug.log',
  'hub-debug.log',
  'logging-debug.log',
  'ui-debug.log',
];

type FirebaseConfig = {
  firestore?: {
    rules?: string;
    indexes?: string;
  };
  emulators?: {
    auth?: {
      host?: string;
      port?: number;
    };
    firestore?: {
      host?: string;
      port?: number;
    };
    ui?: {
      enabled?: boolean;
      host?: string;
      port?: number;
    };
  };
};

function npxCommand(): string {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited via signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
        return;
      }

      resolve();
    });
  });
}

function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on('error', reject);
    server.listen(0, emulatorHost, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Unable to determine an available port for Firebase emulators.'));
        return;
      }

      const { port } = address;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve(port);
      });
    });
  });
}

function writeTestFirebaseConfig(ports: { auth: number; firestore: number; ui: number }): string {
  const configPath = path.join(firebaseArtifactsDir, 'firebase.e2e.json');
  const baseConfig = JSON.parse(readFileSync('firebase.json', 'utf8')) as FirebaseConfig;
  const testConfig: FirebaseConfig = {
    ...baseConfig,
    firestore: {
      ...baseConfig.firestore,
      ...(baseConfig.firestore?.rules
        ? { rules: path.resolve(baseConfig.firestore.rules) }
        : {}),
      ...(baseConfig.firestore?.indexes
        ? { indexes: path.resolve(baseConfig.firestore.indexes) }
        : {}),
    },
    emulators: {
      ...baseConfig.emulators,
      auth: {
        ...baseConfig.emulators?.auth,
        host: emulatorHost,
        port: ports.auth,
      },
      firestore: {
        ...baseConfig.emulators?.firestore,
        host: emulatorHost,
        port: ports.firestore,
      },
      ui: {
        ...baseConfig.emulators?.ui,
        enabled: false,
        host: emulatorHost,
        port: ports.ui,
      },
    },
  };

  mkdirSync(path.dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(testConfig, null, 2));
  return configPath;
}

function moveFirebaseLogsToArtifacts(): void {
  mkdirSync(firebaseArtifactsDir, { recursive: true });

  for (const filename of firebaseLogFiles) {
    if (!existsSync(filename)) continue;

    const target = path.join(firebaseArtifactsDir, filename);
    rmSync(target, { force: true });
    renameSync(filename, target);
  }
}

async function main() {
  moveFirebaseLogsToArtifacts();

  try {
    if (!insideEmulators) {
      const ports = {
        auth: await getAvailablePort(),
        firestore: await getAvailablePort(),
        app: await getAvailablePort(),
        ui: await getAvailablePort(),
      };
      const configPath = writeTestFirebaseConfig(ports);
      const authEmulatorUrl = `http://${emulatorHost}:${ports.auth}`;

      const reentryCommand = [
        'npx',
        'tsx',
        'scripts/test-e2e-emulator.ts',
        '--inside-emulators',
        ...passthroughArgs,
      ]
        .map(shellQuote)
        .join(' ');

      await runCommand(
        npxCommand(),
        [
          'firebase-tools',
          'emulators:exec',
          '--config',
          configPath,
          '--project',
          projectId,
          '--only',
          'auth,firestore',
          reentryCommand,
        ],
        {
          ...process.env,
          PLAYWRIGHT_FIREBASE_PROJECT_ID: projectId,
          PLAYWRIGHT_FIRESTORE_EMULATOR_HOST: emulatorHost,
          PLAYWRIGHT_FIRESTORE_EMULATOR_PORT: String(ports.firestore),
          PLAYWRIGHT_FIREBASE_AUTH_EMULATOR_URL: authEmulatorUrl,
          PLAYWRIGHT_APP_PORT: String(ports.app),
        }
      );
      return;
    }

    await runCommand(
      npxCommand(),
      ['tsx', 'scripts/seed-platform.ts', '--emulator'],
      {
        ...process.env,
        PLAYWRIGHT_FIREBASE_PROJECT_ID: projectId,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
      }
    );

    await runCommand(
      npxCommand(),
      ['tsx', 'scripts/seed-platform-auth-emulator.ts'],
      {
        ...process.env,
        PLAYWRIGHT_FIREBASE_PROJECT_ID: projectId,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
        NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL:
          process.env.PLAYWRIGHT_FIREBASE_AUTH_EMULATOR_URL ?? 'http://127.0.0.1:9099',
      }
    );

    await runCommand(
      npxCommand(),
      ['playwright', 'test', ...passthroughArgs],
      {
        ...process.env,
        PLAYWRIGHT_USE_FIREBASE_EMULATORS: 'true',
        PLAYWRIGHT_FIREBASE_PROJECT_ID: projectId,
        PLAYWRIGHT_FIRESTORE_EMULATOR_HOST:
          process.env.PLAYWRIGHT_FIRESTORE_EMULATOR_HOST ?? emulatorHost,
        PLAYWRIGHT_FIRESTORE_EMULATOR_PORT:
          process.env.PLAYWRIGHT_FIRESTORE_EMULATOR_PORT ?? '8080',
        PLAYWRIGHT_FIREBASE_AUTH_EMULATOR_URL:
          process.env.PLAYWRIGHT_FIREBASE_AUTH_EMULATOR_URL ?? 'http://127.0.0.1:9099',
        PLAYWRIGHT_APP_PORT: process.env.PLAYWRIGHT_APP_PORT ?? '4001',
      }
    );
  } finally {
    moveFirebaseLogsToArtifacts();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
