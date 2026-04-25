"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, MoreVertical, Eye, EyeOff, Trash2, Search, Loader2 } from 'lucide-react';
import { ElearningService } from '@/services/elearning';
import { toast } from 'sonner';

export default function CompanyCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadCourses = async () => {
        setIsLoading(true);
        try {
            const data = await ElearningService.getAllModules();
            setCourses(data);
        } catch (e) {
            toast.error('データの読み込みに失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadCourses(); }, []);

    const handleTogglePublish = async (course: any) => {
        setProcessingId(course.id);
        try {
            await ElearningService.updateModule(course.id, { is_public: !course.is_public });
            toast.success(course.is_public ? '非公開にしました' : '公開しました');
            loadCourses();
        } catch (e) {
            toast.error('更新に失敗しました');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (course: any) => {
        if (!confirm(`「${course.title}」を削除してもよろしいですか？含まれるレッスンも全て削除されます。`)) return;
        setProcessingId(course.id);
        try {
            await ElearningService.deleteModule(course.id);
            toast.success('削除しました');
            loadCourses();
        } catch (e) {
            toast.error('削除に失敗しました');
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const publicCount = courses.filter(c => c.is_public).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">講座管理</h1>
                    <p className="text-slate-500 font-bold mt-2">作成した学習コンテンツの管理・編集ができます。</p>
                </div>
                <Link
                    href="/dashboard/company/courses/new"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-3xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:-translate-y-1"
                >
                    <Plus size={20} />
                    <span>新規講座を作成</span>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">総講座数</p>
                    <p className="text-3xl font-black text-slate-800">{courses.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">公開中</p>
                    <p className="text-3xl font-black text-emerald-600">{publicCount}</p>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">非公開</p>
                    <p className="text-3xl font-black text-slate-400">{courses.length - publicCount}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="講座タイトルで検索..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 shadow-sm transition-all"
                />
            </div>

            {/* Course Grid */}
            {isLoading ? (
                <div className="py-20 text-center text-slate-400 font-bold animate-pulse">読み込み中...</div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={40} />
                    </div>
                    <p className="text-slate-400 font-bold">
                        {searchQuery ? '検索結果がありません' : 'まだ講座がありません。新しい学びの扉を開きましょう！'}
                    </p>
                    {!searchQuery && (
                        <Link href="/dashboard/company/courses/new" className="inline-block mt-6 text-emerald-600 font-black hover:underline">
                            最初の講座を作成する
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex gap-4">
                                <div className="shrink-0">
                                    {course.image ? (
                                        <img src={course.image} alt={course.title} className="w-20 h-20 rounded-2xl object-cover" onError={e => { (e.target as any).style.display = 'none'; }} />
                                    ) : (
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${course.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <BookOpen size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <h3 className="font-black text-slate-800 text-base truncate group-hover:text-emerald-600 transition-colors">
                                                {course.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-slate-400">{course.courseCount} レッスン</span>
                                                {course.is_public
                                                    ? <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Eye size={9} /> 公開中</span>
                                                    : <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-1"><EyeOff size={9} /> 非公開</span>
                                                }
                                            </div>
                                        </div>
                                        {processingId === course.id
                                            ? <Loader2 size={18} className="animate-spin text-slate-300 shrink-0" />
                                            : (
                                                <button
                                                    onClick={() => handleTogglePublish(course)}
                                                    className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors shrink-0"
                                                    title={course.is_public ? '非公開にする' : '公開する'}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>

                            {course.category && course.category !== '未分類' && (
                                <div className="mt-4">
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                        {course.category}
                                    </span>
                                </div>
                            )}

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <Link
                                    href={`/dashboard/company/courses/${course.id}`}
                                    className="flex items-center justify-center py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors"
                                >
                                    詳細・編集
                                </Link>
                                <Link
                                    href={`/reskill/course/${course.id}`}
                                    target="_blank"
                                    className="flex items-center justify-center py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-sm hover:bg-emerald-100 transition-colors"
                                >
                                    プレビュー
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
