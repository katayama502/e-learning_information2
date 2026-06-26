'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, Loader2, Terminal } from 'lucide-react';
import { usePyodide } from '@/hooks/usePyodide';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface PythonEditorProps {
  starterCode?: string;
  onOutput?: (stdout: string, stderr: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function PythonEditor({ starterCode = '', onOutput, readOnly = false, height = '300px' }: PythonEditorProps) {
  const [code, setCode] = useState(starterCode);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [running, setRunning] = useState(false);
  const { ready, loading, run, reset } = usePyodide();
  const outputRef = useRef<HTMLPreElement>(null);

  const handleRun = async () => {
    if (!ready || running) return;
    setRunning(true);
    setStdout('');
    setStderr('');
    try {
      const result = await run(code);
      setStdout(result.stdout);
      setStderr(result.stderr);
      onOutput?.(result.stdout, result.stderr);
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Editor */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-700 bg-[#1e1e1e]" style={{ minHeight: height }}>
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRun}
          disabled={!ready || running}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all"
        >
          {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {loading ? 'Python読込中...' : running ? '実行中...' : '▶ 実行'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg text-sm border border-slate-200 transition-colors"
        >
          <RotateCcw size={14} />
          リセット
        </button>
        {loading && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            Pyodide初期化中...
          </span>
        )}
      </div>

      {/* Output Console */}
      {(stdout || stderr) && (
        <div className="rounded-xl bg-[#0d1117] border border-slate-700 p-3">
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
            <Terminal size={12} />
            出力
          </div>
          <pre ref={outputRef} className="text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {stdout && <span className="text-emerald-300">{stdout}</span>}
            {stderr && <span className="text-red-400">{stderr}</span>}
          </pre>
        </div>
      )}
    </div>
  );
}
