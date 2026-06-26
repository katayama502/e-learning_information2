'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonLayout } from '@/components/joho2/LessonLayout';
import { SlideViewer } from '@/components/joho2/SlideViewer';
import { PythonEditor } from '@/components/joho2/PythonEditor';
import { RankProgressBar } from '@/components/joho2/RankProgressBar';
import { TestComponent } from '@/components/joho2/TestComponent';
import type { Material, Unit } from '@/types/joho2';
import { Skeleton } from '@/components/ui/skeleton';

interface MaterialDetail extends Material {
  slide_read: boolean;
}

export default function LessonPage() {
  const params = useParams<{ materialId: string }>();
  const router = useRouter();
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [xp, setXp] = useState(0);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [matRes, meRes, unitsRes] = await Promise.all([
      fetch(`/api/joho2/materials/${params.materialId}`),
      fetch('/api/joho2/me'),
      fetch('/api/joho2/units'),
    ]);
    const mat = await matRes.json();
    const me = await meRes.json();
    const units: Unit[] = await unitsRes.json();

    setMaterial(matRes.ok ? mat : null);
    setXp(me?.profile?.xp ?? 0);
    const flat = (Array.isArray(units) ? units : []).flatMap((u) => u.materials ?? []);
    setAllMaterials(flat);
    setLoading(false);
  }, [params.materialId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currentIdx = allMaterials.findIndex((m) => m.id === params.materialId);
  const prevMaterial = currentIdx > 0 ? allMaterials[currentIdx - 1] : null;
  const nextMaterial = currentIdx >= 0 && currentIdx < allMaterials.length - 1 ? allMaterials[currentIdx + 1] : null;

  const handleXpUpdate = () => {
    fetch('/api/joho2/me').then((r) => r.json()).then((me) => setXp(me?.profile?.xp ?? 0));
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 p-6 gap-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex-1 grid grid-cols-2 gap-4">
          <Skeleton className="rounded-xl" />
          <Skeleton className="rounded-xl" />
        </div>
        <Skeleton className="h-12 rounded-xl" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold">レッスンが見つかりません</p>
      </div>
    );
  }

  const slidePane = (
    <div className="h-full flex flex-col">
      <SlideViewer
        slideRef={material.slide_ref}
        materialId={material.id}
        alreadyRead={material.slide_read}
        onReadComplete={handleXpUpdate}
      />
    </div>
  );

  const editorPane = (
    <div className="flex flex-col h-full gap-4">
      <PythonEditor starterCode={material.starter_code ?? ''} height="calc(100% - 2rem)" />
      {material.questions && material.questions.length > 0 && (
        <TestComponent
          questions={material.questions}
          materialId={material.id}
          starterCode={material.starter_code ?? ''}
          onPassed={handleXpUpdate}
        />
      )}
    </div>
  );

  return (
    <LessonLayout
      title={material.title}
      slidePane={slidePane}
      editorPane={editorPane}
      footer={<RankProgressBar xp={xp} />}
      hasPrev={!!prevMaterial}
      hasNext={!!nextMaterial}
      onPrev={() => prevMaterial && router.push(`/joho2/lesson/${prevMaterial.id}`)}
      onNext={() => nextMaterial && router.push(`/joho2/lesson/${nextMaterial.id}`)}
    />
  );
}
