"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    PlayCircle, CheckCircle2, BookOpen, Clock,
    TrendingUp, Award, ChevronRight,
    Zap, Star, ArrowRight, Layers, Play, Sparkles, Flame,
    MonitorPlay, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import TrackRoadmapView from '@/components/reskill/TrackRoadmapView';
import { ElearningService } from '@/services/elearning';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to extract YouTube ID from URL
const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to get fallback image based on course title
// Only use local paths (starting with /), ignore external URLs
const getCourseImage = (course: { image?: string; title: string }) => {
    // Only use course.image if it's a local path (starts with /)
    if (course.image && course.image.startsWith('/')) {
        return course.image;
    }

    const title = course.title;
    if (title.includes('リスキル')) return '/courses/reskill_archive.png';
    if (title.includes('ITパスポート')) return '/courses/it_passport.png';
    if (title.includes('基本情報')) return '/courses/fe_exam.png';
    if (title.includes('キャリア')) return '/courses/career_support.png';
    if (title.includes('AI')) return '/courses/ai_course.png';
    if (title.includes('SNS') || title.includes('マーケティング')) return '/courses/sns_marketing.png';
    if (title.includes('動画')) return '/courses/video_production.png';
    if (title.includes('アプリ')) return '/courses/app_development.png';
    if (title.includes('自動化')) return '/courses/automation.png';
    if (title.includes('セキュリティ')) return '/courses/security_course.png';
    if (title.includes('Google Apps Script') || title.includes('GAS')) return '/courses/gas_course.png';
    if (title.includes('Google')) return '/courses/google_basics.png';
    if (title.includes('HP') || title.includes('Web') || title.includes('ウェブ')) return '/courses/hp_course.png';
    if (title.includes('DX')) return '/courses/track_dx.png';
    if (title.includes('デジタル')) return '/courses/digital_basics.png';

    return '/courses/digital_basics.png';
};

