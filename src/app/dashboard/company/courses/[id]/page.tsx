"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen, Tag, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AdminCurriculumManager, { CurriculumColumn, LessonItem } from '@/components/admin/elearning/AdminCurriculumManager';
import { ImageUpload } from '@/components/ImageUpload';
import ContentFormModal from '@/components/admin/elearning/ContentFormModal';
import VideoPlayerModal from '@/components/admin/elearning/VideoPlayerModal';
import { ContentItem } from '@/data/mock_elearning_data';
import { ElearningService } from '@/services/elearning';
import { toast } from 'sonner';

const categoryOptions = [
    '未分類', 'AI・自動化', 'マーケティング', 'デジタル基礎', 'Google',
    'セキュリティ', '制作・開発', 'クリエイティブ', 'キャリア', '資格取得', 'アーカイブ'
];

export default function CompanyCourseDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('未分類');
    const [tags, setTags] = useState<string[]>([]);
    const [image, setImage] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [chapters, setChapters] = useState<CurriculumColumn[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
    const [playingContent, setPlayingContent] = useState<ContentItem | null>(null);

    React.useEffect(() => {
        const load = async () => {
            if (!params.id) return;
            try {
                const mod = await ElearningService.getModule(params.id as string);
                if (mod) {
                    setTitle(mod.title);
                    setDescription(mod.description || '');
                    setTags(mod.tags || []);
                    setImage(mod.image || mod.thumbnail_url || '');
                    setCategory(mod.category || '未分類');
                    setIsPublic(!!mod.is_public);

                    const mappedLessons = (mod.lessons || []).map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        duration: l.duration || '0:00',
                        type: l.type as 'video' | 'quiz',
                        thumbnail: '',
                        videoUrl: l.url,
                        quiz: l.quiz,
                        materialUrl: l.material_url,
                    }));

                    setChapters([{ id: 'main', title: 'Lessons', lessons: mappedLessons }]);
                }
            } catch (e) {
                toast.error('データの読み込みに失敗しました');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedTags = tags.filter(t => !t.startsWith('image:'));
            if (image) updatedTags.push(`image:${image}`);

            const lessonIds = chapters.flatMap(c => c.lessons.map(l => l.id));

            await ElearningService.updateModule(params.id as string, {
                title,
                description,
                tags: updatedTags,
                category,
                lessonIds,
            });
            toast.success('保存しました');
        } catch (e) {
            toast.error('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async () => {
        try {
            await ElearningService.updateModule(params.id as string, { is_public: !isPublic });
            setIsPublic(!isPublic);
            toast.success(!isPublic ? '公開しました' : '非公開にしました');
        } catch (e) {
            toast.error('更新に失敗しました');
        }
    };

    const handleDelete = async () => {
        if (!confirm('この講座を削除しますか？含まれるレッスンも全て削除されます。この操作は取り消せません。')) return;
        try {
            await ElearningService.deleteModule(params.id as string);
            toast.success('削除しました');
            router.push('/dashboard/company/courses');
        } catch (e) {
            toast.error('削除に失敗しました');
        }
    };

    const handleEditLesson = (lesson: LessonItem) => {
        const contentItem: ContentItem = {
            id: lesson.id,
            title: lesson.title,
            url: lesson.videoUrl || '',
            category,
            type: lesson.type,
            duration: lesson.duration,
            createdAt: new Date().toISOString(),
            // @ts-ignore
            quiz: lesson.quiz,
            // @ts-ignore
            material_url: lesson.materialUrl,
        };
        setEditingContent(contentItem);
        setIsEditModalOpen(true);
    };

    const handlePlayVideo = (lesson: LessonItem) => {
        setPlayingContent({
            id: lesson.id,
            title: lesson.title,
            url: lesson.videoUrl || '',
            category,
            type: 'video',
            duration: lesson.duration,
        } as ContentItem);
    };

    const handleSaveContent = async (item: ContentItem) => {
        try {
            await ElearningService.updateContent(item.id, {
                title: item.title,
                duration: item.duration,
                url: item.url,
                quiz: item.quiz,
                material_url: item.material_url,
                hasQuiz: !!item.quiz,
                hasDocument: !!item.material_url,
            } as any);

            setChapters(prev => prev.map(c => ({
                ...c,
                lessons: c.lessons.map(l => l.id === item.id ? {
                    ...l,
                    title: item.title,
                    duration: item.duration || '',
                    videoUrl: item.url,
                    // @ts-ignore
                    quiz: item.quiz,
                    // @ts-ignore
                    materialUrl: item.material_url,
                } : l),
            })));

            setIsEditModalOpen(false);
            setEditingContent(null);
            toast.success('レッスンを更新しました');
        } catch (e) {
            toast.error('更新に失敗しました');
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 pb-20">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 space-y-5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-2xl" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <Skeleton className="h-12 w-full rounded-2xl" />
                    </div>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl">
                            <Skeleton className="w-32 h-20 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/company/courses"
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate max-w-xs">
                            {title || '講座詳細'}
                        </h1>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">講座の編集・レッスン管理</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDelete}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="削除"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={handleTogglePublish}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                            isPublic
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                        {isPublic ? '公開中' : '非公開'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? '保存中...' : '保存する'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Metadata */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                        <h2 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                            <Tag size={16} className="text-slate-400" /> 基本情報
                        </h2>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">タイトル</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full font-bold border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">説明</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full font-bold border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors min-h-[100px] text-slate-900"
                                placeholder="講座の概要..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">カテゴリ</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full font-bold border-2 border-slate-100 rounded-2xl px-4 py-3 focus:border-emerald-500 outline-none transition-colors text-slate-900 bg-white"
                            >
                                {categoryOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <ImageUpload
                            currentImageUrl={image}
                            onImageUploaded={setImage}
                            label="カバー画像"
                            bucketName="image"
                            folder="courses"
                        />
                    </div>
                </div>

                {/* Right: Lessons */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                        <BookOpen size={16} className="text-slate-400" /> レッスン一覧
                    </h2>

                    {chapters.length > 0 && chapters[0].lessons.length > 0 ? (
                        <AdminCurriculumManager
                            initialCurriculums={chapters}
                            onSave={setChapters}
                            onEditLesson={handleEditLesson}
                            onPlayVideo={handlePlayVideo}
                        />
                    ) : (
                        <div className="p-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-[2rem]">
                            <BookOpen size={32} className="mx-auto mb-3 text-slate-200" />
                            <p>レッスンがありません</p>
                            <p className="text-xs mt-1">コンテンツ管理画面からレッスンを追加できます</p>
                        </div>
                    )}
                </div>
            </div>

            <ContentFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveContent}
                initialData={editingContent}
            />

            <VideoPlayerModal
                content={playingContent}
                onClose={() => setPlayingContent(null)}
            />
        </div>
    );
}
