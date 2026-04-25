"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Layout, BookOpen, Menu, X,
    GraduationCap, LogOut, LogIn, ShieldCheck, Loader2
} from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { createClient } from '@/utils/supabase/client';

type NavItem = {
    name: string;
    icon: React.ElementType;
    href: string;
    exact?: boolean;
};

const baseNavItems: NavItem[] = [
    { name: 'Dashboard', icon: Layout, href: '/reskill', exact: true },
    { name: 'Courses',   icon: BookOpen, href: '/reskill/courses' },
];

export default function ReskillLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const { authStatus, activeRole } = useAppStore();

    const isAuthenticated = authStatus === 'authenticated';
    const isAdmin = activeRole === 'admin';

    React.useEffect(() => { setMounted(true); }, []);

    // Close drawer on route change
    React.useEffect(() => { setIsMenuOpen(false); }, [pathname]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try { localStorage.removeItem('eis-app-store-v3'); } catch (_) {}
        const supabase = createClient();
        supabase.auth.signOut().catch(() => {});
        import('@/app/actions/auth').then(m => m.logoutAction()).catch(() => {});
        window.location.href = '/login';
    };

    const navItems: NavItem[] = [
        ...baseNavItems,
        ...(isAdmin ? [{ name: '管理者画面', icon: ShieldCheck, href: '/admin/elearning' }] : []),
    ];

    // Lesson pages: full-screen video player — skip sidebar entirely
    const isLessonPage = pathname?.startsWith('/reskill/lesson/');
    if (isLessonPage) return <>{children}</>;

    const renderNavLinks = (onClick?: () => void) =>
        navItems.map((item) => {
            const isActive = item.exact
                ? pathname === item.href
                : !!(pathname?.startsWith(item.href));
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                        isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                    <item.icon size={20} />
                    {item.name}
                </Link>
            );
        });

    const renderAuthButton = (onClose?: () => void) => {
        if (!mounted) return <div className="w-full h-11 rounded-xl bg-slate-100 animate-pulse" />;
        if (isAuthenticated) {
            return (
                <button
                    onClick={() => { onClose?.(); handleLogout(); }}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {isLoggingOut
                        ? <Loader2 size={18} className="animate-spin" />
                        : <LogOut size={18} />}
                    {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                </button>
            );
        }
        return (
            <Link
                href="/login"
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
                <LogIn size={18} />
                ログイン
            </Link>
        );
    };

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* ── Desktop Sidebar ─────────────────────────── */}
            <aside className="hidden md:flex w-56 shrink-0 flex-col bg-white border-r border-slate-200 h-screen sticky top-0">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-slate-100">
                    <Link href="/reskill" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 group-hover:bg-blue-700 transition-colors">
                            <GraduationCap size={18} className="text-white" />
                        </div>
                        <span className="font-black text-slate-800 text-base tracking-tight group-hover:text-blue-600 transition-colors">
                            リスキル大学
                        </span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {renderNavLinks()}
                </nav>

                {/* Auth */}
                <div className="px-4 pb-5 pt-2">
                    {renderAuthButton()}
                </div>
            </aside>

            {/* ── Right: Mobile header + page content ─────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Mobile sticky header */}
                <header className="md:hidden bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sticky top-0 z-40 shrink-0">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 -ml-1 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label="メニューを開く"
                    >
                        <Menu size={22} />
                    </button>

                    <Link href="/reskill" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <GraduationCap size={15} className="text-white" />
                        </div>
                        <span className="font-black text-slate-800 text-sm tracking-tight">リスキル大学</span>
                    </Link>

                    {/* spacer */}
                    <div className="w-10" />
                </header>

                {/* Page content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>

            {/* ── Mobile Drawer Overlay ────────────────────── */}
            <div
                className={`fixed inset-0 bg-black/50 z-[100] md:hidden transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer panel */}
            <div
                className={`fixed left-0 top-0 bottom-0 w-64 bg-white z-[110] flex flex-col md:hidden transition-transform duration-300 ease-out ${
                    isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Drawer header */}
                <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
                    <Link
                        href="/reskill"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <GraduationCap size={18} className="text-white" />
                        </div>
                        <span className="font-black text-slate-800 text-base tracking-tight">リスキル大学</span>
                    </Link>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="メニューを閉じる"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Drawer nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {renderNavLinks(() => setIsMenuOpen(false))}
                </nav>

                {/* Drawer auth */}
                <div className="px-4 pb-6 pt-2">
                    {renderAuthButton(() => setIsMenuOpen(false))}
                </div>
            </div>
        </div>
    );
}
