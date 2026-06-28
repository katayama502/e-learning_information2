'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, PlayCircle, ArrowRight, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/joho2/AppShell';
import { useCurriculum } from '@/lib/curriculum/CurriculumProvider';
import { useProgress } from '@/lib/progress/ProgressProvider';

export default function Joho2DashboardPage() {
  const { units, loading } = useCurriculum();
  const { progress } = useProgress();

  const xp = progress?.xp ?? 0;
  const allMaterials = units.flatMap((u) => u.materials);
  const totalLessons = allMaterials.length;
  const passedCount = progress?.passedLessons.length ?? 0;

  const passed = new Set(progress?.passedLessons ?? []);
  const nextLesson = allMaterials.find((m) => !passed.has(m.id)) ?? allMaterials[0];

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">ダッシュボード</h1>
          <p className="text-sm text-slate-500 mt-1">学習の進捗を確認しよう</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span className="font-bold text-sm">カリキュラムを読み込み中...</span>
          </div>
        ) : units.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3" />
            <p className="font-bold">カリキュラムがまだありません</p>
            <p className="text-xs mt-1">管理者がカリキュラムを登録すると、ここに表示されます。</p>
          </div>
        ) : (
          <>
            {/* Next lesson CTA */}
            {nextLesson && (
              <Link
                href={`/joho2/lesson/${nextLesson.id}`}
                className="flex items-center gap-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-200"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <PlayCircle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-purple-200 mb-0.5">次のレッスン</p>
                  <p className="font-black text-lg truncate">{nextLesson.title}</p>
                </div>
                <ArrowRight size={22} className="shrink-0" />
              </Link>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
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
              <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen size={18} className="text-purple-600" />
                学習ユニット
              </h2>
              <div className="space-y-3">
                {units.map((unit) => {
                  const unitPassed = unit.materials.filter(
                    (m) => progress?.passedLessons.includes(m.id)
                  ).length;
                  const total = Math.max(unit.materials.length, 1);
                  return (
                    <Link
                      key={unit.id}
                      href={`/joho2/unit/${unit.id}`}
                      className="block bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-black text-slate-800">{unit.title}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {unit.materials.length} レッスン
                            {unitPassed > 0 && (
                              <span className="ml-2 text-emerald-600 font-bold">
                                ✓ {unitPassed} 合格済み
                              </span>
                            )}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${(unitPassed / total) * 100}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
