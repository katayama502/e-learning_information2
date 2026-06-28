'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { PythonEditor } from './PythonEditor';
import { usePyodide } from '@/hooks/usePyodide';
import { useProgress } from '@/lib/progress/ProgressProvider';
import { PASS_THRESHOLD } from '@/lib/joho2Store';
import type { Question } from '@/data/joho2-lessons';

interface AttemptResult {
  score: number;
  max_score: number;
  passed: boolean;
  xp_earned: number;
  perfect_bonus: number;
}

// ---- 選択肢問題 ----
function ChoiceQuestion({
  question, selected, onSelect, disabled,
}: {
  question: Question; selected: number | null; onSelect: (i: number) => void; disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      {(question.choices ?? []).map((choice, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          disabled={disabled}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
            disabled
              ? idx === question.correct
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : selected === idx && idx !== question.correct
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-slate-200 bg-white text-slate-400'
              : selected === idx
              ? 'border-purple-500 bg-purple-50 text-purple-800'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          {String.fromCharCode(65 + idx)}. {choice}
        </button>
      ))}
    </div>
  );
}

// ---- コード問題（Pyodideで実行してテストケースと比較）----
function CodeQuestion({
  question, starterCode, onResult, disabled,
}: {
  question: Question; starterCode: string; onResult: (passed: boolean, output: string) => void; disabled: boolean;
}) {
  const { ready, run } = usePyodide();
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [code, setCode] = useState(starterCode);

  const handleRun = async () => {
    if (!ready || running) return;
    setRunning(true);
    try {
      const result = await run(code);
      const stdout = result.stdout.trim();
      setOutput(stdout || result.stderr);
      const tests = question.code_tests ?? [];
      const passed = tests.length === 0 || tests.every((t) => t.expected_output.trim() === stdout);
      onResult(passed, stdout);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-2">
      <PythonEditor
        starterCode={starterCode}
        onOutput={(stdout) => setOutput(stdout)}
        readOnly={disabled}
        height="180px"
        onCodeChange={setCode}
      />
      {!disabled && (
        <button
          onClick={handleRun}
          disabled={!ready || running}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : '▶'}
          {running ? '実行中...' : 'テスト実行'}
        </button>
      )}
      {output && (
        <pre className="text-xs bg-slate-900 text-emerald-300 p-3 rounded-lg font-mono">{output}</pre>
      )}
    </div>
  );
}

// ---- メイン ----
interface TestComponentProps {
  questions: Question[];
  materialId: string;
  starterCode?: string;
}

export function TestComponent({ questions, materialId, starterCode = '' }: TestComponentProps) {
  const { recordAttempt } = useProgress();
  const [open, setOpen] = useState(false);
  const [choiceAnswers, setChoiceAnswers] = useState<Record<string, number | null>>({});
  const [codeResults, setCodeResults] = useState<Record<string, { passed: boolean; output: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);

  if (questions.length === 0) return null;

  const handleSubmit = async () => {
    if (grading) return;
    let score = 0;
    let maxScore = 0;

    for (const q of questions) {
      maxScore += q.points;
      if (q.type === 'choice') {
        if (choiceAnswers[q.id] === q.correct) score += q.points;
      } else if (q.type === 'code') {
        if (codeResults[q.id]?.passed) score += q.points;
      }
    }

    const passed = maxScore > 0 ? score / maxScore >= PASS_THRESHOLD : true;
    setGrading(true);
    try {
      const { xp_earned, perfect_bonus } = await recordAttempt(materialId, score, maxScore, passed);
      setResult({ score, max_score: maxScore, passed, xp_earned, perfect_bonus });
      setSubmitted(true);
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 font-black text-slate-800 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Award size={18} className="text-purple-600" />
          確認テスト（{questions.length}問）
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-5 space-y-6">
          {questions.map((q, qi) => (
            <div key={q.id}>
              <p className="font-bold text-slate-800 mb-3 text-sm">
                Q{qi + 1}. {q.prompt}
                <span className="ml-2 text-xs text-slate-400">（{q.points}点）</span>
              </p>
              {q.type === 'choice' ? (
                <ChoiceQuestion
                  question={q}
                  selected={choiceAnswers[q.id] ?? null}
                  onSelect={(idx) => setChoiceAnswers((p) => ({ ...p, [q.id]: idx }))}
                  disabled={submitted}
                />
              ) : (
                <CodeQuestion
                  question={q}
                  starterCode={starterCode}
                  onResult={(passed, output) =>
                    setCodeResults((p) => ({ ...p, [q.id]: { passed, output } }))
                  }
                  disabled={submitted}
                />
              )}
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={grading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all"
            >
              {grading ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
              {grading ? '採点中...' : '採点する'}
            </button>
          ) : result ? (
            <div className={`rounded-xl p-4 ${result.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                {result.passed
                  ? <CheckCircle2 size={20} className="text-emerald-600" />
                  : <XCircle size={20} className="text-red-500" />}
                <span className={`font-black text-lg ${result.passed ? 'text-emerald-700' : 'text-red-600'}`}>
                  {result.passed ? '合格！' : '不合格'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-700">
                {result.score} / {result.max_score} 点
                {result.xp_earned > 0 && <span className="ml-2 text-yellow-600">+{result.xp_earned} XP</span>}
                {result.perfect_bonus > 0 && <span className="ml-2 text-purple-600">満点ボーナス +{result.perfect_bonus} XP</span>}
              </p>
              {!result.passed && (
                <button
                  onClick={() => { setSubmitted(false); setResult(null); setChoiceAnswers({}); setCodeResults({}); }}
                  className="mt-3 text-xs text-slate-500 underline"
                >
                  もう一度挑戦する
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
