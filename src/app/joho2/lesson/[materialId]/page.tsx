'use client';

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LessonLayout } from '@/components/joho2/LessonLayout';
import { SlideViewer } from '@/components/joho2/SlideViewer';
import { PythonEditor } from '@/components/joho2/PythonEditor';
import { RankProgressBar } from '@/components/joho2/RankProgressBar';
import { TestComponent } from '@/components/joho2/TestComponent';
import { useCurriculum } from '@/lib/curriculum/CurriculumProvider';
import { useProgress } from '@/lib/progress/ProgressProvider';

export default function LessonPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const router = useRouter();
  const { findMaterial, loading } = useCurriculum();
  const { progress, markSlideRead } = useProgress();

  const found = findMaterial(materialId);

  const handleSlideRead = useCallback(() => {
    markSlideRead(materialId);
  }, [materialId, markSlideRead]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 gap-2">
        <Loader2 size={20} className="animate-spin" />
        <span className="font-bold">読み込み中...</span>
      </div>
    );
  }

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
    <div className="flex flex-col gap-4">
      <PythonEditor starterCode={material.starter_code} height="320px" />
      {material.questions.length > 0 && (
        <TestComponent
          questions={material.questions}
          materialId={materialId}
          starterCode={material.starter_code}
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
