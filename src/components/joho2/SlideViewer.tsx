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

function toEmbedUrl(ref: string): { url: string; type: 'google' | 'pdf' | 'unknown' } {
  if (ref.includes('docs.google.com/presentation')) {
    const base = ref.split('/edit')[0].split('/pub')[0].split('/embed')[0];
    return { url: `${base}/embed?start=false&loop=false&delayms=3000`, type: 'google' };
  }
  if (ref.endsWith('.pdf') || ref.includes('.pdf?')) {
    return { url: `${ref}#toolbar=0&view=FitH`, type: 'pdf' };
  }
  return { url: ref, type: 'unknown' };
}

export function SlideViewer({ slideRef, materialId, onReadComplete, alreadyRead = false }: SlideViewerProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(alreadyRead);

  if (!slideRef) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 bg-slate-50 rounded-xl">
        <BookOpen size={48} />
        <p className="font-bold">スライドが設定されていません</p>
      </div>
    );
  }

  const { url, type } = toEmbedUrl(slideRef);

  const handleMarkRead = async () => {
    if (marked || marking) return;
    setMarking(true);
    try {
      await fetch('/api/joho2/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId }),
      });
      setMarked(true);
      onReadComplete?.();
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        {!iframeLoaded && (
          <Skeleton className="absolute inset-0 rounded-xl" />
        )}
        <iframe
          src={url}
          className="w-full h-full rounded-xl border border-slate-200"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
          title="スライド"
          sandbox={type === 'google' ? 'allow-scripts allow-same-origin allow-popups' : undefined}
        />
      </div>
      <div className="flex items-center justify-between mt-3 gap-2">
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
          disabled={marked || marking}
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            marked
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
          }`}
        >
          <CheckCircle2 size={16} />
          {marked ? '読了済み (+10 XP)' : marking ? '記録中...' : 'スライドを読んだ'}
        </button>
      </div>
    </div>
  );
}
