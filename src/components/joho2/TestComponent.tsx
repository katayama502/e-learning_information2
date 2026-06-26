'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { PythonEditor } from './PythonEditor';
import type { Question, AttemptResult } from '@/types/joho2';

interface ChoiceQuestionProps {
  question: Question;
  selected: number | null;
  onSelect: (idx: number) => void;
  disabled: boolean;
  isCorrect?: boolean | null;
}

function ChoiceQuestion({ question, selected, onSelect, disabled, isCorrect }: ChoiceQuestionProps) {
  return (
    <div className="space-y-2">
      {(question.choices ?? []).map((choice, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          disabled={disabled}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
            disabled && isCorrect !== null
              ? idx === question.correct
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : selected === idx && !isCorrect
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-slate-200 bg-white text-slate-500'
              : selected === idx
              ? 'border-blue-500 bg-blue-50 text-blue-800'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          {String.fromCharCode(65 + idx)}. {choice}
        </button>
      ))}
    </div>
  );
}

interface TestComponentProps {
  questions: Question[];
  materialId: string;
  starterCode?: string;
  onPassed?: (result: AttemptResult) => void;
}

export function TestComponent({ questions, materialId, starterCode, onPassed }: TestComponentProps) {
  const [open, setOpen] = useState(false);
  const [choiceAnswers, setChoiceAnswers] = useState<Record<string, number | null>>({});
  const [codeOutputs, setCodeOutputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return null;

  const choiceQs = questions.filter((q) => q.type === 'choice');
  const codeQs = questions.filter((q) => q.type === 'code');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = questions.map((q) => ({
        question_id: q.id,
        type: q.type,
        user_answer: q.type === 'choice' ? choiceAnswers[q.id] ?? null : codeOutputs[q.id] ?? '',
      }));

      const res = await fetch('/api/joho2/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, answers }),
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      if (data.passed) onPassed?.(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 font-black text-slate-800 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Award size={18} className="text-blue-600" />
          確認テスト（{questions.length}問）
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="border-t border-slate-100 p-5 space-y-6">
          {choiceQs.map((q, qi) => (
            <div key={q.id}>
              <p className="font-bold text-slate-800 mb-3 text-sm">
                Q{qi + 1}. {q.prompt}
                <span className="ml-2 text-xs text-slate-400">（{q.points}点）</span>
              </p>
              <ChoiceQuestion
                question={q}
                selected={choiceAnswers[q.id] ?? null}
                onSelect={(idx) => setChoiceAnswers((p) => ({ ...p, [q.id]: idx }))}
                disabled={submitted}
                isCorrect={submitted ? choiceAnswers[q.id] === q.correct : null}
              />
            </div>
          ))}

          {codeQs.map((q, qi) => (
            <div key={q.id}>
              <p className="font-bold text-slate-800 mb-3 text-sm">
                コード課題{qi + 1}. {q.prompt}
                <span className="ml-2 text-xs text-slate-400">（{q.points}点）</span>
              </p>
              <PythonEditor
                starterCode={starterCode ?? ''}
                onOutput={(stdout) => setCodeOutputs((p) => ({ ...p, [q.id]: stdout }))}
                readOnly={submitted}
                height="200px"
              />
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
              {submitting ? '採点中...' : '提出する'}
            </button>
          ) : result ? (
            <div className={`rounded-xl p-4 ${result.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.passed ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
                <span className={`font-black text-lg ${result.passed ? 'text-emerald-700' : 'text-red-600'}`}>
                  {result.passed ? '合格！' : '不合格'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-700">
                {result.score} / {result.max_score} 点
                {result.xp_earned > 0 && (
                  <span className="ml-2 text-yellow-600">+{result.xp_earned} XP獲得</span>
                )}
                {result.perfect_bonus > 0 && (
                  <span className="ml-2 text-purple-600">満点ボーナス +{result.perfect_bonus} XP</span>
                )}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
