'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';

type EventFormModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    event?: any; // If provided, edit mode
};

export default function EventFormModal({ isOpen, onClose, onSuccess, event }: EventFormModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [instructors, setInstructors] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'webinar',
        start_at: '',
        end_at: '',
        instructor_id: '',
        capacity: 100,
        location: '',
        web_url: '',
        status: 'draft',
        image_url: ''
    });

    // Reset or populate form & Fetch Instructors
    useEffect(() => {
        if (isOpen) {
            // Populate Form
            if (event) {
                setFormData({
                    title: event.title || '',
                    description: event.description || '',
                    event_type: event.event_type || 'webinar',
                    start_at: event.start_at ? new Date(event.start_at).toISOString().slice(0, 16) : '',
                    end_at: event.end_at ? new Date(event.end_at).toISOString().slice(0, 16) : '',
                    instructor_id: event.instructor_id || '',
                    capacity: event.capacity || 100,
                    location: event.location || '',
                    web_url: event.web_url || '',
                    status: event.status || 'draft',
                    image_url: event.image_url || ''
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    event_type: 'webinar',
                    start_at: '',
                    end_at: '',
                    instructor_id: '',
                    capacity: 100,
                    location: '',
                    web_url: '',
                    status: 'draft',
                    image_url: ''
                });
            }

            // Fetch Instructors with AbortController
            const controller = new AbortController();
            const signal = controller.signal;

            const fetchInstructors = async () => {
                try {
                    const res = await fetch('/api/reskill/instructors', { signal });
                    if (!res.ok) throw new Error('Failed to fetch instructors');
                    const data = await res.json();
                    if (!signal.aborted) {
                        setInstructors(data);
                    }
                } catch (error: any) {
                    if (error.name !== 'AbortError') {
                        console.error('Failed to load instructors', error);
                        toast.error('講師リストの読み込みに失敗しました');
                    }
                }
            };
            fetchInstructors();

            return () => {
                controller.abort();
            };
        }
    }, [isOpen, event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = event ? `/api/reskill/events/${event.id}` : '/api/reskill/events';
            const method = event ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    // Convert local datetime to UTC ISO string if needed by backend, 
                    // or just send ISO string. Supabase handles ISO strings well.
                    start_at: new Date(formData.start_at).toISOString(),
                    end_at: new Date(formData.end_at).toISOString(),
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(event ? 'イベントを更新しました' : 'イベントを作成しました');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('保存に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-black text-slate-800">
                        {event ? 'イベント編集' : 'イベント新規作成'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">イベントタイトル <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="例：Webデザイン入門講座"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">開催形式</label>
                                <select
                                    name="event_type"
                                    value={formData.event_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                                >
                                    <option value="webinar">WEBセミナー</option>
                                    <option value="real">リアルセミナー</option>
                                    <option value="event">その他イベント</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">ステータス</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                                >
                                    <option value="draft">下書き (Draft)</option>
                                    <option value="published">公開 (Published)</option>
                                    <option value="completed">終了 (Completed)</option>
                                    <option value="cancelled">中止 (Cancelled)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">担当講師</label>
                            <select
                                name="instructor_id"
                                value={formData.instructor_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                            >
                                <option value="">講師を選択してください</option>
                                {instructors.map((inst) => (
                                    <option key={inst.id} value={inst.id}>
                                        {inst.display_name} ({inst.specialization})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Schedule & Capacity */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">開始日時 <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                name="start_at"
                                required
                                value={formData.start_at}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">終了日時 <span className="text-red-500">*</span></label>
                            <input
                                type="datetime-local"
                                name="end_at"
                                required
                                value={formData.end_at}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">定員</label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                            />
                        </div>
                    </div>

                    {/* Description & Location */}
                    <div className="space-y-4">
                        {formData.event_type === 'webinar' ? (
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Webinar URL</label>
                                <input
                                    type="url"
                                    name="web_url"
                                    value={formData.web_url}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                                    placeholder="https://zoom.us/..."
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">開催場所</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                                    placeholder="例：松山市コミュニティセンター"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">詳細説明</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none resize-none"
                                placeholder="イベントの内容について記述してください..."
                            />
                        </div>

                        <ImageUpload
                            currentImageUrl={formData.image_url}
                            onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                            label="イベント画像"
                            bucketName="image"
                            folder="events"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                        >
                            {isLoading && <Loader2 size={18} className="animate-spin" />}
                            {event ? '更新する' : '作成する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
