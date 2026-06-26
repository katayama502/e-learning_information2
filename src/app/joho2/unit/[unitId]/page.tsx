'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, PlayCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { RankProgressBar } from '@/components/joho2/RankProgressBar';
import { JOHO2_UNITS } from '@/data/joho2-lessons';
import { loadProgress, type Joho2Progress } from '@/lib/joho2Store';

export default function UnitPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const [progress, setProgress] = useState<Joho2Progress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  const unit = JOHO2_UNITS.find((u) => u.id === unitId);

  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold">ユニットが見つかりません</p>
      </div>
    );
  }

  const xp = progress?.xp ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/joho2" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-xs text-slate-400 font-bold">情報2</p>
            <h1 className="font-black text-slate-800 text-lg">{unit.title}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-6">
        <div className="space-y-3">
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
                    : <span className="font-black text-purple-600 text-sm">{idx + 1}</span>
                  }
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
                      <span className="text-xs text-slate-400">
                        テスト {material.questions.length}問
                      </span>
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
      </main>

      <footer className="sticky bottom-0">
        <RankProgressBar xp={xp} />
      </footer>
    </div>
  );
}
