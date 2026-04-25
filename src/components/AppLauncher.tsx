"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Grid3x3, ExternalLink, Building2, Target, Briefcase } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type AppId = 'ehime-base-admin' | 'interviewship-admin' | 'eis-crm' | 'company-dashboard';

interface AppEntry {
    id: AppId;
    label: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ size?: number }>;
    external?: boolean;
    requiresMasterAdmin?: boolean;
    requiresInterviewshipAdmin?: boolean;
    requiresOrgMember?: boolean;
}

const ALL_APPS: AppEntry[] = [
    {
        id: 'ehime-base-admin',
        label: 'Ehime Base 管理',
        description: '全プラットフォーム管理（マスター専用）',
        href: '/admin',
        icon: Building2,
        requiresMasterAdmin: true,
    },
    {
        id: 'interviewship-admin',
        label: 'インタビューシップ運営',
        description: '申込管理・メール一斉送信',
        href: '/interviewship-admin',
        icon: Target,
        requiresInterviewshipAdmin: true,
    },
    {
        id: 'eis-crm',
        label: 'EIS 顧客管理',
        description: '別アプリ（顧客・商談管理）',
        href: 'https://eis-business-manager.vercel.app',
        icon: ExternalLink,
        external: true,
        requiresMasterAdmin: true,
    },
    {
        id: 'company-dashboard',
        label: '自社ダッシュボード',
        description: '参加企業としてログイン',
        href: '/dashboard/company',
        icon: Briefcase,
        requiresOrgMember: true,
    },
];

interface Props {
    currentApp: AppId;
}

export default function AppLauncher({ currentApp }: Props) {
    const [open, setOpen] = useState(false);
    const [availableApps, setAvailableApps] = useState<AppEntry[]>([]);

    useEffect(() => {
        const run = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setAvailableApps([]);
                return;
            }

            // 並行で各フラグを取得
            const [{ data: profile }, { data: adminRow }, { data: membership }] = await Promise.all([
                supabase.from('profiles').select('user_type').eq('id', user.id).maybeSingle(),
                supabase.from('interviewship_admins').select('role').eq('user_id', user.id).maybeSingle(),
                supabase.from('organization_members').select('organization_id').eq('user_id', user.id).maybeSingle(),
            ]);

            const isMaster = profile?.user_type === 'admin';
            const isInterviewshipAdmin = !!adminRow;
            const isOrgMember = !!membership;

            const available = ALL_APPS.filter(app => {
                if (app.id === currentApp) return false; // 現在地は除外
                if (app.requiresMasterAdmin && !isMaster) return false;
                if (app.requiresInterviewshipAdmin && !isInterviewshipAdmin) return false;
                if (app.requiresOrgMember && !isOrgMember) return false;
                return true;
            });
            setAvailableApps(available);
        };
        void run();
    }, [currentApp]);

    if (availableApps.length === 0) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-indigo-200 hover:text-white hover:bg-indigo-800/60 rounded-lg transition-all text-left"
                aria-label="アプリ切替"
            >
                <Grid3x3 size={18} />
                アプリ切替え
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-2 space-y-1">
                        {availableApps.map(app => {
                            const Icon = app.icon;
                            const content = (
                                <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm flex items-center gap-1">
                                            {app.label}
                                            {app.external && <ExternalLink size={12} className="text-slate-400" />}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">{app.description}</div>
                                    </div>
                                </div>
                            );
                            return app.external ? (
                                <a
                                    key={app.id}
                                    href={app.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                >
                                    {content}
                                </a>
                            ) : (
                                <Link key={app.id} href={app.href} onClick={() => setOpen(false)}>
                                    {content}
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
