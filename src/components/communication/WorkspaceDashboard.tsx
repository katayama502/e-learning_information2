'use client';

import React, { useState, useEffect } from 'react';
import {
  Hash, Users, ListTodo, Calendar, AlertTriangle,
  ChevronRight, Clock, CheckCircle2, Circle, Eye,
  Bell, Megaphone, ArrowRight, Loader2, Layout,
} from 'lucide-react';

interface WorkspaceDashboardProps {
  workspace: any;
  workspaceId: string;
  members: any[];
  channels: any[];
  onNavigateToChannel: (channelId: string) => void;
  onShowMyTasks: () => void;
}

export default function WorkspaceDashboard({
  workspace,
  workspaceId,
  members,
  channels,
  onNavigateToChannel,
  onShowMyTasks,
}: WorkspaceDashboardProps) {
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any>({});
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksRes, announcementsRes] = await Promise.all([
          fetch(`/api/communication/my-tasks?workspace_id=${workspaceId}`),
          fetch('/api/announcements?limit=3'),
        ]);

        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setMyTasks(data.data.tasks ?? []);
          setTaskStats(data.data.stats ?? {});
        }
        if (announcementsRes.ok) {
          const data = await announcementsRes.json();
          setAnnouncements(data.data ?? []);
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [workspaceId]);

  const activeTasks = myTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
  const overdueTasks = myTasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false;
    return new Date(t.due_date) < new Date();
  });
  const upcomingTasks = activeTasks
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-600">
        <div className="flex items-center gap-3">
          {workspace?.icon_url ? (
            <img src={workspace.icon_url} className="w-10 h-10 rounded-xl" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {workspace?.name?.[0] ?? 'W'}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-white">{workspace?.name ?? 'ワークスペース'}</h1>
            <p className="text-xs text-slate-400">{members.length}人のメンバー · {channels.length}チャンネル</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Task stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '未着手', value: taskStats.todo ?? 0, color: 'bg-slate-600/50', textColor: 'text-slate-300', icon: Circle },
            { label: '進行中', value: taskStats.in_progress ?? 0, color: 'bg-yellow-500/10', textColor: 'text-yellow-400', icon: Clock },
            { label: 'レビュー', value: taskStats.review ?? 0, color: 'bg-blue-500/10', textColor: 'text-blue-400', icon: Eye },
            { label: '期限超過', value: overdueTasks.length, color: 'bg-red-500/10', textColor: 'text-red-400', icon: AlertTriangle },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-3 border border-slate-700/50`}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon size={14} className={stat.textColor} />
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Overdue tasks alert */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">期限超過のタスク</span>
            </div>
            <div className="space-y-1.5">
              {overdueTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  onClick={() => task.channel_id && onNavigateToChannel(task.channel_id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <span className="text-sm text-slate-200 flex-1 truncate">{task.title}</span>
                  <span className="text-[10px] text-red-400">
                    {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </span>
                  {task.channel_name && <span className="text-[10px] text-slate-500">#{task.channel_name}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase">直近のタスク</span>
            </div>
            <button onClick={onShowMyTasks} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
              すべて見る <ArrowRight size={10} />
            </button>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">期限が設定されたタスクはありません</p>
          ) : (
            <div className="space-y-1.5">
              {upcomingTasks.map(task => {
                const isOverdue = new Date(task.due_date) < new Date();
                return (
                  <div
                    key={task.id}
                    onClick={() => task.channel_id && onNavigateToChannel(task.channel_id)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 size={14} className={task.status === 'done' ? 'text-green-500' : 'text-slate-500'} />
                    <span className="text-sm text-slate-200 flex-1 truncate">{task.title}</span>
                    {task.channel_name && <span className="text-[10px] text-slate-500">#{task.channel_name}</span>}
                    <span className={`text-[10px] ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                      {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* お知らせ */}
        {announcements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase">お知らせ</span>
            </div>
            <div className="space-y-1.5">
              {announcements.map(a => (
                <a
                  key={a.id}
                  href={`/announcements/${a.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    a.is_read ? 'bg-slate-800/30 hover:bg-slate-700/30' : 'bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20'
                  }`}
                >
                  <Megaphone size={14} className={a.is_read ? 'text-slate-500' : 'text-blue-400'} />
                  <span className={`text-sm flex-1 truncate ${a.is_read ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                    {a.title}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(a.published_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 参加チャンネル一覧 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hash size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase">参加チャンネル</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => onNavigateToChannel(ch.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-left"
              >
                {ch.type === 'announcement' ? (
                  <Megaphone size={14} className="text-yellow-500 shrink-0" />
                ) : (
                  <Hash size={14} className="text-slate-500 shrink-0" />
                )}
                <span className="text-sm text-slate-300 truncate">{ch.name}</span>
                <ChevronRight size={14} className="text-slate-600 ml-auto shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* メンバー */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase">メンバー ({members.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 20).map(m => (
              <div key={m.user_id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800/50 border border-slate-700/50" title={m.profile?.full_name}>
                {m.profile?.avatar_url ? (
                  <img src={m.profile.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[8px] text-white">
                    {(m.profile?.full_name ?? '?')[0]}
                  </div>
                )}
                <span className="text-[11px] text-slate-300">{m.profile?.full_name ?? '不明'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
