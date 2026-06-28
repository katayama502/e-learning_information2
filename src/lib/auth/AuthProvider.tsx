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
  /** 初期認証チェック中 */
  loading: boolean;
  /** Firestore プロフィール取得中（ログイン直後の非同期フェッチ） */
  profileLoading: boolean;
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
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    let generation = 0; // 複数発火時に古い fetchProfile の結果を破棄する
    const unsub = onAuthStateChanged(auth, async (u) => {
      const myGen = ++generation;
      setUser(u);
      if (u) {
        setProfileLoading(true);
        try {
          const p = await fetchProfile(u);
          if (myGen !== generation) return; // 後続コールバックがすでに走っている場合は破棄
          setProfile(p);
        } catch {
          if (myGen !== generation) return;
          setProfile(null);
        } finally {
          if (myGen === generation) setProfileLoading(false);
        }
      } else {
        setProfile(null);
      }
      if (myGen === generation) setLoading(false);
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
      value={{ user, profile, loading, profileLoading, isAdmin, isAllowed, login, logout, getIdToken, refreshProfile }}
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
