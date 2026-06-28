'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, BookOpen, ShieldCheck, GraduationCap, LogOut } from 'lucide-react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/lib/auth/AuthProvider';

function AdminNav() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const items = [
    { href: '/admin/users', label: 'ユーザー管理', icon: Users },
    { href: '/admin/curriculum', label: 'カリキュラム管理', icon: BookOpen },
  ];

  return (
    <aside className="w-60 bg-[#0f1117] text-white flex flex-col shrink-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <ShieldCheck size={20} className="text-amber-400" />
        <span className="font-black text-sm">管理ボード</span>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                active ? 'bg-amber-500/20 text-amber-200' : 'text-slate-400 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        <Link
          href="/joho2"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/8 hover:text-white transition-colors"
        >
          <GraduationCap size={16} />
          学習ページへ
        </Link>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="px-1 mb-2 min-w-0">
          <p className="text-xs font-bold text-slate-200 truncate">{profile?.displayName || '管理者'}</p>
          <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors"
        >
          <LogOut size={13} /> ログアウト
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth requireAdmin>
      <div className="flex h-screen overflow-hidden bg-slate-100">
        <AdminNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </RequireAuth>
  );
}
