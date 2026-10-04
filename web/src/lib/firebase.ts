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

// Codespaces では各ポートが https://<codespace>-<port>.app.github.dev として公開される。
// ブラウザからは 127.0.0.1 に届かないので、Web(3000) のホスト名のポート部分を置換して接続する。
const codespacesHostFor = (port: number): string | null => {
  if (typeof window === 'undefined') return null;
  const { hostname } = window.location;
  if (!hostname.endsWith('.app.github.dev')) return null;
  return hostname.replace(/-\d+(\.app\.github\.dev)$/, `-${port}$1`);
};

const isCodespaces = useEmu && codespacesHostFor(EMULATOR_PORTS.auth) !== null;

export const auth = getAuth(app);

// connectFirestoreEmulator は Firebase Studio 以外では ssl:false 固定のため、
// Codespaces では initializeFirestore で https(443) の host を直接指定する。
const createDb = (): Firestore => {
  if (!isCodespaces) return getFirestore(app);
  try {
    return initializeFirestore(app, {
      host: `${codespacesHostFor(EMULATOR_PORTS.firestore)}:443`,
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
      connectAuthEmulator(auth, `https://${codespacesHostFor(EMULATOR_PORTS.auth)}`, {
        disableWarnings: true,
      });

      // connectStorageEmulator / connectFunctionsEmulator も http 固定なので https に差し替える
      connectStorageEmulator(storage, codespacesHostFor(EMULATOR_PORTS.storage)!, 443);
      (storage as unknown as { _protocol: string })._protocol = 'https';

      (functions as unknown as { emulatorOrigin: string }).emulatorOrigin =
        `https://${codespacesHostFor(EMULATOR_PORTS.functions)}`;
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
