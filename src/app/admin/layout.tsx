"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    Folder,
    LogOut,
    Menu,
    X,
    ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { createClient } from '@/utils/supabase/client';

const sidebarItems = [
    { name: '管理ホーム',           icon: LayoutDashboard, href: '/admin',                    exact: true },
    { name: 'トラック管理',         icon: GraduationCap,   href: '/admin/elearning',           exact: true },
    { name: 'コンテンツ管理',       icon: BookOpen,        href: '/admin/elearning/content',   exact: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const { logout } = useAppStore();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try { localStorage.removeItem('eis-app-store-v3'); } catch (_) {}
        const supabase = createClient();
        supabase.auth.signOut().catch(() => {});
        import('@/app/actions/auth').then(m => m.logoutAction()).catch(() => {});
        window.location.href = '/login';
    };

    const isActive = (item: typeof sidebarItems[0]) =>
        item.exact ? pathname === item.href : (pathname === item.href || pathname?.startsWith(item.href + '/'));

    return (
        <div className="h-screen overflow-hidden bg-slate-50 flex">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-white border-r border-slate-800 shrink-0">
                {/* Logo */}
                <div className="p-5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                            <ShieldCheck size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 leading-none">リスキル大学</p>
                            <p className="text-sm font-black text-white leading-tight">管理者画面</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                isActive(item)
                                    ? 'bg-red-500 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 space-y-1">
                    <Link
                        href="/reskill"
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <GraduationCap size={18} />
                        ユーザー画面を見る
                    </Link>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all text-left disabled:opacity-50"
                    >
                        <LogOut size={18} />
                        {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                    </button>
                </div>
            </aside>

            {/* Mobile Header + Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <header className="md:hidden h-14 bg-slate-900 text-white flex items-center justify-between px-5 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
                            <ShieldCheck size={15} className="text-white" />
                        </div>
                        <span className="text-sm font-black">管理者画面</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="md:hidden fixed inset-0 z-40 bg-slate-900/95 pt-14"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <nav className="px-6 py-4 space-y-2" onClick={e => e.stopPropagation()}>
                            {sidebarItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 py-3 px-4 rounded-xl font-bold transition-all ${
                                        isActive(item) ? 'bg-red-500 text-white' : 'text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            ))}
                            <Link
                                href="/reskill"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 py-3 px-4 text-slate-400 font-bold hover:bg-slate-800 rounded-xl border-t border-slate-800 mt-4"
                            >
                                <GraduationCap size={20} />
                                ユーザー画面を見る
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 py-3 px-4 text-slate-400 font-bold hover:bg-slate-800 rounded-xl text-left"
                            >
                                <LogOut size={20} />
                                ログアウト
                            </button>
                        </nav>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-5 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
