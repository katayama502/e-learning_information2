'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, Loader2, Terminal, Copy, Check, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { usePyodide } from '@/hooks/usePyodide';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface PythonEditorProps {
  starterCode?: string;
  onOutput?: (stdout: string, stderr: string) => void;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function PythonEditor({ starterCode = '', onOutput, onCodeChange, readOnly = false, height = '300px' }: PythonEditorProps) {
  const [code, setCode] = useState(starterCode);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const { ready, loading, run, reset } = usePyodide();

  const handleRun = async () => {
    if (!ready || running) return;
    setRunning(true);
    setStdout('');
    setStderr('');
    setExecTime(null);
    const t0 = performance.now();
    try {
      const result = await run(code);
      setStdout(result.stdout);
      setStderr(result.stderr);
      setExecTime(Math.round(performance.now() - t0));
      onOutput?.(result.stdout, result.stderr);
    } finally {
      setRunning(false);
    }
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(stdout + stderr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasOutput = stdout || stderr;

  return (
    <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
      {/* Editor header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a2e] border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-2 text-slate-400 text-xs font-mono">main.py</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Loader2 size={11} className="animate-spin" />
              Python読込中...
            </span>
          )}
          {!loading && ready && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Python 準備完了
            </span>
          )}
          <span className="text-slate-600 text-xs font-mono">Python 3</span>
        </div>
      </div>

      {/* Monaco Editor – fixed height */}
      <div className="bg-[#1e1e1e] shrink-0" style={{ height }}>
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => { setCode(v ?? ''); onCodeChange?.(v ?? ''); }}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
          }}
        />
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#252526] border-t border-slate-700 shrink-0">
        <button
          onClick={handleRun}
          disabled={!ready || running}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-all shadow-sm"
        >
          {running
            ? <Loader2 size={15} className="animate-spin" />
            : <Play size={15} fill="white" />}
          {running ? '実行中...' : '▶ 実行'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg text-sm border border-slate-600 hover:border-slate-400 transition-colors"
        >
          <RotateCcw size={13} />
          リセット
        </button>
        <div className="flex-1" />
        {execTime !== null && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock size={11} />
            {execTime}ms
          </span>
        )}
      </div>

      {/* Output Console */}
      {hasOutput && (
        <div className="bg-[#0d1117] border-t border-slate-700 shrink-0">
          {/* Console header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400">OUTPUT</span>
              {stderr
                ? <span className="flex items-center gap-1 text-xs text-red-400"><XCircle size={11} />エラー</span>
                : <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={11} />成功</span>}
            </div>
            <button
              onClick={handleCopyOutput}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </div>
          {/* Console body */}
          <pre className="text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto px-4 py-3 leading-6">
            {stdout && <span className="text-emerald-300">{stdout}</span>}
            {stderr && <span className="text-red-400">{stderr}</span>}
          </pre>
          {/* Status line */}
          <div className="flex items-center gap-3 px-3 py-1 border-t border-slate-800 bg-[#0a0f14]">
            {execTime !== null && (
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <Clock size={10} />
                実行時間: {execTime}ms
              </span>
            )}
            {stdout && (
              <span className="text-xs text-slate-600">
                {stdout.split('\n').filter(Boolean).length} 行の出力
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
