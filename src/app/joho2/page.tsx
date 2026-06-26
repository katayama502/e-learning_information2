'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Code2, Trophy, Zap, Star, CheckCircle2 } from 'lucide-react';
import { RankProgressBar } from '@/components/joho2/RankProgressBar';
import { JOHO2_UNITS } from '@/data/joho2-lessons';
import { loadProgress, type Joho2Progress } from '@/lib/joho2Store';

export default function Joho2DashboardPage() {
  const [progress, setProgress] = useState<Joho2Progress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const xp = progress?.xp ?? 0;
  const totalLessons = JOHO2_UNITS.flatMap((u) => u.materials).length;
  const passedCount = progress?.passedLessons.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="text-purple-600" size={24} />
            <h1 className="text-xl font-black text-slate-800">情報2 学習プラットフォーム</h1>
          </div>
          {progress && (
            <div className="flex items-center gap-3 text-sm">
              <Star size={14} className="text-yellow-500" />
              <span className="font-bold text-slate-700">{progress.rank}</span>
              <Zap size={14} className="text-yellow-500" />
              <span className="font-bold text-slate-700">{xp} XP</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-black text-purple-600">{xp}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">獲得XP</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">{passedCount}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">合格レッスン</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-black text-blue-600">{totalLessons}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">全レッスン数</p>
          </div>
        </div>

        {/* Units */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-purple-600" />
            学習ユニット
          </h2>
          <div className="space-y-4">
            {JOHO2_UNITS.map((unit) => {
              const unitPassed = unit.materials.filter(
                (m) => progress?.passedLessons.includes(m.id)
              ).length;
              return (
                <Link
                  key={unit.id}
                  href={`/joho2/unit/${unit.id}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">{unit.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {unit.materials.length} レッスン
                        {unitPassed > 0 && (
                          <span className="ml-2 text-emerald-600 font-bold">
                            ✓ {unitPassed} 合格済み
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${(unitPassed / unit.materials.length) * 100}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="sticky bottom-0">
        <RankProgressBar xp={xp} />
      </footer>
    </div>
  );
}
