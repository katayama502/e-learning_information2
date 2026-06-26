'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, ChevronDown, ChevronRight, CheckCircle2, PlayCircle,
  Code2, Zap, Star, ArrowRight, BookOpen, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { JOHO2_UNITS } from '@/data/joho2-lessons';
import { type Joho2Progress } from '@/lib/joho2Store';

interface SidebarProps {
  progress: Joho2Progress | null;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void; // ドロワーモード時に閉じるコールバック
}

function getNextLesson(progress: Joho2Progress | null) {
  const allMaterials = JOHO2_UNITS.flatMap((u) => u.materials);
  const passed = new Set(progress?.passedLessons ?? []);
  return allMaterials.find((m) => !passed.has(m.id)) ?? allMaterials[0];
}

export function Sidebar({ progress, collapsed, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [openUnits, setOpenUnits] = useState<Set<string>>(
    () => new Set(JOHO2_UNITS.map((u) => u.id))
  );

  const nextLesson = getNextLesson(progress);
  const xp = progress?.xp ?? 0;
  const rank = progress?.rank ?? 'ビギナー';

  const toggleUnit = (id: string) => {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      className={`flex flex-col h-full bg-[#0f1117] text-white transition-all duration-300 ${
        collapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/10 shrink-0">
        {!collapsed && (
          <Link
            href="/joho2"
            onClick={onNavigate}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Code2 size={20} className="text-purple-400 shrink-0" />
            <span className="text-sm font-black tracking-tight">情報2 学習</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/joho2" onClick={onNavigate} className="mx-auto hover:opacity-80">
            <Code2 size={20} className="text-purple-400" />
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white ${collapsed ? 'hidden' : ''}`}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {collapsed ? (
        /* Icon rail */
        <div className="flex flex-col items-center gap-3 pt-4 flex-1">
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <PanelLeftOpen size={16} />
          </button>
          <Link href="/joho2" onClick={onNavigate} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <Home size={16} />
          </Link>
          {nextLesson && (
            <Link
              href={`/joho2/lesson/${nextLesson.id}`}
              onClick={onNavigate}
              className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
              title="次のレッスン"
            >
              <PlayCircle size={16} />
            </Link>
          )}
        </div>
      ) : (
        /* Full sidebar */
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Rank badge */}
          <div className="mx-3 mt-3 mb-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star size={12} className="text-yellow-400" />
                <span className="text-xs font-bold text-slate-300">{rank}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={11} className="text-yellow-400" />
                <span className="text-xs font-black text-yellow-300">{xp} XP</span>
              </div>
            </div>
          </div>

          {/* Home link */}
          <Link
            href="/joho2"
            onClick={onNavigate}
            className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
              pathname === '/joho2'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:bg-white/8 hover:text-white'
            }`}
          >
            <Home size={15} />
            ホーム
          </Link>

          {/* Next lesson CTA */}
          {nextLesson && (
            <div className="mx-3 mt-3 mb-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                次のレッスン
              </p>
              <Link
                href={`/joho2/lesson/${nextLesson.id}`}
                onClick={onNavigate}
                className="flex items-center gap-2 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition-colors px-3 py-2.5"
              >
                <PlayCircle size={16} className="text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-purple-200 leading-tight line-clamp-2">
                  {nextLesson.title}
                </span>
                <ArrowRight size={13} className="text-purple-400 shrink-0 ml-auto" />
              </Link>
            </div>
          )}

          {/* Units + lessons */}
          <div className="mt-3 mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 px-4">
              コース一覧
            </p>
            {JOHO2_UNITS.map((unit) => {
              const unitOpen = openUnits.has(unit.id);
              const passedInUnit = unit.materials.filter(
                (m) => progress?.passedLessons.includes(m.id)
              ).length;
              return (
                <div key={unit.id}>
                  <button
                    onClick={() => toggleUnit(unit.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                  >
                    <BookOpen size={13} className="text-slate-500 shrink-0" />
                    <span className="flex-1 text-left font-bold text-slate-300 text-xs truncate">
                      {unit.title}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {passedInUnit}/{unit.materials.length}
                    </span>
                    {unitOpen
                      ? <ChevronDown size={12} className="text-slate-500 shrink-0" />
                      : <ChevronRight size={12} className="text-slate-500 shrink-0" />}
                  </button>

                  {unitOpen && (
                    <div className="ml-6 border-l border-white/8 pl-2 mb-1">
                      {unit.materials.map((material) => {
                        const passed = progress?.passedLessons.includes(material.id);
                        const active = pathname === `/joho2/lesson/${material.id}`;
                        const isNext = nextLesson?.id === material.id;
                        return (
                          <Link
                            key={material.id}
                            href={`/joho2/lesson/${material.id}`}
                            onClick={onNavigate}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              active
                                ? 'bg-purple-600 text-white'
                                : passed
                                ? 'text-emerald-400 hover:bg-white/5'
                                : isNext
                                ? 'text-purple-300 hover:bg-purple-600/20'
                                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                            }`}
                          >
                            {passed
                              ? <CheckCircle2 size={12} className="shrink-0" />
                              : isNext
                              ? <PlayCircle size={12} className="shrink-0 text-purple-400" />
                              : <span className="w-3 h-3 rounded-full border border-slate-600 shrink-0" />}
                            <span className="truncate">{material.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
