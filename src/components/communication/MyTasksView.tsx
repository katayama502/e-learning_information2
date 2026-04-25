'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ListTodo, LayoutGrid, Calendar, AlertTriangle, ArrowUp, ArrowDown, Minus,
  Loader2, ChevronRight, Clock, CheckCircle2, Circle, Eye, Filter,
} from 'lucide-react';

interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: string;
  assignee?: { id: string; full_name: string; avatar_url?: string } | null;
  column?: { id: string; name: string; color: string } | null;
  board_name?: string;
  channel_name?: string;
  channel_id?: string;
  due_date?: string;
  start_date?: string;
  completed_at?: string;
  created_at: string;
}

interface Stats {
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  overdue: number;
}

interface MyTasksViewProps {
  workspaceId: string;
  onNavigateToChannel?: (channelId: string) => void;
}

const PRIORITY_CONFIG = {
  urgent: { icon: AlertTriangle, color: 'text-red-500', label: '緊急' },
  high: { icon: ArrowUp, color: 'text-orange-500', label: '高' },
  medium: { icon: Minus, color: 'text-blue-500', label: '中' },
  low: { icon: ArrowDown, color: 'text-green-500', label: '低' },
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  todo: { icon: Circle, color: 'text-slate-400', label: '未着手' },
  in_progress: { icon: Clock, color: 'text-yellow-500', label: '進行中' },
  review: { icon: Eye, color: 'text-blue-500', label: 'レビュー' },
  done: { icon: CheckCircle2, color: 'text-green-500', label: '完了' },
};

type ViewMode = 'list' | 'status' | 'kanban';
type FilterStatus = 'all' | 'active' | 'overdue' | 'done';

export default function MyTasksView({ workspaceId, onNavigateToChannel }: MyTasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, todo: 0, in_progress: 0, review: 0, done: 0, overdue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<FilterStatus>('active');

  const fetchMyTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/communication/my-tasks?workspace_id=${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data.tasks ?? []);
        setStats(data.data.stats ?? {});
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [workspaceId]);

  useEffect(() => { fetchMyTasks(); }, [fetchMyTasks]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return t.status !== 'done' && t.status !== 'cancelled';
    if (filter === 'overdue') {
      const now = new Date(); now.setHours(0, 0, 0, 0);
      return t.due_date && new Date(t.due_date) < now && t.status !== 'done';
    }
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  // Group by status for status view
  const groupedByStatus = ['todo', 'in_progress', 'review', 'done'].map(status => ({
    status,
    config: STATUS_CONFIG[status],
    tasks: filteredTasks.filter(t => t.status === status),
  }));

  const renderContent = () => {
    if (filteredTasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <CheckCircle2 size={32} className="text-slate-600" />
          <p className="text-sm text-slate-500">
            {filter === 'active' ? 'アクティブなタスクはありません 🎉' :
             filter === 'overdue' ? '期限超過のタスクはありません ✨' :
             'タスクがありません'}
          </p>
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="space-y-1.5">
          {filteredTasks.map(task => {
            const prioConfig = PRIORITY_CONFIG[task.priority];
            const statusConf = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
            const StatusIcon = statusConf.icon;
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
            return (
              <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group cursor-pointer" onClick={() => task.channel_id && onNavigateToChannel?.(task.channel_id)}>
                <StatusIcon size={16} className={statusConf.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.channel_name && <span className="text-[10px] text-slate-500">#{task.channel_name}</span>}
                    <span className={`text-[10px] ${prioConfig.color}`}>{prioConfig.label}</span>
                    {task.due_date && (
                      <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                        <Calendar size={9} />
                        {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-600 text-slate-400">{statusConf.label}</span>
                <ChevronRight size={14} className="text-slate-600 opacity-0 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      );
    }

    if (viewMode === 'status') {
      return (
        <div className="space-y-4">
          {groupedByStatus.filter(g => g.tasks.length > 0).map(group => {
            const GroupIcon = group.config.icon;
            return (
              <div key={group.status}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <GroupIcon size={14} className={group.config.color} />
                  <span className="text-xs font-bold text-slate-400">{group.config.label}</span>
                  <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">{group.tasks.length}</span>
                </div>
                <div className="space-y-1">
                  {group.tasks.map(task => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                    return (
                      <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => task.channel_id && onNavigateToChannel?.(task.channel_id)}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.column?.color ?? '#6366f1' }} />
                        <p className="flex-1 text-sm text-slate-300 truncate">{task.title}</p>
                        {task.channel_name && <span className="text-[10px] text-slate-500">#{task.channel_name}</span>}
                        {task.due_date && (
                          <span className={`text-[10px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                            {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (viewMode === 'kanban') {
      return (
        <div className="flex gap-3 overflow-x-auto pb-4 min-w-max">
          {['todo', 'in_progress', 'review', 'done'].map(status => {
            const config = STATUS_CONFIG[status];
            const StatusIcon = config.icon;
            const statusTasks = filteredTasks.filter(t => t.status === status);
            return (
              <div key={status} className="w-56 flex flex-col rounded-xl bg-slate-800/50 min-h-[200px]">
                <div className="flex items-center gap-2 px-3 py-2">
                  <StatusIcon size={14} className={config.color} />
                  <span className="text-xs font-bold text-slate-300">{config.label}</span>
                  <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded-full">{statusTasks.length}</span>
                </div>
                <div className="flex-1 px-2 pb-2 space-y-1.5 overflow-y-auto">
                  {statusTasks.map(task => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
                    return (
                      <div key={task.id} onClick={() => task.channel_id && onNavigateToChannel?.(task.channel_id)} className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/50 hover:border-slate-600 cursor-pointer transition-colors">
                        <p className="text-xs text-slate-200 font-medium leading-snug mb-1.5">{task.title}</p>
                        <div className="flex items-center gap-2">
                          {task.channel_name && <span className="text-[9px] text-slate-500">#{task.channel_name}</span>}
                          {task.due_date && (
                            <span className={`text-[9px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                              {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListTodo size={18} className="text-purple-400" />
            <span className="text-sm font-bold text-white">マイタスク</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="リスト表示"
            >
              <ListTodo size={14} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'kanban' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="カンバン"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-3">
          {[
            { label: '全て', value: stats.total, color: 'text-slate-300' },
            { label: '未着手', value: stats.todo, color: 'text-slate-400' },
            { label: '進行中', value: stats.in_progress, color: 'text-yellow-500' },
            { label: 'レビュー', value: stats.review, color: 'text-blue-500' },
            { label: '完了', value: stats.done, color: 'text-green-500' },
            { label: '期限超過', value: stats.overdue, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1">
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-1">
          {([
            { key: 'active', label: '進行中のタスク' },
            { key: 'overdue', label: '期限超過' },
            { key: 'done', label: '完了済み' },
            { key: 'all', label: 'すべて' },
          ] as { key: FilterStatus; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                filter === f.key ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {renderContent()}
      </div>
    </div>
  );
}
