"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, LogOut, LogIn, Menu, ShieldCheck, PanelLeftClose, PanelLeftOpen, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import MobileBottomNav from './MobileBottomNav';
import ScrollToTop from './ScrollToTop';
import { createClient } from '@/utils/supabase/client';
import { ErrorBoundary } from './ui/ErrorBoundary';
import pkg from '../../package.json';

interface NavItem {
    name: string;
    icon: any;
    href: string;
    badge?: number;
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const { authStatus, activeRole, logout } = useAppStore();

    const isAdmin = activeRole === 'admin';
    const isAuthenticated = authStatus === 'authenticated';

    const router = useRouter();

    const allNavItems: NavItem[] = [
        { name: 'リスキル大学', icon: GraduationCap, href: '/reskill' },
        { name: '管理者画面', icon: ShieldCheck, href: '/admin/elearning' },
    ];

    const navItems = allNavItems.filter(item => {
        if (item.href === '/admin/elearning' && !isAdmin) return false;
        return true;
    });

    const isAdminDashboard = pathname?.startsWith('/admin');
    const isPublicPage = pathname === '/' || pathname === '/welcome' || pathname?.startsWith('/login') || pathname?.startsWith('/auth/reset-password');
    const isCommunication = false;

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);

    React.useEffect(() => {
        const checkSession = async () => {
            if (authStatus === 'authenticated') {
                const supabase = createClient();
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        await logout();
                        try { localStorage.removeItem('eis-app-store-v3'); } catch (e) { }
                        const protectedRoutes = ['/reskill', '/admin'];
                        const isProtected = protectedRoutes.some(r => window.location.pathname.startsWith(r));
                        if (isProtected) window.location.href = '/login';
                    }
                } catch (error: any) {
                    if (error.name === 'AbortError' || error.message?.includes('aborted')) return;
                    console.error('Session check failed:', error);
                }
            }
        };

        window.addEventListener('focus', checkSession);
        window.addEventListener('visibilitychange', checkSession);
        checkSession();
        return () => {
            window.removeEventListener('focus', checkSession);
            window.removeEventListener('visibilitychange', checkSession);
        };
    }, [pathname, authStatus]);

    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try { localStorage.removeItem('eis-app-store-v3'); } catch (e) { }
        const supabase = createClient();
        supabase.auth.signOut().catch(() => { });
        import('@/app/actions/auth').then(m => m.logoutAction()).catch(() => { });
        window.location.href = '/login';
    };

    const renderNavItems = (onClick?: () => void, collapsed?: boolean) => (
        <nav className={`flex-1 ${collapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClick}
                        title={collapsed ? item.name : undefined}
                        className={`relative flex items-center ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-zinc-100 text-eis-navy' : 'text-zinc-500 hover:bg-zinc-50'}`}
                    >
                        <item.icon size={20} />
                        {!collapsed && item.name}
                    </Link>
                );
            })}
        </nav>
    );

    if (isPublicPage || isAdminDashboard) {
        return <ErrorBoundary>{children}</ErrorBoundary>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
            {/* PC Sidebar */}
            <aside className={`hidden md:flex ${isSidebarCollapsed ? 'w-16' : 'w-64'} shrink-0 bg-white border-r border-zinc-200 flex-col h-screen sticky top-0 transition-all duration-300`}>
                <div className={`${isSidebarCollapsed ? 'p-2' : 'px-4 py-4'} border-b border-zinc-100 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {isSidebarCollapsed ? (
                        <div className="relative w-full flex justify-center">
                            <Link href="/reskill" className="hover:opacity-80 transition-opacity">
                                <img src="/eis_logo_mark.png" alt="Logo" className="h-8 w-auto" />
                            </Link>
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className="absolute -right-0.5 -bottom-1.5 text-zinc-500 hover:text-blue-500 transition-colors"
                                title="メニューを展開"
                            >
                                <span className="text-[8px] leading-none">▶</span>
                            </button>
                        </div>
                    ) : (
                        <Link href="/reskill" className="flex items-center group">
                            <img src="/eis_logo_mark.png" alt="Logo" className="h-9 w-auto group-hover:opacity-80 transition-opacity" />
                            <span className="font-black text-eis-navy text-lg ml-2 tracking-tighter group-hover:text-blue-600 transition-colors">リスキル大学</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={`${isSidebarCollapsed ? 'hidden' : ''} p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors`}
                        title="メニューを折りたたむ"
                    >
                        <PanelLeftClose size={18} />
                    </button>
                </div>

                {renderNavItems(undefined, isSidebarCollapsed)}

                <div className={`${isSidebarCollapsed ? 'px-2' : 'px-4'} pb-4`}>
                    {mounted && isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            title={isSidebarCollapsed ? 'ログアウト' : undefined}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} text-sm font-bold text-white bg-eis-navy rounded-xl hover:bg-slate-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50`}
                        >
                            {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                            {!isSidebarCollapsed && (isLoggingOut ? 'ログアウト中...' : 'ログアウト')}
                        </button>
                    ) : mounted ? (
                        <Link
                            href="/login"
                            title={isSidebarCollapsed ? 'ログイン' : undefined}
                            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm`}
                        >
                            <LogIn size={20} />
                            {!isSidebarCollapsed && 'ログイン'}
                        </Link>
                    ) : (
                        <div className="w-full h-[46px] rounded-xl bg-slate-100 animate-pulse" />
                    )}
                </div>

                {/* Version */}
                <div className={`${isSidebarCollapsed ? 'px-2 py-1' : 'px-4 py-1'} text-center`}>
                    <span className="text-[10px] text-zinc-300 font-mono">v{pkg.version}</span>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="mobile-header md:hidden h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-6 sticky top-0 z-50 shrink-0">
                <button onClick={() => setIsMenuOpen(true)}>
                    <Menu className="text-zinc-600" size={24} />
                </button>
                <Link href="/reskill" className="flex items-center">
                    <img src="/eis_logo_mark.png" alt="Logo" className="h-8 w-auto" />
                    <span className="font-black text-eis-navy text-lg ml-1.5 tracking-tighter">リスキル大学</span>
                </Link>
                <div className="w-6" />
            </header>

            {/* Mobile Side Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            >
                <div
                    className={`absolute left-0 top-0 bottom-0 w-64 bg-white transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-center">
                        <Link href="/reskill" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                            <img src="/eis_logo_mark.png" alt="Logo" className="h-8 w-auto" />
                            <span className="font-black text-eis-navy text-lg ml-2 tracking-tighter">リスキル大学</span>
                        </Link>
                    </div>
                    {renderNavItems(() => setIsMenuOpen(false))}

                    <div className="px-4 pb-4">
                        {mounted && isAuthenticated ? (
                            <button
                                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-eis-navy rounded-xl cursor-pointer"
                            >
                                <LogOut size={20} />
                                ログアウト
                            </button>
                        ) : mounted ? (
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl"
                            >
                                <LogIn size={20} />
                                ログイン
                            </Link>
                        ) : (
                            <div className="w-full h-[46px] rounded-xl bg-slate-100 animate-pulse" />
                        )}
                    </div>

                    {/* Version */}
                    <div className="px-4 py-1 text-center">
                        <span className="text-[10px] text-zinc-300 font-mono">v{pkg.version}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 pb-24 md:pb-0 min-h-screen">
                <ErrorBoundary>{children}</ErrorBoundary>
            </main>

            <ScrollToTop />
            <MobileBottomNav />
        </div>
    );
}
