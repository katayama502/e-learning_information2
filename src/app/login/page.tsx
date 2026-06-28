'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Loader2, LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { isFirebaseConfigured } from '@/lib/firebase/client';

export default function LoginPage() {
  const { user, profile, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  // ログイン済みなら適切なページへ
  useEffect(() => {
    if (loading || !user) return;
    if (profile && !profile.disabled) {
      router.replace(isAdmin ? '/admin' : '/joho2');
    }
  }, [loading, user, profile, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // 遷移は useEffect が処理
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (code === 'auth/too-many-requests') {
        setError('試行回数が多すぎます。しばらくしてからお試しください。');
      } else if (code === 'auth/invalid-email') {
        setError('メールアドレスの形式が正しくありません。');
      } else {
        setError('ログインに失敗しました。時間をおいて再度お試しください。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-purple-900/50">
            <Code2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">情報2 学習プラットフォーム</h1>
          <p className="text-sm text-purple-200 mt-1">ログインして学習を始めましょう</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-6 space-y-4"
        >
          {!isFirebaseConfigured && (
            <p className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3">
              Firebaseが未設定です。環境変数（NEXT_PUBLIC_FIREBASE_*）を設定してください。
            </p>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">メールアドレス</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">パスワード</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !isFirebaseConfigured}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {submitting ? 'ログイン中...' : 'ログイン'}
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            アカウントは管理者が発行します。<br />
            ログインできない場合は管理者にお問い合わせください。
          </p>
        </form>

        {/* 既にログイン済みだが権限が無い場合の導線 */}
        {user && profile?.disabled && (
          <button
            onClick={() => logout()}
            className="w-full mt-3 text-xs text-purple-200 underline"
          >
            別のアカウントでログイン
          </button>
        )}
      </div>
    </div>
  );
}
