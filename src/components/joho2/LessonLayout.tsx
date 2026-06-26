'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PanelLeft, PanelRight, Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { loadProgress, type Joho2Progress } from '@/lib/joho2Store';

interface LessonLayoutProps {
  title: string;
  slidePane: React.ReactNode;
  editorPane: React.ReactNode;
  footer: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

type PanelMode = 'split' | 'slide' | 'editor';

export function LessonLayout({
  title,
  slidePane,
  editorPane,
  footer,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: LessonLayoutProps) {
  const [mode, setMode] = useState<PanelMode>('split');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [progress, setProgress] = useState<Joho2Progress | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar drawer overlay (mobile/lesson mode) */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 shadow-2xl">
            <Sidebar
              progress={progress}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((c) => !c)}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main lesson area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-200 shrink-0">
          {/* Menu toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
          >
            <Menu size={18} />
          </button>

          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <h1 className="font-black text-slate-800 text-sm flex-1 truncate">{title}</h1>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          {/* Panel toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden ml-1">
            <button
              onClick={() => setMode('slide')}
              className={`px-2 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 ${mode === 'slide' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              <PanelLeft size={13} />
              スライド
            </button>
            <button
              onClick={() => setMode('split')}
              className={`px-2 py-1.5 text-xs font-bold transition-colors ${mode === 'split' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              分割
            </button>
            <button
              onClick={() => setMode('editor')}
              className={`px-2 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 ${mode === 'editor' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              <PanelRight size={13} />
              Python
            </button>
          </div>
        </header>

        {/* Main area */}
        <main className="flex-1 overflow-hidden">
          {mode === 'split' && (
            <div className="grid grid-cols-2 h-full gap-0">
              <div className="p-3 overflow-auto border-r border-slate-200">{slidePane}</div>
              <div className="p-3 overflow-auto">{editorPane}</div>
            </div>
          )}
          {mode === 'slide' && (
            <div className="h-full p-3 overflow-auto">{slidePane}</div>
          )}
          {mode === 'editor' && (
            <div className="h-full p-3 overflow-auto">{editorPane}</div>
          )}
        </main>

        <footer className="shrink-0">{footer}</footer>
      </div>
    </div>
  );
}
