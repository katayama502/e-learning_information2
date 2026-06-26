'use client';

// ============================================================
//  情報2 進捗・XP をローカルストレージで管理するストア
//  Supabase・ログイン不要。ブラウザのlocalStorageに保存。
// ============================================================

const STORAGE_KEY = 'joho2_progress';

export interface Joho2Progress {
  xp: number;
  rank: string;
  slideRead: string[];      // 読了済み materialId 一覧
  passedLessons: string[];  // 合格済み materialId 一覧
  attemptScores: Record<string, number>; // materialId → 最高得点
}

const RANKS = [
  { name: 'ビギナー', min_xp: 0 },
  { name: 'ルーキー', min_xp: 100 },
  { name: 'ブロンズ', min_xp: 300 },
  { name: 'シルバー', min_xp: 700 },
  { name: 'ゴールド', min_xp: 1500 },
  { name: 'プラチナ', min_xp: 3000 },
  { name: 'マスター', min_xp: 6000 },
];

export { RANKS };

export function xpToRank(xp: number): string {
  return [...RANKS].reverse().find((r) => xp >= r.min_xp)?.name ?? 'ビギナー';
}

export function nextRankInfo(xp: number): { name: string; min_xp: number } | null {
  const idx = RANKS.findIndex((r) => r.name === xpToRank(xp));
  return RANKS[idx + 1] ?? null;
}

function defaultProgress(): Joho2Progress {
  return { xp: 0, rank: 'ビギナー', slideRead: [], passedLessons: [], attemptScores: {} };
}

export function loadProgress(): Joho2Progress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

function saveProgress(p: Joho2Progress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// スライド読了 → +10 XP（1レッスン1回限り）
export function markSlideRead(materialId: string): { xp_earned: number; new_xp: number; leveled_up: boolean } {
  const p = loadProgress();
  if (p.slideRead.includes(materialId)) return { xp_earned: 0, new_xp: p.xp, leveled_up: false };

  const oldRank = p.rank;
  p.slideRead.push(materialId);
  p.xp += 10;
  p.rank = xpToRank(p.xp);
  saveProgress(p);
  return { xp_earned: 10, new_xp: p.xp, leveled_up: p.rank !== oldRank };
}

// テスト採点結果を保存 → XP付与
export function recordAttempt(
  materialId: string,
  score: number,
  maxScore: number,
  passed: boolean,
): { xp_earned: number; new_xp: number; leveled_up: boolean; perfect_bonus: number } {
  const p = loadProgress();
  const prevBest = p.attemptScores[materialId] ?? -1;
  const oldRank = p.rank;

  let xpEarned = 0;
  let perfectBonus = 0;

  // 初めての合格のみXP付与（再挑戦は付与しない）
  if (passed && !p.passedLessons.includes(materialId)) {
    xpEarned = 50;
    if (score === maxScore) perfectBonus = 20;
    p.passedLessons.push(materialId);
  }

  // 最高得点を更新
  if (score > prevBest) p.attemptScores[materialId] = score;

  p.xp += xpEarned + perfectBonus;
  p.rank = xpToRank(p.xp);
  saveProgress(p);

  return { xp_earned: xpEarned, new_xp: p.xp, leveled_up: p.rank !== oldRank, perfect_bonus: perfectBonus };
}

// 進捗リセット（デバッグ用）
export function resetProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
