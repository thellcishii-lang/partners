'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  smsVerified: boolean;
  loading: boolean;
  reloadProfile: () => Promise<void>;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  smsVerified: false,
  loading: true,
  reloadProfile: async () => {},
  refreshClaims: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [smsVerified, setSmsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    const snap = await getDoc(doc(db, 'users', u.uid));
    setProfile(snap.exists() ? ({ uid: u.uid, ...(snap.data() as object) } as UserProfile) : null);
  };

  const loadClaims = async (u: User | null) => {
    if (!u) {
      setSmsVerified(false);
      return;
    }
    const tokenResult = await u.getIdTokenResult();
    setSmsVerified(tokenResult.claims.smsVerified === true);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await Promise.all([loadProfile(u), loadClaims(u)]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const refreshClaims = async () => {
    const u = auth.currentUser;
    if (!u) {
      setSmsVerified(false);
      return;
    }
    const tokenResult = await u.getIdTokenResult(true);
    setSmsVerified(tokenResult.claims.smsVerified === true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        smsVerified,
        loading,
        reloadProfile: () => loadProfile(auth.currentUser),
        refreshClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
