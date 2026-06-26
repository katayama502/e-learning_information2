'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { RankProgressBar } from './RankProgressBar';
import { loadProgress, type Joho2Progress } from '@/lib/joho2Store';

interface AppShellProps {
  children: React.ReactNode;
  refreshKey?: number;
}

export function AppShell({ children, refreshKey }: AppShellProps) {
  const [progress, setProgress] = useState<Joho2Progress | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, [refreshKey]);

  const xp = progress?.xp ?? 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Left sidebar */}
      <Sidebar
        progress={progress}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <footer className="shrink-0">
          <RankProgressBar xp={xp} />
        </footer>
      </div>
    </div>
  );
}
