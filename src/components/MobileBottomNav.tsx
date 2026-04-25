"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LogIn, ShieldCheck } from 'lucide-react';
import { clsx } from "clsx";
import { useAppStore } from '@/lib/appStore';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { authStatus, activeRole } = useAppStore();
    const isAuthenticated = authStatus === 'authenticated';
    const isAdmin = activeRole === 'admin';

    const navItems = [
        { name: 'リスキル大学', href: '/reskill', icon: GraduationCap },
        ...(isAdmin ? [{ name: '管理者画面', href: '/admin/elearning', icon: ShieldCheck }] : []),
        ...(!isAuthenticated ? [{ name: 'ログイン', href: '/login', icon: LogIn }] : []),
    ];

    // 管理画面では非表示
    if (pathname?.startsWith('/admin')) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 pb-safe z-50">
            <div className="flex overflow-x-auto no-scrollbar px-2 gap-2 justify-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 p-2 min-w-[72px] transition-colors shrink-0 rounded-lg",
                                isActive ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[9px] font-bold whitespace-nowrap">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
