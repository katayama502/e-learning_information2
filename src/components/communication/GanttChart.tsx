'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  start_date?: string;
  due_date?: string;
  status: string;
  priority: string;
  assignee?: { full_name: string; avatar_url?: string } | null;
  completed_at?: string;
}

interface GanttChartProps {
  channelId: string;
  workspaceId: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#6366f1',
  in_progress: '#f59e0b',
  review: '#3b82f6',
  done: '#10b981',
  cancelled: '#6b7280',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#22c55e',
};

export default function GanttChart({ channelId, workspaceId }: GanttChartProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay()); // Start from this week's Sunday
    return d;
  });

  const DAYS_TO_SHOW = 28; // 4 weeks

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/communication/tasks?channel_id=${channelId}&workspace_id=${workspaceId}`);
        if (res.ok) {
          const data = await res.json();
          setTasks((data.data.tasks ?? []).filter((t: Task) => t.start_date || t.due_date));
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchTasks();
  }, [channelId, workspaceId]);

  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      result.push(d);
    }
    return result;
  }, [startDate]);

  const weeks = useMemo(() => {
    const result: { start: Date; days: Date[] }[] = [];
    let current: Date[] = [];
    for (const d of days) {
      if (d.getDay() === 0 && current.length > 0) {
        result.push({ start: current[0], days: [...current] });
        current = [];
      }
      current.push(d);
    }
    if (current.length > 0) {
      result.push({ start: current[0], days: current });
    }
    return result;
  }, [days]);

  const navigate = (direction: number) => {
    setStartDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction * 7);
      return d;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Drag state for bar move & resize
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    taskId: string;
    mode: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    origStart: string;
    origEnd: string;
  } | null>(null);

  const pxToDay = useCallback((px: number) => {
    if (!chartAreaRef.current) return 0;
    const chartWidth = chartAreaRef.current.getBoundingClientRect().width - 192; // minus task name col
    const dayPx = chartWidth / DAYS_TO_SHOW;
    return Math.round(px / dayPx);
  }, [DAYS_TO_SHOW]);

  const addDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleBarMouseDown = (e: React.MouseEvent, task: Task, mode: 'move' | 'resize-left' | 'resize-right') => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({
      taskId: task.id,
      mode,
      startX: e.clientX,
      origStart: task.start_date || task.due_date || '',
      origEnd: task.due_date || task.start_date || '',
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaPx = e.clientX - dragState.startX;
      const deltaDays = pxToDay(deltaPx);
      if (deltaDays === 0) return;

      setTasks(prev => prev.map(t => {
        if (t.id !== dragState.taskId) return t;
        if (dragState.mode === 'move') {
          return {
            ...t,
            start_date: addDays(dragState.origStart, deltaDays),
            due_date: addDays(dragState.origEnd, deltaDays),
          };
        }
        if (dragState.mode === 'resize-left') {
          const newStart = addDays(dragState.origStart, deltaDays);
          if (newStart <= (t.due_date || newStart)) {
            return { ...t, start_date: newStart };
          }
        }
        if (dragState.mode === 'resize-right') {
          const newEnd = addDays(dragState.origEnd, deltaDays);
          if (newEnd >= (t.start_date || newEnd)) {
            return { ...t, due_date: newEnd };
          }
        }
        return t;
      }));
    };

    const handleMouseUp = async () => {
      if (!dragState) return;
      const task = tasks.find(t => t.id === dragState.taskId);
      if (task) {
        // Save to server
        try {
          await fetch(`/api/communication/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start_date: task.start_date,
              due_date: task.due_date,
            }),
          });
        } catch (e) { console.error(e); }
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, pxToDay, tasks]);

  const getBarPosition = (task: Task) => {
    const taskStart = task.start_date ? new Date(task.start_date) : (task.due_date ? new Date(task.due_date) : null);
    const taskEnd = task.due_date ? new Date(task.due_date) : (task.start_date ? new Date(task.start_date) : null);
    if (!taskStart || !taskEnd) return null;

    const chartStart = new Date(startDate);
    chartStart.setHours(0, 0, 0, 0);
    const chartEnd = new Date(startDate);
    chartEnd.setDate(chartEnd.getDate() + DAYS_TO_SHOW);

    // Check if task is visible
    if (taskEnd < chartStart || taskStart > chartEnd) return null;

    const dayWidth = 100 / DAYS_TO_SHOW; // percentage
    const startDiff = Math.max(0, (taskStart.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24));
    const endDiff = Math.min(DAYS_TO_SHOW, (taskEnd.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24) + 1);
    const duration = Math.max(1, endDiff - startDiff);

    return {
      left: `${startDiff * dayWidth}%`,
      width: `${duration * dayWidth}%`,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-slate-500" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Calendar size={32} className="text-slate-600" />
        <p className="text-sm text-slate-500">日付が設定されたタスクがありません</p>
        <p className="text-xs text-slate-600">タスクに開始日・期限を設定するとガントチャートに表示されます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-300">ガントチャート</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - d.getDay());
              setStartDate(d);
            }}
            className="px-2 py-0.5 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-700"
          >
            今週
          </button>
          <button onClick={() => navigate(1)} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 overflow-auto" ref={chartAreaRef}>
        <div className="min-w-[800px]">
          {/* Week headers */}
          <div className="flex border-b border-slate-700/50">
            <div className="w-48 shrink-0 px-3 py-1.5 text-[10px] text-slate-500 font-bold border-r border-slate-700/50">
              タスク名
            </div>
            <div className="flex-1 flex">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex-1 text-center text-[10px] text-slate-500 py-1 border-r border-slate-700/30 last:border-r-0">
                  {week.start.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}〜
                </div>
              ))}
            </div>
          </div>

          {/* Day headers */}
          <div className="flex border-b border-slate-700/50">
            <div className="w-48 shrink-0 border-r border-slate-700/50" />
            <div className="flex-1 flex">
              {days.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`flex-1 text-center text-[9px] py-1 border-r border-slate-800/30 last:border-r-0 ${
                      isToday ? 'bg-blue-500/10 text-blue-400 font-bold' : isWeekend ? 'bg-slate-800/30 text-slate-600' : 'text-slate-500'
                    }`}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task rows */}
          {tasks.map(task => {
            const bar = getBarPosition(task);
            return (
              <div key={task.id} className="flex border-b border-slate-800/30 hover:bg-slate-800/20 group">
                {/* Task name */}
                <div className="w-48 shrink-0 px-3 py-2 border-r border-slate-700/50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? '#6366f1' }} />
                  <span className="text-xs text-slate-300 truncate" title={task.title}>{task.title}</span>
                  {task.assignee && (
                    <div className="shrink-0 ml-auto" title={task.assignee.full_name}>
                      {task.assignee.avatar_url ? (
                        <img src={task.assignee.avatar_url} className="w-4 h-4 rounded-full" alt="" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-600 text-[7px] text-white flex items-center justify-center">
                          {task.assignee.full_name[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bar area */}
                <div className="flex-1 relative py-1.5">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {days.map((d, i) => {
                      const isToday = d.toDateString() === today.toDateString();
                      return (
                        <div
                          key={i}
                          className={`flex-1 border-r border-slate-800/20 ${isToday ? 'bg-blue-500/5' : ''}`}
                        />
                      );
                    })}
                  </div>
                  {/* Task bar */}
                  {bar && (
                    <div
                      className={`absolute top-1.5 h-5 rounded-md group/bar ${dragState?.taskId === task.id ? '' : 'transition-all'}`}
                      style={{
                        left: bar.left,
                        width: bar.width,
                        backgroundColor: STATUS_COLORS[task.status] ?? '#6366f1',
                        opacity: task.status === 'done' ? 0.5 : 0.8,
                        cursor: dragState ? 'grabbing' : 'grab',
                      }}
                      title={`${task.title} (${task.start_date ?? '?'} → ${task.due_date ?? '?'})`}
                      onMouseDown={(e) => handleBarMouseDown(e, task, 'move')}
                    >
                      {/* Left resize handle */}
                      <div
                        className="absolute left-0 top-0 w-2 h-full cursor-w-resize opacity-0 group-hover/bar:opacity-100 bg-white/30 rounded-l-md"
                        onMouseDown={(e) => handleBarMouseDown(e, task, 'resize-left')}
                      />
                      <span className="px-2.5 text-[9px] text-white font-medium truncate block leading-5 select-none">
                        {task.title}
                      </span>
                      {/* Right resize handle */}
                      <div
                        className="absolute right-0 top-0 w-2 h-full cursor-e-resize opacity-0 group-hover/bar:opacity-100 bg-white/30 rounded-r-md"
                        onMouseDown={(e) => handleBarMouseDown(e, task, 'resize-right')}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
