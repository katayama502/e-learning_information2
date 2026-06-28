'use client';

// ============================================================
//  カリキュラム（Firestore）をリアルタイム購読して配布するProvider
// ============================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeCurriculum, findMaterialInUnits } from './firestore';
import type { Unit } from './types';

interface CurriculumContextValue {
  units: Unit[];
  loading: boolean;
  findMaterial: (materialId: string) => ReturnType<typeof findMaterialInUnits>;
}

const CurriculumContext = createContext<CurriculumContextValue | undefined>(undefined);

export function CurriculumProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeCurriculum((u) => {
      setUnits(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const findMaterial = (materialId: string) => findMaterialInUnits(units, materialId);

  return (
    <CurriculumContext.Provider value={{ units, loading, findMaterial }}>
      {children}
    </CurriculumContext.Provider>
  );
}

export function useCurriculum(): CurriculumContextValue {
  const ctx = useContext(CurriculumContext);
  if (!ctx) throw new Error('useCurriculum must be used within <CurriculumProvider>');
  return ctx;
}
