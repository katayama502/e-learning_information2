"use client";

import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * グローバルエラーバウンダリコンポーネント
 * API失敗やレンダリングエラーをキャッチし、ユーザーフレンドリーな表示に変換
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm m-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-2">エラーが発生しました</h3>
                    <p className="text-sm text-slate-500 font-bold text-center mb-4 max-w-sm">
                        データの読み込み中に問題が発生しました。ネットワーク接続を確認して、再度お試しください。
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-blue-700 transition-colors active:scale-95"
                    >
                        ページを再読み込み
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * APIフェッチ失敗時に表示するインラインエラーコンポーネント
 */
export function FetchErrorMessage({
    message = 'データの取得に失敗しました',
    onRetry,
}: {
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            </div>
            <p className="text-sm font-bold text-slate-600 mb-1">{message}</p>
            <p className="text-xs text-slate-400 mb-4">通信環境をご確認のうえ、再度お試しください</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-slate-100 text-slate-700 px-5 py-2 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors active:scale-95"
                >
                    再試行
                </button>
            )}
        </div>
    );
}
