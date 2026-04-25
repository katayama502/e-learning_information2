"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

function InterviewshipAdminLoginInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const { authStatus } = useAppStore();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const redirectTo = searchParams?.get('redirectTo') || '/interviewship-admin';

    React.useEffect(() => {
        // 既にログイン済み & interviewship_admins に登録済みなら管理画面へ飛ばす
        const checkSession = async () => {
            if (authStatus !== 'authenticated') return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data: adminRow } = await supabase
                    .from('interviewship_admins')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                if (adminRow) {
                    window.location.href = redirectTo;
                }
            } catch { /* noop */ }
        };
        checkSession();
    }, [authStatus]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                const message = error.message.includes('Invalid login credentials')
                    ? 'メールアドレスまたはパスワードが間違っています'
                    : 'ログインに失敗しました';
                toast.error(message);
                setLoading(false);
                return;
            }

            if (!data.user) {
                toast.error('ユーザー情報の取得に失敗しました');
                setLoading(false);
                return;
            }

            // interviewship_admins に登録があるか確認
            const { data: adminRow, error: adminErr } = await supabase
                .from('interviewship_admins')
                .select('role')
                .eq('user_id', data.user.id)
                .maybeSingle();

            if (adminErr || !adminRow) {
                // 管理者権限がないのでサインアウト
                await supabase.auth.signOut();
                toast.error('このアカウントにはインタビューシップ管理者権限がありません');
                setLoading(false);
                return;
            }

            // AppStore を同期
            const loginAs = useAppStore.getState().loginAs;
            loginAs('admin', data.user.id);

            toast.success('ログインしました');
            window.location.href = redirectTo;
        } catch (error) {
            toast.error('エラーが発生しました');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-100 p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">インタビューシップ管理者ログイン</h1>
                    <p className="text-slate-500 text-sm">運営管理者専用ページ</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-indigo-400 transition-colors"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">パスワード</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-indigo-400 transition-colors pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="text-right mt-1">
                            <button
                                type="button"
                                onClick={() => router.push('/auth/forgot-password')}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                パスワードをお忘れの方はこちら
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:from-indigo-800 hover:to-indigo-950 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                '管理画面にログイン'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <button
                    onClick={() => router.push('/')}
                    className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                >
                    ホームに戻る
                </button>
            </div>
        </div>
    );
}

export default function InterviewshipAdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <InterviewshipAdminLoginInner />
        </Suspense>
    );
}
