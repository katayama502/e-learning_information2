"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { ElearningService } from '@/services/elearning';
import { toast } from 'sonner';

const categoryOptions = [
    '未分類', 'AI・自動化', 'マーケティング', 'デジタル基礎', 'Google',
    'セキュリティ', '制作・開発', 'クリエイティブ', 'キャリア', '資格取得', 'アーカイブ'
];

export default function NewCoursePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [titleTouched, setTitleTouched] = useState(false);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('未分類');
    const [image, setImage] = useState('');
    const [trackId, setTrackId] = useState('');
    const [tracks, setTracks] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const titleError = titleTouched && !title.trim() ? '講座タイトルは必須です' : '';

    useEffect(() => {
        ElearningService.getTracks(true)
            .then(setTracks)
            .catch(() => toast.error('カリキュラム一覧の読み込みに失敗しました'));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTitleTouched(true);
        if (!title.trim()) return;
        setSaving(true);
        try {
            const created = await ElearningService.createModule({
                title,
                description,
                course_id: trackId || (tracks[0]?.id ?? ''),
            });
            // Save category and image via updateModule
            if (created?.id) {
                const extraUpdates: any = { category };
                if (image) extraUpdates.tags = [`image:${image}`];
                await ElearningService.updateModule(created.id, extraUpdates);
                toast.success('講座を作成しました');
                router.push(`/dashboard/company/courses/${created.id}`);
            }
        } catch (e) {
            toast.error('作成に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/company/courses"
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">新規講座を作成</h1>
                    <p className="text-sm font-bold text-slate-400 mt-0.5">基本情報を入力して講座を作成します</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                        講座タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={() => setTitleTouched(true)}
                        className={`w-full font-bold border-2 rounded-2xl px-4 py-3 focus:outline-none text-slate-900 transition-colors ${
                            titleError
                                ? 'border-red-400 focus:border-red-500 bg-red-50'
                                : 'border-slate-100 focus:border-emerald-500'
                        }`}
                        placeholder="例: ChatGPT活用入門"
                        required
                        autoFocus
                    />
                    {titleError && (
                        <p className="mt-1.5 text-xs font-bold text-red-500">{titleError}</p>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">説明</label>
                        <span className={`text-xs font-bold tabular-nums ${description.length > 480 ? 'text-red-500' : 'text-slate-400'}`}>
                            {description.length}/500
                        </span>
                    </div>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value.slice(0, 500))}
                        className="w-full font-bold border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none text-slate-900 min-h-[120px] transition-colors"
                        placeholder="講座の概要を入力してください..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">カテゴリ</label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full font-bold border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none text-slate-900 bg-white transition-colors"
                    >
                        {categoryOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {tracks.length > 0 && (
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">所属トラック</label>
                        <select
                            value={trackId}
                            onChange={e => setTrackId(e.target.value)}
                            className="w-full font-bold border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none text-slate-900 bg-white transition-colors"
                        >
                            <option value="">トラックを選択...</option>
                            {tracks.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">カバー画像 URL</label>
                    <input
                        type="text"
                        value={image}
                        onChange={e => setImage(e.target.value)}
                        className="w-full font-bold border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none text-slate-900 transition-colors"
                        placeholder="https://..."
                    />
                    {image && (
                        <img
                            src={image}
                            alt="preview"
                            className="mt-3 w-full h-40 object-cover rounded-2xl border border-slate-100"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}
                </div>

                <div className="flex gap-4 pt-2">
                    <Link
                        href="/dashboard/company/courses"
                        className="flex-1 flex items-center justify-center py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                    >
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        disabled={saving || !title.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? '作成中...' : '講座を作成する'}
                    </button>
                </div>
            </form>
        </div>
    );
}
