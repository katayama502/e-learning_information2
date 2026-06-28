'use client';

// ============================================================
//  認証ガード
//  - 未ログイン → /login へ誘導
//  - ログイン済みだが管理者未登録/無効 → アクセス不可表示
//  - requireAdmin の場合は role=admin のみ許可
// ============================================================

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { isFirebaseConfigured } from '@/lib/firebase/client';

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      {children}
    </div>
  );
}

export function RequireAuth({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, profile, loading, profileLoading, isAdmin, isAllowed, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (!isFirebaseConfigured) {
    return (
      <FullScreen>
        <ShieldAlert size={40} className="text-amber-500" />
        <p className="font-black text-slate-800">Firebaseが未設定です</p>
        <p className="text-sm text-slate-500 max-w-md">
          環境変数（NEXT_PUBLIC_FIREBASE_*）を設定してください。詳しくは README を参照。
        </p>
      </FullScreen>
    );
  }

  if (loading || profileLoading) {
    return (
      <FullScreen>
        <Loader2 size={32} className="animate-spin text-purple-600" />
        <p className="text-sm font-bold text-slate-500">読み込み中...</p>
      </FullScreen>
    );
  }

  if (!user) {
    return (
      <FullScreen>
        <Loader2 size={32} className="animate-spin text-purple-600" />
        <p className="text-sm font-bold text-slate-500">ログインページへ移動中...</p>
      </FullScreen>
    );
  }

  // ログイン済みだが、管理者に登録されていない/無効化されている
  if (!isAllowed || !profile) {
    return (
      <FullScreen>
        <ShieldAlert size={40} className="text-red-500" />
        <p className="font-black text-slate-800">アクセス権がありません</p>
        <p className="text-sm text-slate-500 max-w-md">
          このアカウントは管理者に登録されていないか、無効化されています。<br />
          管理者にお問い合わせください。
        </p>
        <button
          onClick={() => logout()}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-slate-700"
        >
          <LogOut size={16} /> ログアウト
        </button>
      </FullScreen>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <FullScreen>
        <ShieldAlert size={40} className="text-red-500" />
        <p className="font-black text-slate-800">管理者権限が必要です</p>
        <p className="text-sm text-slate-500">このページは管理者のみアクセスできます。</p>
        <button
          onClick={() => router.replace('/joho2')}
          className="mt-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700"
        >
          学習ページへ戻る
        </button>
      </FullScreen>
    );
  }

  return <>{children}</>;
}
