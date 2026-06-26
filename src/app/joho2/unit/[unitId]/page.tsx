'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PlayCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { AppShell } from '@/components/joho2/AppShell';
import { JOHO2_UNITS } from '@/data/joho2-lessons';
import { loadProgress, type Joho2Progress } from '@/lib/joho2Store';

export default function UnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const [progress, setProgress] = useState<Joho2Progress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  const unit = JOHO2_UNITS.find((u) => u.id === unitId);

  if (!unit) {
    return (
      <AppShell>
        <div className="min-h-full flex items-center justify-center">
          <p className="text-slate-500 font-bold">ユニットが見つかりません</p>
        </div>
      </AppShell>
    );
  }

  const passedCount = unit.materials.filter((m) => progress?.passedLessons.includes(m.id)).length;

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 font-bold mb-1">情報2 › コース一覧</p>
          <h1 className="text-2xl font-black text-slate-800">{unit.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unit.materials.length} レッスン ·{' '}
            <span className="text-emerald-600 font-bold">{passedCount} 合格済み</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">進捗</span>
            <span className="text-sm font-black text-purple-600">
              {Math.round((passedCount / unit.materials.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${(passedCount / unit.materials.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Lesson list */}
        <div className="space-y-2">
          {unit.materials.map((material, idx) => {
            const passed = progress?.passedLessons.includes(material.id);
            const slideRead = progress?.slideRead.includes(material.id);
            return (
              <Link
                key={material.id}
                href={`/joho2/lesson/${material.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 hover:shadow-md hover:border-purple-300 transition-all"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${passed ? 'bg-emerald-100' : 'bg-purple-50'}`}>
                  {passed
                    ? <CheckCircle2 size={18} className="text-emerald-600" />
                    : <span className="font-black text-purple-600 text-sm">{idx + 1}</span>}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-800">{material.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {material.slide_ref && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <BookOpen size={11} /> スライドあり
                      </span>
                    )}
                    {material.questions.length > 0 && (
                      <span className="text-xs text-slate-400">テスト {material.questions.length}問</span>
                    )}
                    {slideRead && !passed && (
                      <span className="text-xs text-blue-500 font-bold">読了済み</span>
                    )}
                  </div>
                </div>
                <PlayCircle size={20} className={passed ? 'text-emerald-400' : 'text-purple-300'} />
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
