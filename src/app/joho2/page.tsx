'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Layers, Trophy, Zap, Star } from 'lucide-react';
import { RankProgressBar } from '@/components/joho2/RankProgressBar';
import type { Unit } from '@/types/joho2';
import { Skeleton } from '@/components/ui/skeleton';

interface MeData {
  profile: { display_name: string; xp: number; rank: string };
  recent_attempts: { id: string; material_id: string; score: number; passed: boolean; created_at: string; materials: { title: string } }[];
}

export default function Joho2DashboardPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/joho2/units').then((r) => r.json()),
      fetch('/api/joho2/me').then((r) => r.json()),
    ]).then(([u, m]) => {
      setUnits(Array.isArray(u) ? u : []);
      setMe(m);
      setLoading(false);
    });
  }, []);

  const xp = me?.profile?.xp ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} />
            <h1 className="text-xl font-black text-slate-800">情報2 学習プラットフォーム</h1>
          </div>
          {me && (
            <div className="flex items-center gap-2 text-sm">
              <Star size={14} className="text-yellow-500" />
              <span className="font-bold text-slate-700">{me.profile.rank}</span>
              <Zap size={14} className="text-yellow-500" />
              <span className="font-bold text-slate-700">{xp} XP</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Welcome */}
        {me && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 mb-8">
            <p className="text-blue-200 text-sm font-bold mb-1">ようこそ</p>
            <h2 className="text-2xl font-black mb-3">{me.profile.display_name} さん</h2>
            <div className="flex items-center gap-2 text-sm">
              <Trophy size={16} className="text-yellow-300" />
              <span>現在のランク: <strong>{me.profile.rank}</strong></span>
            </div>
          </div>
        )}

        {/* Units */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />
            学習ユニット
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : units.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">教材がまだ登録されていません</p>
              <p className="text-sm mt-1">教師または管理者が教材を追加するまでお待ちください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {units.map((unit) => (
                <Link
                  key={unit.id}
                  href={`/joho2/unit/${unit.id}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">{unit.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {unit.materials?.length ?? 0} レッスン
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                  {unit.materials && unit.materials.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {unit.materials.slice(0, 4).map((m) => (
                        <span key={m.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold">
                          {m.title}
                        </span>
                      ))}
                      {unit.materials.length > 4 && (
                        <span className="text-xs text-slate-400 px-2 py-1">+{unit.materials.length - 4}</span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        {me && me.recent_attempts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-black text-slate-800 mb-4">最近の学習</h2>
            <div className="space-y-2">
              {me.recent_attempts.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{a.materials?.title ?? 'レッスン'}</span>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${a.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {a.passed ? '合格' : '不合格'} {a.score}点
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer rank bar */}
      <footer className="sticky bottom-0">
        <RankProgressBar xp={xp} />
      </footer>
    </div>
  );
}
