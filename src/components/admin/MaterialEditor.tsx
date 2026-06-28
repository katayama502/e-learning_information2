'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Plus, Trash2, Loader2, Check, ListChecks, Code2 } from 'lucide-react';
import { createMaterial, updateMaterial } from '@/lib/curriculum/firestore';
import type { Material, Question } from '@/lib/curriculum/types';

function newId(prefix: string) {
  const rnd = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.floor(Math.random() * 1e8).toString(36);
  return `${prefix}-${rnd}`;
}

interface Props {
  unitId: string;
  material: Material | null; // null = 新規作成
  defaultOrder: number;
  onClose: () => void;
  onSaved: () => void;
}

export function MaterialEditor({ unitId, material, defaultOrder, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(material?.title ?? '');
  const [slideRef, setSlideRef] = useState(material?.slide_ref ?? '');
  const [starterCode, setStarterCode] = useState(material?.starter_code ?? '');
  const [order, setOrder] = useState(material?.order ?? defaultOrder);
  const [questions, setQuestions] = useState<Question[]>(material?.questions ?? []);
  const [busy, setBusy] = useState(false);

  // モーダルが別の教材に切り替わったときにフォームを同期する
  useEffect(() => {
    setTitle(material?.title ?? '');
    setSlideRef(material?.slide_ref ?? '');
    setStarterCode(material?.starter_code ?? '');
    setOrder(material?.order ?? defaultOrder);
    setQuestions(material?.questions ?? []);
  }, [material?.id]);

  const addChoiceQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      { id: newId('q'), type: 'choice', prompt: '', choices: ['', ''], correct: 0, points: 10 },
    ]);
  };
  const addCodeQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      { id: newId('q'), type: 'code', prompt: '', points: 20, code_tests: [{ input: '', expected_output: '' }] },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };
  const removeQuestion = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error('タイトルを入力してください'); return; }
    // バリデーション
    for (const q of questions) {
      if (!q.prompt.trim()) { toast.error('すべての問題に設問文を入力してください'); return; }
      if (q.type === 'choice') {
        const filled = (q.choices ?? []).filter((c) => c.trim());
        if (filled.length < 2) { toast.error('選択問題には2つ以上の選択肢が必要です'); return; }
        const correctChoice = (q.choices ?? [])[q.correct ?? 0];
        if (!correctChoice?.trim()) { toast.error('正解に空の選択肢が設定されています'); return; }
      }
    }

    const payload: Omit<Material, 'id'> = {
      unitId,
      title: title.trim(),
      slide_ref: slideRef.trim() || null,
      starter_code: starterCode,
      questions,
      order,
    };

    setBusy(true);
    try {
      if (material) {
        await updateMaterial(material.id, payload);
        toast.success('教材を更新しました');
      } else {
        await createMaterial(payload);
        toast.success('教材を追加しました');
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-black text-lg text-slate-800">{material ? '教材を編集' : '教材を追加'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="lbl">タイトル *</label>
              <input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 重回帰分析の基礎" />
            </div>
            <div>
              <label className="lbl">表示順</label>
              <input type="number" min={1} className="inp" value={order} onChange={(e) => { const v = parseInt(e.target.value, 10); setOrder(isNaN(v) || v < 1 ? 1 : v); }} />
            </div>
          </div>

          <div>
            <label className="lbl">スライドURL（Google Slides / PDF。任意）</label>
            <input className="inp" value={slideRef} onChange={(e) => setSlideRef(e.target.value)} placeholder="https://docs.google.com/presentation/..." />
          </div>

          <div>
            <label className="lbl">スターターコード（Python）</label>
            <textarea
              className="inp font-mono text-xs leading-relaxed"
              rows={8}
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              placeholder="# ここにPythonのサンプルコードを記述"
            />
          </div>

          {/* 確認テスト */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="lbl mb-0">確認テスト（{questions.length}問）</label>
              <div className="flex gap-2">
                <button onClick={addChoiceQuestion} className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg">
                  <ListChecks size={13} /> 選択問題
                </button>
                <button onClick={addCodeQuestion} className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg">
                  <Code2 size={13} /> コード問題
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={q.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`text-[10px] font-black px-2 py-1 rounded shrink-0 ${q.type === 'choice' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {q.type === 'choice' ? '選択' : 'コード'} Q{qi + 1}
                    </span>
                    <textarea
                      className="inp text-xs" rows={2}
                      value={q.prompt}
                      onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                      placeholder="設問文"
                    />
                    <button onClick={() => removeQuestion(q.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 pl-1">
                    <span className="text-[11px] font-bold text-slate-400">配点</span>
                    <input
                      type="number"
                      className="inp w-20 py-1 text-xs"
                      value={q.points}
                      onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                    />
                    <span className="text-[11px] text-slate-400">点</span>
                  </div>

                  {q.type === 'choice' ? (
                    <ChoiceEditor q={q} onChange={(patch) => updateQuestion(q.id, patch)} />
                  ) : (
                    <CodeTestEditor q={q} onChange={(patch) => updateQuestion(q.id, patch)} />
                  )}
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  問題はまだありません。「選択問題」「コード問題」から追加できます。
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            保存
          </button>
        </div>

        <style jsx global>{`
          .lbl { display:block; font-size:0.75rem; font-weight:700; color:#64748b; margin-bottom:0.375rem; }
          .inp { width:100%; padding:0.5rem 0.625rem; border:1px solid #e2e8f0; border-radius:0.625rem; font-size:0.875rem; outline:none; background:white; }
          .inp:focus { box-shadow:0 0 0 2px #f59e0b; border-color:transparent; }
        `}</style>
      </div>
    </div>
  );
}

// ---- 選択肢エディタ ----
function ChoiceEditor({ q, onChange }: { q: Question; onChange: (patch: Partial<Question>) => void }) {
  const choices = q.choices ?? [];
  const setChoice = (i: number, val: string) => {
    const next = [...choices];
    next[i] = val;
    onChange({ choices: next });
  };
  const addChoice = () => onChange({ choices: [...choices, ''] });
  const removeChoice = (i: number) => {
    const next = choices.filter((_, idx) => idx !== i);
    let correct = q.correct ?? 0;
    if (correct >= next.length) correct = Math.max(0, next.length - 1);
    onChange({ choices: next, correct });
  };

  return (
    <div className="space-y-1.5 pl-1">
      <p className="text-[11px] font-bold text-slate-400 mb-1">選択肢（ラジオで正解を選択）</p>
      {choices.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            checked={q.correct === i}
            onChange={() => onChange({ correct: i })}
            className="accent-emerald-600 shrink-0"
            title="正解にする"
          />
          <input
            className="inp text-xs py-1.5"
            value={c}
            onChange={(e) => setChoice(i, e.target.value)}
            placeholder={`選択肢 ${String.fromCharCode(65 + i)}`}
          />
          {choices.length > 2 && (
            <button onClick={() => removeChoice(i)} className="p-1 text-slate-400 hover:text-red-600 shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      <button onClick={addChoice} className="flex items-center gap-1 text-[11px] font-bold text-purple-600 mt-1">
        <Plus size={12} /> 選択肢を追加
      </button>
    </div>
  );
}

// ---- コードテストエディタ ----
function CodeTestEditor({ q, onChange }: { q: Question; onChange: (patch: Partial<Question>) => void }) {
  const test = q.code_tests?.[0] ?? { input: '', expected_output: '' };
  return (
    <div className="pl-1">
      <p className="text-[11px] font-bold text-slate-400 mb-1">期待される出力（標準出力と完全一致で正解）</p>
      <input
        className="inp text-xs font-mono py-1.5"
        value={test.expected_output}
        onChange={(e) => onChange({ code_tests: [{ input: test.input ?? '', expected_output: e.target.value }] })}
        placeholder="例: 55"
      />
    </div>
  );
}
