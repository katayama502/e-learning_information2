"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, Menu, X, GraduationCap, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { createClient } from '@/utils/supabase/client';

const navItems = [
    { name: '講座管理', icon: BookOpen, href: '/dashboard/company/courses' },
];

export default function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const { authStatus } = useAppStore();

    React.useEffect(() => { setIsMenuOpen(false); }, [pathname]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try { localStorage.removeItem('eis-app-store-v3'); } catch (_) {}
        const supabase = createClient();
        supabase.auth.signOut().catch(() => {});
        import('@/app/actions/auth').then(m => m.logoutAction()).catch(() => {});
        window.location.href = '/login';
    };

    const isActive = (href: string) =>
        pathname === href || pathname?.startsWith(href + '/');

    return (
        <div className="flex min-h-screen bg-zinc-50">

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white border-r border-slate-200 h-screen sticky top-0">
                <div className="px-5 py-5 border-b border-slate-100">
                    <Link href="/dashboard/company" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors">
                            <GraduationCap size={18} className="text-white" />
                        </div>
                        <span className="font-black text-slate-800 text-sm tracking-tight group-hover:text-slate-600 transition-colors">
                            講師ダッシュボード
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                                isActive(item.href)
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                    <Link
                        href="/reskill"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    >
                        <LayoutDashboard size={20} />
                        学習者画面
                    </Link>
                </nav>

                <div className="px-4 pb-5 pt-2">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                        {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                    </button>
                </div>
            </aside>

            {/* Right: mobile header + content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Mobile header */}
                <header className="md:hidden bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sticky top-0 z-40 shrink-0">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 -ml-1 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="font-black text-slate-800 text-sm">講師ダッシュボード</span>
                    <div className="w-10" />
                </header>

                <main className="flex-1 p-5 md:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile drawer overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[100] md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile drawer */}
            <div className={`fixed left-0 top-0 bottom-0 w-64 bg-white z-[110] flex flex-col md:hidden transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-black text-slate-800">講師ダッシュボード</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                                isActive(item.href)
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                    <Link href="/reskill" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50">
                        <LayoutDashboard size={20} />
                        学習者画面
                    </Link>
                </nav>
                <div className="px-4 pb-6 pt-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-slate-800 rounded-xl cursor-pointer"
                    >
                        <LogOut size={18} />
                        ログアウト
                    </button>
                </div>
            </div>
        </div>
    );
}
