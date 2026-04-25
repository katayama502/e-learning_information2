import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

type ForbiddenPageProps = {
    searchParams: Promise<{ from?: string }>;
};

export default async function ForbiddenPage({ searchParams }: ForbiddenPageProps) {
    const params = await searchParams;
    const isInterviewshipAdmin = params?.from === 'interviewship-admin';

    const loginPath = isInterviewshipAdmin ? '/login/interviewship-admin' : '/login/company';
    const description = isInterviewshipAdmin
        ? 'このアカウントにはインタビューシップ管理者権限がありません。権限を付与されているアカウントでログインし直してください。'
        : 'このページを閲覧する権限がありません。必要な権限が付与されていない可能性があります。アクセスが必要な場合は管理者にお問い合わせください。';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-6">
                <ShieldAlert className="text-rose-600" size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">アクセス権限がありません</h1>
            <p className="text-slate-500 mb-8 max-w-md">{description}</p>
            <div className="flex gap-3">
                <Link
                    href="/"
                    className="px-5 py-2.5 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors"
                >
                    トップへ戻る
                </Link>
                <Link
                    href={loginPath}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-100 transition-colors"
                >
                    別アカウントでログイン
                </Link>
            </div>
        </div>
    );
}
