"use client";

import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Globe, FileText, Upload, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Job } from '@/types/shared';

interface JobFormProps {
    initialData?: Partial<Job>;
    onSubmit: (data: Partial<Job>) => void;
    isSubmitting?: boolean;
    submitLabel?: string;
}

const DEFAULT_FORM_DATA = {
    title: '',
    category: '中途',
    description: '',
    requirements: '',
    reward: '',
    workingHours: '',
    holidays: '',
    welfare: '',
    selectionProcess: '',
    location: '松山市',
    type: 'job',
};

export default function JobForm({ initialData, onSubmit, isSubmitting = false, submitLabel = '公開する' }: JobFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [importSource, setImportSource] = useState<'url' | 'pdf'>('url');
    const [url, setUrl] = useState('');
    const [fileData, setFileData] = useState<{ base64: string, mimeType: string } | null>(null);

    // Sanitization helper to ensure no property is null or undefined
    const sanitizeData = (data: any) => {
        const sanitized = { ...DEFAULT_FORM_DATA, ...data };
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] === null || sanitized[key] === undefined) {
                sanitized[key] = '';
            }
        });
        return sanitized;
    };

    // Form States
    const [formData, setFormData] = useState<any>(() => sanitizeData(initialData || {}));

    useEffect(() => {
        if (initialData) {
            setFormData((prev: any) => ({ ...prev, ...sanitizeData(initialData) }));
        }
    }, [initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove prefix "data:application/pdf;base64,"
            const base64Content = base64String.split(',')[1];
            setFileData({
                base64: base64Content,
                mimeType: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    // AI Auto-fill Handler
    const handleAutoFill = async () => {
        if (importSource === 'url' && !url) {
            toast.error('URLを入力してください');
            return;
        }
        if (importSource === 'pdf' && !fileData) {
            toast.error('PDFファイルをアップロードしてください');
            return;
        }

        setIsLoading(true);

        try {
            const payload = importSource === 'url'
                ? { input: url }
                : { base64Data: fileData?.base64, mimeType: fileData?.mimeType };

            const response = await fetch('/api/ai/job-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Generation failed');
            const data = await response.json();

            setFormData((prev: any) => ({
                ...prev,
                ...sanitizeData(data),
                category: data.category || prev.category
            }));

            toast.success('求人情報を生成しました！');

        } catch (e: any) {
            console.error(e);
            toast.error(`生成に失敗しました: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Single Field Auto-fill Handler
    const handleFieldRegenerate = async (field: string) => {
        if (importSource === 'url' && !url) {
            toast.error('URLを入力してください');
            return;
        }
        if (importSource === 'pdf' && !fileData) {
            toast.error('PDFファイルをアップロードしてください');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading(`${field} を再生成中...`);
        try {
            const payload = importSource === 'url'
                ? { input: url }
                : { base64Data: fileData?.base64, mimeType: fileData?.mimeType };

            const response = await fetch('/api/ai/job-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Generation failed');
            const data = await response.json();

            if (data[field] !== undefined) {
                setFormData((prev: any) => ({ ...prev, [field]: data[field] }));
                toast.success(`${field} を更新しました`, { id: toastId });
            } else {
                toast.error('該当情報の抽出に失敗しました', { id: toastId });
            }
        } catch (e: any) {
            console.error(e);
            toast.error(`生成に失敗しました: ${e.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => {
            const next = { ...prev, [key]: value ?? '' };

            // Auto-adjust category when type changes
            if (key === 'type') {
                if (value === 'job') {
                    // If current category is not in Job list, default to '中途'
                    if (!['新卒', '中途'].includes(prev.category)) {
                        next.category = '中途';
                    }
                } else if (value === 'quest') {
                    // If current category is in Job list, default to '体験JOB'
                    if (['新卒', '中途'].includes(prev.category)) {
                        next.category = '体験JOB';
                    }
                }
            }
            return next;
        });
    };

    const handleSubmit = () => {
        if (!formData.title) {
            toast.error('募集タイトルは必須です');
            return;
        }
        onSubmit(formData as any);
    };

    const LabelWithAI = ({ label, field, required = false }: { label: string, field: string, required?: boolean }) => (
        <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-black text-slate-700">
                {label} {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <button
                onClick={() => handleFieldRegenerate(field)}
                disabled={isLoading}
                className="p-1 rounded-md text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                title="この項目だけAIで再生成"
            >
                <Sparkles size={14} className={isLoading ? 'animate-pulse' : ''} />
            </button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">
                        {initialData ? '求人・クエスト編集' : '新規求人・クエスト作成'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {initialData ? '求人情報を更新します' : '既存の求人票やWEBページから一瞬で作成できます'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => toast.success('下書きを保存しました')}
                        className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                        <FileText size={18} />
                        下書き保存
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 flex items-center gap-2"
                    >
                        {isSubmitting ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                        {submitLabel}
                    </button>
                </div>
            </div>

            {/* AI Auto-fill Section - Only show for new items or explicit request */}
            {!initialData && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 text-indigo-700 font-black">
                        <Sparkles size={20} />
                        <h3>AI 一括自動入力 (Gemini 2.5 Flash Lite)</h3>
                    </div>

                    {/* Source Toggle */}
                    <div className="flex bg-white/60 p-1 rounded-xl w-fit border border-indigo-100">
                        <button
                            onClick={() => setImportSource('url')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${importSource === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            WEBサイト(URL)から
                        </button>
                        <button
                            onClick={() => setImportSource('pdf')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${importSource === 'pdf' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            求人票(PDF)から
                        </button>
                    </div>

                    {importSource === 'url' ? (
                        <div className="flex gap-2" key="url-source">
                            <div className="relative flex-1">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                                <input
                                    key="url-input"
                                    type="url"
                                    placeholder="https://wantedly.com/projects/..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <button
                                onClick={handleAutoFill}
                                disabled={isLoading}
                                className="bg-indigo-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                            >
                                {isLoading ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                {isLoading ? '解析中...' : 'AI全項目生成'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2" key="file-source">
                            <div className="relative flex-1">
                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
                                <input
                                    key="file-input"
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={handleFileChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            <button
                                onClick={handleAutoFill}
                                disabled={isLoading}
                                className="bg-indigo-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                            >
                                {isLoading ? <RefreshCcw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                {isLoading ? '解析中...' : 'AI全項目生成'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Editor Forms */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <label className="block text-sm font-black text-slate-700">募集タイプ</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleChange('type', 'job')}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${formData.type === 'job' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                            >
                                求人
                            </button>
                            <button
                                onClick={() => handleChange('type', 'quest')}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${formData.type === 'quest' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                            >
                                クエスト (体験)
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <label className="block text-sm font-black text-slate-700">勤務地 (エリア)</label>
                        <select
                            value={formData.location || '松山市'}
                            onChange={(e) => handleChange('location', e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors text-slate-900 appearance-none"
                        >
                            <option value="松山市">松山市</option>
                            <option value="今治市">今治市</option>
                            <option value="新居浜市">新居浜市</option>
                            <option value="西条市">西条市</option>
                            <option value="宇和島市">宇和島市</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <LabelWithAI label="募集タイトル" field="title" required />
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors text-slate-900"
                        placeholder="（例）未経験歓迎！SaaS営業のスターティングメンバー"
                    />
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <label className="block text-sm font-black text-slate-700">カテゴリー</label>
                    <div className="flex flex-wrap gap-2">
                        {(formData.type === 'job'
                            ? ['新卒', '中途']
                            : ['アルバイト', '体験JOB', 'ガクチカバイト', 'インターンシップ', '副業・兼業']
                        ).map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleChange('category', cat as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <LabelWithAI label="募集詳細" field="description" />
                    <textarea
                        rows={8}
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white transition-colors leading-relaxed text-slate-900"
                    />
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <LabelWithAI label="応募要件" field="requirements" />
                    <textarea
                        rows={5}
                        value={formData.requirements || ''}
                        onChange={(e) => handleChange('requirements', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white transition-colors leading-relaxed text-slate-900"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <LabelWithAI label="勤務時間" field="workingHours" />
                        <input
                            type="text"
                            value={formData.workingHours || ''}
                            onChange={(e) => handleChange('workingHours', e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                        />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <LabelWithAI label="休日・休暇" field="holidays" />
                        <input
                            type="text"
                            value={formData.holidays || ''}
                            onChange={(e) => handleChange('holidays', e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                        />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <LabelWithAI label="月収 (一覧表示用)" field="salary" />
                    <input
                        type="text"
                        value={formData.salary || ''}
                        onChange={(e) => handleChange('salary', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900"
                        placeholder="（例）25万円〜35万円"
                    />
                    <p className="text-xs text-slate-400">※ 求人一覧カードに表示されます。短潔に記載してください。</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <LabelWithAI label="給与詳細" field="reward" />
                    <textarea
                        rows={4}
                        value={formData.reward || ''}
                        onChange={(e) => handleChange('reward', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white transition-colors leading-relaxed text-slate-900"
                        placeholder="（例）基本給: 20万円〜, 賞与: 年2回 (昨年度実績), 昇給: 年1回, 手当: 通勤手当, 住宅手当..."
                    />
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-1">
                        <LabelWithAI label="選考フロー" field="selectionProcess" />
                    </div>
                    <textarea
                        rows={3}
                        value={formData.selectionProcess || ''}
                        onChange={(e) => handleChange('selectionProcess', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white transition-colors leading-relaxed text-slate-900"
                    />
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <LabelWithAI label="福利厚生" field="welfare" />
                    <textarea
                        rows={3}
                        value={formData.welfare || ''}
                        onChange={(e) => handleChange('welfare', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white transition-colors leading-relaxed text-slate-900"
                    />
                </div>
            </div>
        </div>
    );
}
