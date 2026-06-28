// ============================================================
//  情報2 進捗・XP・ランクの「純粋ロジック」
//  ※ 永続化は Firebase Firestore（progress/{uid}）で行う。
//     → src/lib/progress/ProgressProvider.tsx
// ============================================================

export interface Joho2Progress {
  xp: number;
  rank: string;
  slideRead: string[];      // 読了済み materialId 一覧
  passedLessons: string[];  // 合格済み materialId 一覧
  attemptScores: Record<string, number>; // materialId → 最高得点
}

// XP付与ルール
export const SLIDE_XP = 10;        // スライド読了
export const PASS_XP = 50;         // 初回合格
export const PERFECT_BONUS = 20;   // 満点ボーナス
export const PASS_THRESHOLD = 0.6; // 合格ライン（60%）

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

export function defaultProgress(): Joho2Progress {
  return { xp: 0, rank: 'ビギナー', slideRead: [], passedLessons: [], attemptScores: {} };
}
