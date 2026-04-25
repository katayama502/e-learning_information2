'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Layout, Trash2, Eye, EyeOff, Loader2, X, Save } from 'lucide-react';
import { ElearningService } from '@/services/elearning';
import { toast } from 'sonner';

function CreateTrackModal({ isOpen, onClose, onCreated }: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        try {
            await fetch('/api/elearning/tracks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, image }),
            });
            toast.success('カリキュラムを作成しました');
            setTitle(''); setDescription(''); setImage('');
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
                    <h2 className="text-lg font-black text-slate-900">新しいカリキュラムを作成</h2>
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">カリキュラム名 *</label>
                        <input
                            type="text" value={title} onChange={e => setTitle(e.target.value)}
                            className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-900"
                            placeholder="例: DX入門" autoFocus required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">説明</label>
                        <textarea
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-900 min-h-[80px]"
                            placeholder="カリキュラムの概要を入力..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">サムネイル画像 URL</label>
                        <input
                            type="text" value={image} onChange={e => setImage(e.target.value)}
                            className="w-full font-bold border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-900"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
                            キャンセル
                        </button>
                        <button type="submit" disabled={saving || !title.trim()} className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? '作成中...' : '作成する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminCurriculumsPage() {
    const [tracks, setTracks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadTracks = async () => {
        setIsLoading(true);
        try {
            const data = await ElearningService.getTracks(true);
            setTracks(data);
        } catch (e) {
            toast.error('データの読み込みに失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadTracks(); }, []);

    const handleTogglePublish = async (track: any) => {
        setProcessingId(track.id);
        try {
            await ElearningService.updateTrack(track.id, { is_published: !track.is_published });
            toast.success(track.is_published ? '非公開にしました' : '公開しました');
            loadTracks();
        } catch (e) {
            toast.error('更新に失敗しました');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (track: any) => {
        if (!confirm(`「${track.title}」を削除してもよろしいですか？`)) return;
        setProcessingId(track.id);
        try {
            await ElearningService.deleteTrack(track.id);
            toast.success('削除しました');
            loadTracks();
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
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">カリキュラム管理</h1>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">学習トラック（カリキュラム）の一覧・作成・編集</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> 新規作成
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400 font-bold animate-pulse">読み込み中...</div>
                ) : tracks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold">
                        カリキュラムがありません。「新規作成」から追加してください。
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tracks.map(track => (
                            <div key={track.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${track.is_published ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Layout size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 truncate">{track.title}</span>
                                            {track.is_published
                                                ? <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Eye size={10} /> 公開中</span>
                                                : <span className="shrink-0 bg-slate-100 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><EyeOff size={10} /> 非公開</span>
                                            }
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold mt-0.5">
                                            コース {track.courses?.length ?? 0} 件
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                    {processingId === track.id
                                        ? <Loader2 size={20} className="animate-spin text-slate-400" />
                                        : <>
                                            <button
                                                onClick={() => handleTogglePublish(track)}
                                                title={track.is_published ? '非公開にする' : '公開する'}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                {track.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <Link
                                                href={`/admin/elearning/curriculums/${track.id}`}
                                                className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                            >
                                                編集
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(track)}
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

            <CreateTrackModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={loadTracks} />
        </div>
    );
}