// Recently Viewed Section Component with YouTube thumbnails and inline play
function RecentlyViewedSection({ lessons, courses, activeTrack }: { lessons: any[]; courses: any[]; activeTrack: any }) {
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    return (
        <section>
            <div className="flex items-center justify-between mb-4 mt-12">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <Clock className="text-blue-500" />
                    最近見たレッスン
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson: any) => {
                    // Find module containing this lesson
                    const module = courses.find((c: any) => c.lessons && c.lessons.some((l: any) => l.id === lesson.id));
                    // Extract YouTube ID from lesson URL
                    const youtubeId = getYoutubeId(lesson.url);
                    // Use YouTube thumbnail if available, otherwise fallback
                    const thumbnail = youtubeId
                        ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                        : module?.thumbnail_url || activeTrack?.image || '/illustrations/dx_roadmap.png';

                    const isPlaying = playingVideoId === lesson.id;

                    return (
                        <div
                            key={lesson.id}
                            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                        >
                            <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                {isPlaying && youtubeId ? (
                                    <>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                        <button
                                            onClick={() => setPlayingVideoId(null)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={thumbnail}
                                            alt={lesson.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Play button on hover */}
                                        <div
                                            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => youtubeId && setPlayingVideoId(lesson.id)}
                                        >
                                            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                <Play size={24} className="text-slate-900 ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                        {/* Duration badge */}
                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded">
                                            {lesson.duration || '0:00'}
                                        </div>
                                    </>
                                )}
                            </div>
                            <Link href={`/reskill/lesson/${lesson.id}`} className="block p-5 hover:bg-slate-50 transition-colors">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{module?.title}</span>
                                <h3 className="text-lg font-black text-slate-800 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {lesson.title}
                                </h3>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
export default function ReskillDashboardPage() {
    // State
    const [tracks, setTracks] = useState<any[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<string>('');
    const [courses, setCourses] = useState<any[]>([]); // Courses for the selected track
    const [allModules, setAllModules] = useState<any[]>([]); // All public modules for "すべてのコース"
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Get from Store
    const { activeRole, userAnalysis, completedLessonIds, lastViewedLessonIds, currentUserId } = useAppStore();

    // Fetch Initial Data (Tracks & All Modules) - runs on mount and on retry
    React.useEffect(() => {
        let isActive = true;

        setIsLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                // Parallel fetch
                const [fetchedTracks, fetchedModules] = await Promise.all([
                    ElearningService.getTracks(),
                    fetch('/api/elearning/modules').then(res => res.ok ? res.json() : [])
                ]);

                if (!isActive) return;

                // Process Tracks
                const uiTracks = fetchedTracks.map((t: any) => ({
                    ...t,
                    image: t.image || '/illustrations/dx_roadmap.png',
                    courseIds: []
                }));

                setTracks(uiTracks);

                // Process Modules
                const publicModules = Array.isArray(fetchedModules) ? fetchedModules.filter((m: any) => m.is_public !== false) : [];
                setAllModules(publicModules);

                if (uiTracks.length > 0) {
                    setSelectedTrackId(uiTracks[0].id);
                } else {
                    setError('No tracks found in database.');
                    setIsLoading(false);
                }
            } catch (e: any) {
                if (!isActive) return;

                console.error("Failed to load dashboard data:", e?.message || e);
                setError(e.message || 'Failed to load data');
                setIsLoading(false);
            }
        };

        fetchData();

        return () => { isActive = false; };
    }, [retryCount]);

    // Fetch Courses when Track Changes
    React.useEffect(() => {
        if (!selectedTrackId) return;

        let isActive = true;

        const loadCourses = async () => {
            setIsLoading(true);

            try {
                const trackCourses = await ElearningService.getCoursesForTrack(selectedTrackId);

                if (!isActive) return;

                setCourses(trackCourses);
            } catch (e: any) {
                if (!isActive) return;

                const isAbortError = e?.name === 'AbortError' ||
                    (e?.message && e.message.includes('aborted'));

                if (!isAbortError) {
                    console.error("Failed to load courses for track", e);
                    setCourses([]);
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadCourses();

        return () => { isActive = false; };
    }, [selectedTrackId]);


    // Retry function for the debug panel
    const handleRetry = () => {
        setTracks([]);
        setCourses([]);
        setSelectedTrackId('');
        setRetryCount(c => c + 1);
    };

    // --- Personalization (Dynamic Sorting) ---

    const sortedTracks = React.useMemo(() => {
        if (!tracks.length) return [];
        if (!userAnalysis?.diagnosisScores || Object.keys(userAnalysis.diagnosisScores).length === 0) return tracks;

        // 1. Determine User's Top Category
        const categories = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        Object.entries(userAnalysis.diagnosisScores).forEach(([qId, score]) => {
            const id = Number(qId);
            if (id <= 10) categories.A += score;
            else if (id <= 20) categories.B += score;
            else if (id <= 30) categories.C += score;
            else if (id <= 40) categories.D += score;
            else categories.E += score;
        });

        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCats[0][0]; // 'A', 'B', 'C', 'D', or 'E'

        // 2. Sort Tracks based on affinity
        // A(Idea)/B(Active) -> Suggest DX (Planning/Leadership)
        // C(Steady)/E(Stoic) -> Suggest Web Engineer (Structure/Technical)
        const getScore = (track: any) => {
            const t = (track.title || '').toLowerCase();
            let score = 0;
            // Base score is 0. Matches add points.
            if (topCategory === 'A' || topCategory === 'B') {
                if (t.includes('dx') || t.includes('企画') || t.includes('デザイン')) score += 10;
            }
            if (topCategory === 'C' || topCategory === 'E') {
                if (t.includes('web') || t.includes('エンジニア') || t.includes('開発')) score += 10;
            }
            // If Category D (Empathy) -> maybe preference? For now neutral.
            return score;
        };

        return [...tracks].sort((a, b) => getScore(b) - getScore(a));

    }, [tracks, userAnalysis]);

    // Update selectedTrackId if it's empty and we have tracks
    React.useEffect(() => {
        if (!selectedTrackId && sortedTracks.length > 0) {
            setSelectedTrackId(sortedTracks[0].id);
        }
    }, [sortedTracks, selectedTrackId]);



    // Calculate aggregated stats from the currently loaded course list
    // Note: To get global stats "overallProgress", we might need a separate API or fetch all. 
    // For now, let's calc stats based on the *active track* or leave 0 if not loaded.
    const allLessons = courses.flatMap((c: any) => c.lessons || []);
    const totalLessonsCount = allLessons.length;

    const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
    const overallProgress = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

    // Get recently viewed lessons info (from current track context)
    const recentlyViewedLessons = lastViewedLessonIds.map(id =>
        allLessons.find(l => l.id === id)
    ).filter(Boolean);

    const activeTrackRaw = sortedTracks.find(t => t.id === selectedTrackId);

    // Check if we need to hydrate courseIds
    // If courses are loaded and match this track, we use their IDs.
    // Since 'courses' state is always updated for the 'selectedTrackId', we can trust it matches the active track.
    const activeTrack = activeTrackRaw ? {
        ...activeTrackRaw,
        courseIds: courses.map((c: any) => c.id)
    } : undefined;

    // --- Derived State for Active Module (Course) ---
    const lastLesson = recentlyViewedLessons[0];

    const activeModule = lastLesson
        ? courses.find((c: any) => c.lessons && c.lessons.some((l: any) => l.id === lastLesson.id))
        : courses[0];

    const activeModuleLessons = activeModule?.lessons || [];
    const activeModuleCompletedCount = activeModuleLessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
    const activeCourseProgress = activeModuleLessons.length > 0
        ? Math.round((activeModuleCompletedCount / activeModuleLessons.length) * 100)
        : 0;

    // Aliases for JSX compatibility
    const activeCourse = activeModule;

    if (error && tracks.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 max-w-sm w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">データの読み込みに失敗しました</h2>
                    <p className="text-sm text-slate-500 font-bold">ネットワーク接続を確認して再試行してください。</p>
                    <button
                        onClick={handleRetry}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw size={16} /> 再試行する
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 w-full min-w-0 overflow-x-hidden">
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Next Lesson CTA — shown only when user has a last viewed lesson */}
                {!isLoading && lastLesson && (
                    <section>
                        <Link
                            href={`/reskill/lesson/${lastLesson.id}`}
                            className="flex items-center justify-between gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="shrink-0 w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-400 transition-colors">
                                    <PlayCircle size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">前回の続きから</p>
                                    <p className="font-black truncate">{lastLesson.title}</p>
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-2 text-blue-400 font-black text-sm">
                                続きから学習する <ArrowRight size={16} />
                            </div>
                        </Link>
                    </section>
                )}

                {/* Stats Overview */}
                {isLoading ? (
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-8 w-28 rounded-full" />
                            </div>
                        ))}
                    </section>
                ) : (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Overall Progress */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group flex flex-col justify-between hover:shadow-xl transition-shadow">
                        <div className="absolute right-[-10%] top-[-10%] text-blue-50 opacity-50 group-hover:scale-110 transition-transform">
                            <Award size={140} />
                        </div>
                        <div className="relative z-10">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">全体の進捗</span>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-5xl font-black text-slate-900">{overallProgress}%</span>
                                <span className="text-slate-400 font-bold mb-1">達成</span>
                            </div>
                            <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${overallProgress}%` }}
                                />
                            </div>
                        </div>
                        <div className="relative z-10 mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 self-start px-3 py-1.5 rounded-full">
                            <TrendingUp size={14} />
                            学習を続けよう！
                        </div>
                    </div>

                    {/* Middle: Currently Learning */}
                    <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group text-white hover:shadow-2xl hover:shadow-blue-900/20 transition-all">
                        <div className="absolute right-[-10%] top-[-10%] text-white/5 group-hover:scale-110 transition-transform">
                            <Zap size={140} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-black text-white/50 uppercase tracking-widest">
                                    {activeCourseProgress > 0 ? '受講中のコース' : '新しく始める'}
                                </span>
                                <h3 className="text-xl md:text-2xl font-black mt-2 leading-tight line-clamp-2">
                                    {activeCourse?.title || "未経験から学ぶエンジニアの道"}
                                </h3>
                                {activeCourseProgress > 0 && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${activeCourseProgress}%` }} />
                                        </div>
                                        <span className="text-[10px] font-black text-blue-400">{activeCourseProgress}%</span>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={lastLesson ? `/reskill/lesson/${lastLesson.id}` : `/reskill/course/${activeCourse?.id}`}
                                className="mt-6 bg-blue-500 hover:bg-blue-400 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                {activeCourseProgress > 0 ? '学習を再開する' : 'コースを見る'} <PlayCircle size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Completed Steps */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
                        <div className="absolute right-[-5%] bottom-[-10%] text-slate-50 opacity-80 pointer-events-none">
                            <CheckCircle2 size={100} />
                        </div>
                        <div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">完了したステップ</span>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="text-5xl font-black text-slate-900">{completedCount}</div>
                                <div className="text-slate-400 font-bold leading-tight">
                                    lessons<br />completed
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 self-start px-3 py-1.5 rounded-full mt-4 z-10">
                            <TrendingUp size={14} />
                            継続は力なり！
                        </div>
                    </div>
                </section>
                )}

                {/* My Learning Section */}
                {recentlyViewedLessons.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <BookOpen className="text-blue-500" />
                                マイ学習リスト
                            </h2>
                        </div>

                        <div className="space-y-8">
                            {/* Recently Viewed */}
                            {recentlyViewedLessons.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-black text-slate-500 mb-3 flex items-center gap-2 mt-6">
                                        <MonitorPlay size={14} /> 受講中のコース・レッスン
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recentlyViewedLessons.map((lesson: any) => {
                                            // Code from RecentlyViewedSection inlined or reused
                                            const module = courses.find((c: any) => c.lessons && c.lessons.some((l: any) => l.id === lesson.id));
                                            const youtubeId = getYoutubeId(lesson.url);
                                            const thumbnail = youtubeId
                                                ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                                                : module?.thumbnail_url || activeTrack?.image || '/illustrations/dx_roadmap.png';

                                            return (
                                                <div
                                                    key={lesson.id}
                                                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col"
                                                >
                                                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                                        <img
                                                            src={thumbnail}
                                                            alt={lesson.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                        <Link href={`/reskill/lesson/${lesson.id}`} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                                                <Play size={20} className="text-slate-900 ml-1" fill="currentColor" />
                                                            </div>
                                                        </Link>
                                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded">
                                                            {lesson.duration || '0:00'}
                                                        </div>
                                                    </div>
                                                    <Link href={`/reskill/lesson/${lesson.id}`} className="p-4 flex-1 flex flex-col px-4 pb-4 pt-3">
                                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest line-clamp-1 mb-1">{module?.title}</span>
                                                        <h4 className="text-sm font-black text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                            {lesson.title}
                                                        </h4>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Main Track Roadmap (Top Level Curriculum) */}

                {/* Curriculum Selection Tabs */}
                <section>
                    <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 pl-4 hide-scrollbar">
                        {sortedTracks.map((track: any) => {
                            const isSelected = track.id === selectedTrackId;
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => setSelectedTrackId(track.id)}
                                    className={`
                                        flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all
                                        ${isSelected
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}
                                    `}
                                >
                                    <Layers size={16} className={isSelected ? 'text-blue-400' : 'text-slate-300'} />
                                    {track.title}
                                </button>
                            )
                        })}
                    </div>

                    {activeTrack && courses.length > 0 ? (
                        <section className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white/50 shadow-xl overflow-hidden relative">
                            <div className="py-8">
                                <TrackRoadmapView
                                    track={activeTrack}
                                    courses={courses} // Pass all modules
                                    completedLessonIds={completedLessonIds}
                                    onCourseSelect={(courseId) => window.location.href = `/reskill/course/${courseId}`}
                                />
                            </div>
                        </section>
                    ) : (
                        <div className="py-12 text-center bg-white rounded-[3rem] border border-slate-200 border-dashed">
                            <p className="text-slate-400 font-bold">このカリキュラムにはまだコースが登録されていません。</p>
                        </div>
                    )}
                </section>



                {/* Recommended Courses */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Star className="text-amber-500" fill="currentColor" />
                            すべてのコース
                        </h2>
                        <Link href="/reskill/courses" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                            すべて見る <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {allModules.map((course) => {
                            // Determine recommendation tag
                            const courseCategory = (course.title || '').toLowerCase();
                            const isDiagnosisRecommended = (() => {
                                if (!userAnalysis?.diagnosisScores || Object.keys(userAnalysis.diagnosisScores).length === 0) return false;

                                // Re-calc top category (simplified for render)
                                const categories = { A: 0, B: 0, C: 0, D: 0, E: 0 };
                                Object.entries(userAnalysis.diagnosisScores).forEach(([qId, score]) => {
                                    const id = Number(qId);
                                    if (id <= 10) categories.A += score;
                                    else if (id <= 20) categories.B += score;
                                    else if (id <= 30) categories.C += score;
                                    else if (id <= 40) categories.D += score;
                                    else categories.E += score;
                                });
                                const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
                                const topCategory = sortedCats[0][0];

                                if (topCategory === 'A' || topCategory === 'B') {
                                    if (courseCategory.includes('dx') || courseCategory.includes('企画') || courseCategory.includes('デザイン')) return true;
                                }
                                if (topCategory === 'C' || topCategory === 'E') {
                                    if (courseCategory.includes('web') || courseCategory.includes('エンジニア') || courseCategory.includes('開発')) return true;
                                }
                                return false;
                            })();

                            const isPopular = (course.viewCount || 0) >= 10;
                            const isAdminRecommended = course.tags && (course.tags.includes('Recommended') || course.tags.includes('recommended'));

                            return (
                                <Link
                                    key={course.id}
                                    href={`/reskill/course/${course.id}`}
                                    className="group flex flex-row bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all h-full relative"
                                >
                                    <div className="w-1/3 md:w-2/5 relative shrink-0">
                                        <img src={getCourseImage(course)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={course.title} />
                                        <div className="absolute top-2 left-2 md:top-4 md:left-4">
                                            <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black text-slate-800 shadow-sm border border-slate-100">
                                                {course.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 flex flex-col gap-1 md:gap-2 items-end">
                                            {isDiagnosisRecommended && (
                                                <span className="bg-amber-400 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1">
                                                    <Sparkles size={12} fill="currentColor" /> あなたにおすすめ
                                                </span>
                                            )}
                                            {isPopular && (
                                                <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-rose-400 flex items-center gap-1">
                                                    <Flame size={12} fill="currentColor" /> 人気
                                                </span>
                                            )}
                                            {isAdminRecommended && (
                                                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-blue-500 flex items-center gap-1">
                                                    <Award size={12} fill="currentColor" /> リスキル大学推奨
                                                </span>
                                            )}
                                            {/* Progress Badge Merged Here */}
                                            {(() => {
                                                const lessons = course.lessons || course.curriculums?.flatMap((c: any) => c.lessons) || [];
                                                const completed = lessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
                                                if (completed > 0) {
                                                    return (
                                                        <div className="flex flex-col items-end mt-1">
                                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-lg">
                                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                                <span className="text-[10px] font-black">{completed}/{lessons.length} 完了</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                    <div className="flex-1 p-3 md:p-8 flex flex-col justify-between relative min-w-0">

                                        <div>
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${course.level === '初級' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                    }`}>
                                                    {course.level}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {course.totalDuration || '0分'}
                                                </span>
                                            </div>
                                            {/* Title Area */}
                                            <h3 className="text-sm md:text-2xl font-black text-slate-800 leading-tight mb-1.5 md:mb-3 group-hover:text-blue-600 transition-colors break-words line-clamp-2 md:line-clamp-none">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-2 mb-6">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                            <div className="flex items-center gap-3">
                                                {course.instructor ? (
                                                    <>
                                                        <img src={course.instructor.image} className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover" alt={course.instructor.name} />
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 leading-none">{course.instructor.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{course.instructor.role}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-slate-100 flex items-center justify-center overflow-hidden">
                                                            <img src="/eis_logo_mark.png" className="w-8 h-8 object-contain" alt="EIS" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 leading-none">Ehime Base</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Official Course</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </main>

        </div>
    );
}
