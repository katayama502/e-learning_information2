'use client';

// ============================================================
//  管理ボード → ユーザー管理APIのクライアント
//  すべて IDトークンを Bearer で付与して呼び出す。
// ============================================================

import { auth } from '@/lib/firebase/client';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'student';
  disabled: boolean;
  createdAt?: string | null;
}

async function authedFetch(url: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'リクエストに失敗しました');
  return data;
}

export async function listUsers(): Promise<AdminUser[]> {
  const data = await authedFetch('/api/admin/users');
  return data.users as AdminUser[];
}

export async function createUser(input: {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'student';
}): Promise<AdminUser> {
  return authedFetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateUser(
  uid: string,
  patch: Partial<{ displayName: string; role: 'admin' | 'student'; disabled: boolean; password: string }>,
): Promise<void> {
  await authedFetch(`/api/admin/users/${uid}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteUser(uid: string): Promise<void> {
  await authedFetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
}
