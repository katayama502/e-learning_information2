'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, BookOpen, Trash2, Eye, EyeOff, Loader2, X, Save } from 'lucide-react';
import { ElearningService } from '@/services/elearning';
import { toast } from 'sonner';

function CreateCourseModal({ isOpen, onClose, onCreated, tracks }: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    tracks: any[];
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [trackId, setTrackId] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !trackId) return;
        setSaving(true);
        try {
            await ElearningService.createModule({ title, description, course_id: trackId });
            toast.success('コースを作成しました');
            setTitle(''); setDescription(''); setTrackId('');
            onCreated();
            onClose();
        } catch (e) {
            toast.error('作成に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black text-slate-900">新しいコースを作成</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">コース名 *</label>
                        <input
                            type="text" value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-900"
                            placeholder="例: ChatGPT基礎" autoFocus required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">所属カリキュラム *</label>
                        <select
                            value={trackId} onChange={e => setTrackId(e.target.value)}
                            className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-900 bg-white"
                            required
                        >
                            <option value="">カリキュラムを選択...</option>
                            {tracks.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">説明</label>
                        <textarea
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-900 min-h-[80px]"
                            placeholder="コースの概要を入力..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
                            キャンセル
                        </button>
                        <button type="submit" disabled={saving || !title.trim() || !trackId} className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? '作成中...' : '作成する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminCoursesPage() {
    const [modules, setModules] = useState<any[]>([]);
    const [tracks, setTracks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [mods, trks] = await Promise.all([
                ElearningService.getAllModules(),
                ElearningService.getTracks(true),
            ]);
            setModules(mods);
            setTracks(trks);
        } catch (e) {
            toast.error('データの読み込みに失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleTogglePublish = async (mod: any) => {
        setProcessingId(mod.id);
        try {
            await ElearningService.updateModule(mod.id, { is_public: !mod.is_public });
            toast.success(mod.is_public ? '非公開にしました' : '公開しました');
            loadData();
        } catch (e) {
            toast.error('更新に失敗しました');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (mod: any) => {
        if (!confirm(`「${mod.title}」を削除してもよろしいですか？含まれるレッスンも全て削除されます。`)) return;
        setProcessingId(mod.id);
        try {
            await ElearningService.deleteModule(mod.id);
            toast.success('削除しました');
            loadData();
        } catch (e) {
            toast.error('削除に失敗しました');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">コース一覧</h1>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">登録済みコースの確認・作成・編集</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} /> コース追加
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400 font-bold animate-pulse">読み込み中...</div>
                ) : modules.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold">
                        コースがありません。「コース追加」から作成してください。
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {modules.map(mod => (
                            <div key={mod.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${mod.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 truncate">{mod.title}</span>
                                            {mod.is_public
                                                ? <span className="shrink-0 bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Eye size={10} /> 公開中</span>
                                                : <span className="shrink-0 bg-slate-100 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><EyeOff size={10} /> 非公開</span>
                                            }
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold mt-0.5">
                                            {mod.courseCount} レッスン
                                            {mod.category && mod.category !== '未分類' && <span className="ml-2 text-blue-500">{mod.category}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    {processingId === mod.id
                                        ? <Loader2 size={20} className="animate-spin text-slate-400" />
                                        : <>
                                            <button
                                                onClick={() => handleTogglePublish(mod)}
                                                title={mod.is_public ? '非公開にする' : '公開する'}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            >
                                                {mod.is_public ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <Link
                                                href={`/admin/elearning/courses/${mod.id}`}
                                                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                            >
                                                編集
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(mod)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateCourseModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={loadData}
                tracks={tracks}
            />
        </div>
    );
}
