'use client';

// ============================================================
//  認証コンテキスト（Firebase Auth + Firestore のユーザープロフィール）
//  - サインアップは無し。ユーザーは管理者がAdminSDK経由で作成する。
//  - ログイン中ユーザーの role / disabled を Firestore users/{uid} から取得。
//  - disabled もしくは users ドキュメントが無い場合はアクセス不可。
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client';

export type Role = 'admin' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  disabled: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  /** 管理者が登録した有効ユーザーか（学習ページに入れるか） */
  isAllowed: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(u: User): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', u.uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: u.uid,
    email: u.email ?? (d.email as string) ?? '',
    displayName: (d.displayName as string) ?? '',
    role: (d.role as Role) ?? 'student',
    disabled: Boolean(d.disabled),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          setProfile(await fetchProfile(u));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const getIdToken = useCallback(async () => {
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) setProfile(await fetchProfile(auth.currentUser));
  }, []);

  const isAdmin = profile?.role === 'admin' && !profile?.disabled;
  const isAllowed = Boolean(profile) && !profile?.disabled;

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAdmin, isAllowed, login, logout, getIdToken, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
