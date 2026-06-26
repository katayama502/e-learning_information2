'use client';

import React, { useState } from 'react';
import { CheckCircle2, BookOpen, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SlideViewerProps {
  slideRef: string | null;
  materialId: string;
  onReadComplete?: () => void;
  alreadyRead?: boolean;
}

function toEmbedUrl(ref: string): { url: string; type: 'google' | 'pdf' | 'other' } {
  if (ref.includes('docs.google.com/presentation')) {
    const base = ref.split('/edit')[0].split('/pub')[0].split('/embed')[0];
    return { url: `${base}/embed?start=false&loop=false&delayms=3000`, type: 'google' };
  }
  if (ref.toLowerCase().includes('.pdf')) {
    return { url: `${ref}#toolbar=0&view=FitH`, type: 'pdf' };
  }
  return { url: ref, type: 'other' };
}

export function SlideViewer({ slideRef, materialId, onReadComplete, alreadyRead = false }: SlideViewerProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [marked, setMarked] = useState(alreadyRead);

  // alreadyReadが親から更新されたら同期
  React.useEffect(() => { setMarked(alreadyRead); }, [alreadyRead]);

  if (!slideRef) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <BookOpen size={48} />
        <p className="font-bold text-center">スライドが設定されていません</p>
        <p className="text-xs text-slate-300 text-center">
          src/data/joho2-lessons.ts の slide_ref にURLを設定してください
        </p>
      </div>
    );
  }

  const { url, type } = toEmbedUrl(slideRef);

  const handleMarkRead = () => {
    if (marked) return;
    setMarked(true);
    onReadComplete?.(); // localStorageへの記録は親(page)が行う
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex-1 relative min-h-0">
        {!iframeLoaded && <Skeleton className="absolute inset-0 rounded-xl" />}
        <iframe
          src={url}
          className="w-full h-full rounded-xl border border-slate-200"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
          title="スライド"
        />
      </div>
      <div className="flex items-center justify-between gap-2 shrink-0">
        {type === 'google' && (
          <a
            href={slideRef}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ExternalLink size={12} />
            別タブで開く
          </a>
        )}
        <button
          onClick={handleMarkRead}
          disabled={marked}
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            marked
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <CheckCircle2 size={16} />
          {marked ? '読了済み (+10 XP)' : 'スライドを読んだ'}
        </button>
      </div>
    </div>
  );
}
