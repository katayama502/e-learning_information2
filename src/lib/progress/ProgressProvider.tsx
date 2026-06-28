'use client';

// ============================================================
//  ユーザーごとの学習進捗（Firestore: progress/{uid}）
//  ログイン中ユーザーのUIDで進捗を読み書きする。
// ============================================================

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  type Joho2Progress, defaultProgress, xpToRank,
  SLIDE_XP, PASS_XP, PERFECT_BONUS,
} from '@/lib/joho2Store';

interface RecordResult {
  xp_earned: number;
  perfect_bonus: number;
  new_xp: number;
  leveled_up: boolean;
}

interface ProgressContextValue {
  progress: Joho2Progress | null;
  loading: boolean;
  markSlideRead: (materialId: string) => Promise<void>;
  recordAttempt: (materialId: string, score: number, maxScore: number, passed: boolean) => Promise<RecordResult>;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Joho2Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const progressRef = useRef<Joho2Progress | null>(null);
  // ref はレンダー後の useEffect ではなく書き込み時に即時更新する（→ persist内で管理）

  useEffect(() => {
    if (!user) { setProgress(null); setLoading(false); return; }
    setLoading(true);
    const ref = doc(db, 'progress', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const next = snap.exists()
          ? { ...defaultProgress(), ...(snap.data() as Partial<Joho2Progress>) }
          : defaultProgress();
        progressRef.current = next;
        setProgress(next);
        setLoading(false);
      },
      (err) => {
        // トランジェント読み取りエラー: 既存の進捗を保持し loading のみ解除
        console.error('[ProgressProvider] onSnapshot error:', err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  const persist = useCallback(async (next: Joho2Progress) => {
    if (!user) return;
    const prev = progressRef.current;
    progressRef.current = next; // 並列呼出し用に ref を即時更新
    setProgress(next);
    try {
      await setDoc(doc(db, 'progress', user.uid), next, { merge: true });
    } catch (err) {
      // 書き込み失敗時はロールバック
      console.error('[ProgressProvider] persist failed:', err);
      progressRef.current = prev;
      setProgress(prev);
      throw err; // 呼び出し元でエラー表示できるよう再スロー
    }
  }, [user]);

  const markSlideRead = useCallback(async (materialId: string) => {
    const cur = progressRef.current ?? defaultProgress();
    if (cur.slideRead.includes(materialId)) return;
    const xp = cur.xp + SLIDE_XP;
    await persist({
      ...cur,
      slideRead: [...cur.slideRead, materialId],
      xp,
      rank: xpToRank(xp),
    });
  }, [persist]);

  const recordAttempt = useCallback(
    async (materialId: string, score: number, maxScore: number, passed: boolean): Promise<RecordResult> => {
      const cur = progressRef.current ?? defaultProgress();
      const oldRank = cur.rank;
      const prevBest = cur.attemptScores[materialId] ?? -1;

      let xpEarned = 0;
      let perfectBonus = 0;
      const passedLessons = [...cur.passedLessons];

      if (passed && !cur.passedLessons.includes(materialId)) {
        xpEarned = PASS_XP;
        if (score === maxScore) perfectBonus = PERFECT_BONUS;
        passedLessons.push(materialId);
      }

      const attemptScores = { ...cur.attemptScores };
      if (score > prevBest) attemptScores[materialId] = score;

      const newXp = cur.xp + xpEarned + perfectBonus;
      const newRank = xpToRank(newXp);

      await persist({
        ...cur,
        passedLessons,
        attemptScores,
        xp: newXp,
        rank: newRank,
      });

      return { xp_earned: xpEarned, perfect_bonus: perfectBonus, new_xp: newXp, leveled_up: newRank !== oldRank };
    },
    [persist],
  );

  return (
    <ProgressContext.Provider value={{ progress, loading, markSlideRead, recordAttempt }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within <ProgressProvider>');
  return ctx;
}
