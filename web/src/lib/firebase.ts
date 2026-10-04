import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const FUNCTIONS_REGION = 'asia-northeast1';

const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
  storage: 9199,
  functions: 5001,
} as const;

const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];

const useEmu = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true' && typeof window !== 'undefined';

const isCodespaces = useEmu && window.location.hostname.endsWith('.app.github.dev');

export const auth = getAuth(app);

// Codespaces の Emulator 通信は Next.js の同一オリジン proxy 経由にする。
const createDb = (): Firestore => {
  if (!isCodespaces) return getFirestore(app);
  try {
    return initializeFirestore(app, {
      host: `${window.location.hostname}:443`,
      ssl: true,
    });
  } catch {
    // HMR などで既に初期化済みの場合
    return getFirestore(app);
  }
};

export const db = createDb();
export const storage = getStorage(app);
export const functions = getFunctions(app, FUNCTIONS_REGION);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

if (useEmu) {
  const w = window as unknown as { __FB_EMU__?: boolean };

  if (!w.__FB_EMU__) {
    if (isCodespaces) {
      connectAuthEmulator(auth, `${window.location.origin}/__firebase/auth`, {
        disableWarnings: true,
      });

      connectStorageEmulator(storage, window.location.hostname, 443);
      (storage as unknown as { _protocol: string })._protocol = 'https';

      (functions as unknown as { emulatorOrigin: string }).emulatorOrigin =
        `${window.location.origin}/__firebase/functions`;
    } else {
      connectAuthEmulator(auth, `http://127.0.0.1:${EMULATOR_PORTS.auth}`, {
        disableWarnings: true,
      });
      connectFirestoreEmulator(db, '127.0.0.1', EMULATOR_PORTS.firestore);
      connectStorageEmulator(storage, '127.0.0.1', EMULATOR_PORTS.storage);
      connectFunctionsEmulator(functions, '127.0.0.1', EMULATOR_PORTS.functions);
    }

    w.__FB_EMU__ = true;
  }
}
