'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Calendar, Users, MapPin, ExternalLink, MessageSquare, Star, Loader2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

type Instructor = {
    id: string;
    display_name: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    };
};

type Event = {
    id: string;
    title: string;
    start_at: string;
    event_type: 'webinar' | 'real';
    status: string;
    capacity: number;
    location?: string;
    web_url?: string;
};

interface InstructorEventsModalProps {
    isOpen: boolean;
    onClose: () => void;
    instructor: Instructor | null;
}

export default function InstructorEventsModal({ isOpen, onClose, instructor }: InstructorEventsModalProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (isOpen && instructor) {
            fetchInstructorEvents();
        }
    }, [isOpen, instructor]);

    const fetchInstructorEvents = async () => {
        if (!instructor) return;
        setLoading(true);
        const supabase = createClient();

        try {
            // Fetch events
            const { data: eventsData, error: eventsError } = await supabase
                .from('reskill_events')
                .select('*')
                .eq('instructor_id', instructor.id)
                .order('start_at', { ascending: false });

            if (eventsError) throw eventsError;
            setEvents(eventsData || []);

            // Fetch participant counts for these events
            const counts: Record<string, number> = {};
            if (eventsData && eventsData.length > 0) {
                const eventIds = eventsData.map((e: any) => e.id);
                // We can't easily group by in Supabase client without rpc or raw sql for counts sometimes, 
                // but we can just fetch all applications for these events currently if not too many. 
                // Or better, fetch one by one or utilize a view. For now, let's fetch count for each.
                // Actually, let's just fetch all applications for these events.
                const { data: apps, error: appsError } = await supabase
                    .from('reskill_event_applications')
                    .select('event_id')
                    .in('event_id', eventIds)
                    .eq('status', 'applied'); // Only count actual participants

                if (!appsError && apps) {
                    apps.forEach((app: { event_id: string }) => {
                        counts[app.event_id] = (counts[app.event_id] || 0) + 1;
                    });
                }
            }
            setParticipantCounts(counts);

        } catch (error) {
            console.error('Error fetching instructor events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !instructor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                                src={instructor.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${instructor.profiles.full_name}`}
                                alt={instructor.display_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">{instructor.display_name}の担当イベント</h2>
                            <p className="text-sm text-slate-500 font-bold">過去の登壇履歴と評価（予定）</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 bg-slate-50/50 flex-1">
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">担当したイベントはまだありません。</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${event.event_type === 'webinar' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {event.event_type === 'webinar' ? 'WEBセミナー' : 'リアルセミナー'}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${event.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {event.status === 'published' ? '公開中' : event.status}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(event.start_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-800 mb-4">{event.title}</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1">
                                                <Users size={12} /> 参加者数
                                            </div>
                                            <div className="text-xl font-black text-slate-700">
                                                {participantCounts[event.id] || 0} <span className="text-xs text-slate-400 font-normal">/ {event.capacity}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl">
                                            <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1">
                                                <Star size={12} /> アンケート評価
                                            </div>
                                            <div className="text-base font-bold text-slate-400 mt-1">
                                                ー <span className="text-[10px] font-normal">(集計前)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                        {/* Survey Link Placeholder */}
                                        <button className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-slate-600 cursor-not-allowed" title="機能開発中">
                                            <MessageSquare size={14} /> アンケート結果を見る
                                        </button>
                                        <div className="text-slate-300">|</div>
                                        {/* Link to Event Management */}
                                        <Link
                                            href={`/admin/events`} // Ideally query param if supported later
                                            className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                        >
                                            <ExternalLink size={14} /> イベント詳細・参加者管理へ
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 text-center">
                    <button onClick={onClose} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}
