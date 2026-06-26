'use client';

import React from 'react';
import { Star, Zap } from 'lucide-react';

const RANKS = [
  { name: 'ビギナー', min_xp: 0 },
  { name: 'ルーキー', min_xp: 100 },
  { name: 'ブロンズ', min_xp: 300 },
  { name: 'シルバー', min_xp: 700 },
  { name: 'ゴールド', min_xp: 1500 },
  { name: 'プラチナ', min_xp: 3000 },
  { name: 'マスター', min_xp: 6000 },
];

const RANK_COLORS: Record<string, string> = {
  ビギナー: 'text-slate-500',
  ルーキー: 'text-emerald-600',
  ブロンズ: 'text-amber-700',
  シルバー: 'text-slate-400',
  ゴールド: 'text-yellow-500',
  プラチナ: 'text-cyan-500',
  マスター: 'text-purple-600',
};

const RANK_BAR_COLORS: Record<string, string> = {
  ビギナー: 'bg-slate-400',
  ルーキー: 'bg-emerald-500',
  ブロンズ: 'bg-amber-600',
  シルバー: 'bg-slate-400',
  ゴールド: 'bg-yellow-400',
  プラチナ: 'bg-cyan-400',
  マスター: 'bg-purple-500',
};

interface RankProgressBarProps {
  xp: number;
}

export function RankProgressBar({ xp }: RankProgressBarProps) {
  const currentRankIdx = RANKS.reduce((idx, r, i) => (xp >= r.min_xp ? i : idx), 0);
  const currentRank = RANKS[currentRankIdx];
  const nextRank = RANKS[currentRankIdx + 1] ?? null;

  const progress = nextRank
    ? ((xp - currentRank.min_xp) / (nextRank.min_xp - currentRank.min_xp)) * 100
    : 100;

  const xpToNext = nextRank ? nextRank.min_xp - xp : 0;

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-white border-t border-slate-100">
      <div className="flex items-center gap-2 shrink-0">
        <Star size={16} className={RANK_COLORS[currentRank.name] ?? 'text-slate-500'} />
        <span className={`font-black text-sm ${RANK_COLORS[currentRank.name] ?? 'text-slate-500'}`}>
          {currentRank.name}
        </span>
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${RANK_BAR_COLORS[currentRank.name] ?? 'bg-blue-600'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 font-bold shrink-0">
          {nextRank ? `あと ${xpToNext} XP` : 'MAX'}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Zap size={14} className="text-yellow-500" />
        <span className="font-black text-sm text-slate-700">{xp} XP</span>
      </div>
    </div>
  );
}
