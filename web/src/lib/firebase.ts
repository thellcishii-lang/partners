cat > /workspaces/partners/web/src/lib/firebase.ts << 'EOF'
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isBrowser = typeof window !== 'undefined';
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// ビルド中は Firebase を初期化しない（ダミーを返す）
function ensureApp(): FirebaseApp {
  if (getApps().length > 0) return getApps()[0];
  if (!config.apiKey) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY');
  }
  return initializeApp(config);
}

let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  const app = ensureApp();
  _auth = getAuth(app);

  const useEmu = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';
  if (useEmu && isBrowser) {
    const w = window as unknown as { __FB_EMU_AUTH__?: boolean };
    if (!w.__FB_EMU_AUTH__) {
      const hostname = window.location.hostname;
      const isCodespaces = hostname.endsWith('.app.github.dev');
      const authUrl = isCodespaces
        ? `https://${hostname.replace(/-3000\./, '-9099.')}`
        : 'http://127.0.0.1:9099';
      connectAuthEmulator(_auth, authUrl, { disableWarnings: true });
      w.__FB_EMU_AUTH__ = true;
    }
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (_db) return _db;
  const app = ensureApp();
  _db = getFirestore(app);

  const useEmu = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';
  if (useEmu && isBrowser) {
    const w = window as unknown as { __FB_EMU_DB__?: boolean };
    if (!w.__FB_EMU_DB__) {
      const hostname = window.location.hostname;
      const isCodespaces = hostname.endsWith('.app.github.dev');
      if (isCodespaces) {
        connectFirestoreEmulator(_db, hostname.replace(/-3000\./, '-8080.'), 443);
      } else {
        connectFirestoreEmulator(_db, '127.0.0.1', 8080);
      }
      w.__FB_EMU_DB__ = true;
    }
  }
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (_storage) return _storage;
  const app = ensureApp();
  _storage = getStorage(app);

  const useEmu = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';
  if (useEmu && isBrowser) {
    const w = window as unknown as { __FB_EMU_ST__?: boolean };
    if (!w.__FB_EMU_ST__) {
      const hostname = window.location.hostname;
      const isCodespaces = hostname.endsWith('.app.github.dev');
      if (isCodespaces) {
        connectStorageEmulator(_storage, hostname.replace(/-3000\./, '-9199.'), 443);
      } else {
        connectStorageEmulator(_storage, '127.0.0.1', 9199);
      }
      w.__FB_EMU_ST__ = true;
    }
  }
  return _storage;
}

// ビルド時に評価されない遅延 Proxy
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const a = getFirebaseAuth();
    const v = (a as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === 'function' ? v.bind(a) : v;
  },
});

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const d = getFirebaseDb();
    const v = (d as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === 'function' ? v.bind(d) : v;
  },
});

export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_target, prop) {
    const s = getFirebaseStorage();
    const v = (s as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === 'function' ? v.bind(s) : v;
  },
});
EOF
