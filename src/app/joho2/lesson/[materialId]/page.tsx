'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonLayout } from '@/components/joho2/LessonLayout';
import { SlideViewer } from '@/components/joho2/SlideViewer';
import { PythonEditor } from '@/components/joho2/PythonEditor';
import { RankProgressBar } from '@/components/joho2/RankProgressBar';
import { TestComponent } from '@/components/joho2/TestComponent';
import { findMaterial } from '@/data/joho2-lessons';
import { loadProgress, markSlideRead, type Joho2Progress } from '@/lib/joho2Store';

export default function LessonPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const router = useRouter();
  const [progress, setProgress] = useState<Joho2Progress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  const found = findMaterial(materialId);

  const refreshProgress = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  const handleSlideRead = useCallback(() => {
    markSlideRead(materialId);
    refreshProgress();
  }, [materialId, refreshProgress]);

  if (!found) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold">レッスンが見つかりません</p>
      </div>
    );
  }

  const { material, index, allMaterials } = found;
  const xp = progress?.xp ?? 0;
  const alreadyRead = progress?.slideRead.includes(materialId) ?? false;
  const prevMaterial = index > 0 ? allMaterials[index - 1] : null;
  const nextMaterial = index < allMaterials.length - 1 ? allMaterials[index + 1] : null;

  const slidePane = (
    <SlideViewer
      slideRef={material.slide_ref}
      materialId={materialId}
      alreadyRead={alreadyRead}
      onReadComplete={handleSlideRead}
    />
  );

  const editorPane = (
    <div className="flex flex-col h-full gap-4">
      <PythonEditor starterCode={material.starter_code} height="calc(100% - 2rem)" />
      {material.questions.length > 0 && (
        <TestComponent
          questions={material.questions}
          materialId={materialId}
          starterCode={material.starter_code}
          onPassed={refreshProgress}
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
