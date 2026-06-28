'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  BookOpen, Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronRight,
  FileText, ListChecks, X, Check,
} from 'lucide-react';
import {
  subscribeCurriculum, createUnit, updateUnit, deleteUnit, deleteMaterial,
} from '@/lib/curriculum/firestore';
import { MaterialEditor } from '@/components/admin/MaterialEditor';
import type { Unit, Material } from '@/lib/curriculum/types';

export default function AdminCurriculumPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Set<string>>(new Set());

  // ユニット編集
  const [unitModal, setUnitModal] = useState<{ unit: Unit | null } | null>(null);
  // 教材編集
  const [matModal, setMatModal] = useState<{ unitId: string; material: Material | null; defaultOrder: number } | null>(null);

  useEffect(() => {
    const unsub = subscribeCurriculum((u) => {
      setUnits(u);
      setLoading(false);
      setOpen((prev) => (prev.size === 0 ? new Set(u.map((x) => x.id)) : prev));
    });
    return () => unsub();
  }, []);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteUnit = async (u: Unit) => {
    if (!confirm(`ユニット「${u.title}」と配下の${u.materials.length}教材をすべて削除します。よろしいですか？`)) return;
    try {
      await deleteUnit(u.id);
      toast.success('ユニットを削除しました');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDeleteMaterial = async (m: Material) => {
    if (!confirm(`教材「${m.title}」を削除します。よろしいですか？`)) return;
    try {
      await deleteMaterial(m.id);
      toast.success('教材を削除しました');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen size={24} className="text-amber-500" />
            カリキュラム管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">ユニットと教材（スライド・コード・確認テスト）を管理します</p>
        </div>
        <button
          onClick={() => setUnitModal({ unit: null })}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} /> ユニットを追加
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> <span className="font-bold text-sm">読み込み中...</span>
        </div>
      ) : units.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          <BookOpen size={40} className="mx-auto mb-3" />
          <p className="font-bold">カリキュラムがありません</p>
          <p className="text-xs mt-1">「ユニットを追加」から作成してください。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => {
            const isOpen = open.has(unit.id);
            return (
              <div key={unit.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3">
                  <button onClick={() => toggle(unit.id)} className="p-1 text-slate-400 hover:text-slate-600">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 truncate">{unit.title}</h3>
                    <p className="text-xs text-slate-400">{unit.materials.length} 教材 ・ 表示順 {unit.order}</p>
                  </div>
                  <button
                    onClick={() => setMatModal({ unitId: unit.id, material: null, defaultOrder: unit.materials.length + 1 })}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg"
                  >
                    <Plus size={13} /> 教材
                  </button>
                  <button onClick={() => setUnitModal({ unit })} className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50" title="ユニットを編集">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDeleteUnit(unit)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" title="ユニットを削除">
                    <Trash2 size={15} />
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {unit.materials.length === 0 ? (
                      <p className="text-xs text-slate-400 px-12 py-4">教材がありません</p>
                    ) : (
                      unit.materials.map((m, idx) => (
                        <div key={m.id} className="flex items-center gap-3 px-12 py-2.5 hover:bg-slate-50/50">
                          <span className="text-xs font-black text-slate-300 w-5">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-700 truncate">{m.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              {m.slide_ref && <span className="text-[11px] text-slate-400 flex items-center gap-1"><FileText size={10} /> スライド</span>}
                              <span className="text-[11px] text-slate-400 flex items-center gap-1"><ListChecks size={10} /> {m.questions.length}問</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setMatModal({ unitId: unit.id, material: m, defaultOrder: m.order ?? idx + 1 })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                          >
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteMaterial(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {unitModal && (
        <UnitModal
          unit={unitModal.unit}
          defaultOrder={units.length + 1}
          onClose={() => setUnitModal(null)}
        />
      )}

      {matModal && (
        <MaterialEditor
          unitId={matModal.unitId}
          material={matModal.material}
          defaultOrder={matModal.defaultOrder}
          onClose={() => setMatModal(null)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}

// ---- ユニット作成・編集モーダル ----
function UnitModal({ unit, defaultOrder, onClose }: { unit: Unit | null; defaultOrder: number; onClose: () => void }) {
  const [title, setTitle] = useState(unit?.title ?? '');
  const [order, setOrder] = useState(unit?.order ?? defaultOrder);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!title.trim()) { toast.error('タイトルを入力してください'); return; }
    setBusy(true);
    try {
      if (unit) {
        await updateUnit(unit.id, { title: title.trim(), order });
        toast.success('ユニットを更新しました');
      } else {
        await createUnit(title.trim(), order);
        toast.success('ユニットを追加しました');
      }
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg text-slate-800">{unit ? 'ユニットを編集' : 'ユニットを追加'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">タイトル *</label>
            <input
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 第1章｜情報社会の進展と情報技術"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">表示順</label>
            <input
              type="number"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={order} onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">キャンセル</button>
            <button
              onClick={save} disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
