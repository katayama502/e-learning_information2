'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, PlayCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { RankProgressBar } from '@/components/joho2/RankProgressBar';
import type { Unit } from '@/types/joho2';
import { Skeleton } from '@/components/ui/skeleton';

export default function UnitPage() {
  const params = useParams<{ unitId: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/joho2/units').then((r) => r.json()),
      fetch('/api/joho2/me').then((r) => r.json()),
    ]).then(([units, me]) => {
      const found = (Array.isArray(units) ? units : []).find((u: Unit) => u.id === params.unitId);
      setUnit(found ?? null);
      setXp(me?.profile?.xp ?? 0);
      setLoading(false);
    });
  }, [params.unitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold">ユニットが見つかりません</p>
      </div>
    );
  }

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
          {(unit.materials ?? []).length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">このユニットにはまだレッスンがありません</p>
            </div>
          ) : (
            (unit.materials ?? []).map((material, idx) => (
              <Link
                key={material.id}
                href={`/joho2/lesson/${material.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="font-black text-blue-600 text-sm">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-800">{material.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {material.slide_ref && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <BookOpen size={12} /> スライドあり
                      </span>
                    )}
                  </div>
                </div>
                <PlayCircle size={20} className="text-blue-400 shrink-0" />
              </Link>
            ))
          )}
        </div>
      </main>

      <footer className="sticky bottom-0">
        <RankProgressBar xp={xp} />
      </footer>
    </div>
  );
}
