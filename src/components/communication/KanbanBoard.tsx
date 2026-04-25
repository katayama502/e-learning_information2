'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, X, GripVertical, Calendar, User, Tag,
  ChevronDown, MoreHorizontal, Trash2, Edit3, Clock,
  AlertTriangle, ArrowUp, ArrowDown, Minus, Loader2,
  BarChart3,
} from 'lucide-react';

// Types
interface TaskUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: string;
  assignee?: TaskUser | null;
  reporter?: TaskUser | null;
  assignee_id?: string;
  team_id?: string;
  team?: { id: string; name: string; color: string } | null;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  tags: string[];
  sort_order: number;
  source_message_id?: string;
  completed_at?: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
  members?: { user_id: string; profile?: TaskUser }[];
}

interface Column {
  id: string;
  board_id: string;
  name: string;
  color: string;
  sort_order: number;
  wip_limit?: number;
}

interface Board {
  id: string;
  workspace_id: string;
  channel_id?: string;
  name: string;
}

interface KanbanBoardProps {
  channelId: string;
  workspaceId: string;
  members?: { user_id: string; profile?: { full_name: string; avatar_url?: string } }[];
}

const PRIORITY_CONFIG = {
  urgent: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', label: '緊急' },
  high: { icon: ArrowUp, color: 'text-orange-500', bg: 'bg-orange-500/10', label: '高' },
  medium: { icon: Minus, color: 'text-blue-500', bg: 'bg-blue-500/10', label: '中' },
  low: { icon: ArrowDown, color: 'text-green-500', bg: 'bg-green-500/10', label: '低' },
};

export default function KanbanBoard({ channelId, workspaceId, members = [] }: KanbanBoardProps) {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState<string | null>(null); // column_id
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dragTask, setDragTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const fetchTeams = useCallback(async (boardId: string) => {
    try {
      const res = await fetch(`/api/communication/teams?board_id=${boardId}`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data.data ?? []);
      }
    } catch (e) { console.error(e); }
  }, []);

  const createTeam = async () => {
    if (!board || !newTeamName.trim()) return;
    try {
      const res = await fetch('/api/communication/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_id: board.id, name: newTeamName.trim() }),
      });
      if (res.ok) {
        await fetchTeams(board.id);
        setNewTeamName('');
        setShowCreateTeam(false);
      }
    } catch (e) { console.error(e); }
  };

  const fetchBoard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/communication/tasks?channel_id=${channelId}&workspace_id=${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setBoard(data.data.board);
        setColumns(data.data.columns ?? []);
        setTasks(data.data.tasks ?? []);
        if (data.data.board?.id) fetchTeams(data.data.board.id);
      }
    } catch (e) {
      console.error('Failed to fetch board:', e);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, workspaceId]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const createTask = async (columnId: string) => {
    if (!newTaskTitle.trim() || !board) return;
    try {
      const res = await fetch('/api/communication/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: board.id,
          column_id: columnId,
          title: newTaskTitle.trim(),
          source_channel_id: channelId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [...prev, data.data]);
        setNewTaskTitle('');
        setShowCreateTask(null);
      }
    } catch (e) { console.error(e); }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/communication/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? data.data : t));
      }
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/communication/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) { console.error(e); }
  };

  // Drag & Drop
  const handleDragStart = (task: Task) => setDragTask(task);
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };
  const handleDrop = (columnId: string) => {
    if (dragTask && dragTask.column_id !== columnId) {
      updateTask(dragTask.id, { column_id: columnId });
    }
    setDragTask(null);
    setDragOverColumn(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-slate-500" />
      </div>
    );
  }

  const getColumnTasks = (columnId: string) =>
    tasks.filter(t => t.column_id === columnId).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-300">タスクボード</span>
          <span className="text-xs text-slate-500 ml-2">{tasks.length}件</span>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map(col => {
            const colTasks = getColumnTasks(col.id);
            const isDragOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                className={`w-72 flex flex-col rounded-xl transition-colors ${
                  isDragOver ? 'bg-slate-700/50 ring-2 ring-blue-500/30' : 'bg-slate-800/50'
                }`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={() => handleDrop(col.id)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-sm font-bold text-slate-200">{col.name}</span>
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => { setShowCreateTask(col.id); setNewTaskTitle(''); }}
                    className="p-1 text-slate-500 hover:text-white hover:bg-slate-600 rounded transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Tasks */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[100px]">
                  {colTasks.map(task => {
                    const prioConfig = PRIORITY_CONFIG[task.priority];
                    const PrioIcon = prioConfig.icon;
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className={`group bg-slate-900/60 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg ${
                          dragTask?.id === task.id ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Task header */}
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-200 font-medium leading-snug flex-1">
                            {task.title}
                          </p>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1 text-slate-500 hover:text-white rounded"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-500 hover:text-red-400 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer: priority, assignee, due date */}
                        <div className="flex items-center justify-between mt-2.5 gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-0.5 text-[10px] ${prioConfig.color}`}>
                              <PrioIcon size={10} />
                              {prioConfig.label}
                            </span>
                            {task.due_date && (
                              <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                                <Calendar size={10} />
                                {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                            {task.team_id && (() => {
                              const team = teams.find(t => t.id === task.team_id);
                              return team ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-600 text-slate-300" style={{ borderColor: team.color + '50', color: team.color }}>
                                  {team.name}
                                </span>
                              ) : null;
                            })()}
                          </div>
                          {task.assignee && (
                            <div className="flex items-center gap-1" title={task.assignee.full_name}>
                              {task.assignee.avatar_url ? (
                                <img src={task.assignee.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[8px] text-white">
                                  {task.assignee.full_name[0]}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Review actions (only in review column) */}
                        {col.name === 'レビュー' && (
                          <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-700/50">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const comment = prompt('承認コメント（任意）');
                                await fetch(`/api/communication/tasks/${task.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'approve', comment: comment || '' }),
                                });
                                fetchBoard();
                              }}
                              className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-green-600/20 text-green-400 text-[10px] font-bold hover:bg-green-600/30 transition-colors"
                            >
                              ✅ 承認
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const comment = prompt('差し戻し理由');
                                if (!comment) return;
                                await fetch(`/api/communication/tasks/${task.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'reject', comment }),
                                });
                                fetchBoard();
                              }}
                              className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-orange-600/20 text-orange-400 text-[10px] font-bold hover:bg-orange-600/30 transition-colors"
                            >
                              🔄 差し戻し
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Create task inline */}
                  {showCreateTask === col.id && (
                    <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30">
                      <input
                        autoFocus
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            createTask(col.id);
                          }
                          if (e.key === 'Escape') setShowCreateTask(null);
                        }}
                        placeholder="タスク名を入力..."
                        className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setShowCreateTask(null)}
                          className="text-xs text-slate-500 hover:text-white px-2 py-1"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => createTask(col.id)}
                          disabled={!newTaskTitle.trim()}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit task modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setEditingTask(null)}>
          <div className="w-full max-w-lg bg-slate-800 rounded-xl border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white">タスクを編集</h3>
              <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">タイトル</label>
                <input
                  value={editingTask.title}
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">説明</label>
                <textarea
                  value={editingTask.description ?? ''}
                  onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">優先度</label>
                  <select
                    value={editingTask.priority}
                    onChange={e => setEditingTask({ ...editingTask, priority: e.target.value as Task['priority'] })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="urgent">🔴 緊急</option>
                    <option value="high">🟠 高</option>
                    <option value="medium">🔵 中</option>
                    <option value="low">🟢 低</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">担当者</label>
                  <select
                    value={editingTask.assignee_id ?? ''}
                    onChange={e => setEditingTask({ ...editingTask, assignee_id: e.target.value || undefined })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">未割当</option>
                    {members.map(m => (
                      <option key={m.user_id} value={m.user_id}>{m.profile?.full_name ?? m.user_id}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Team selection */}
              <div>
                <label className="text-xs text-slate-400 mb-1 block">チーム</label>
                <div className="flex gap-2">
                  <select
                    value={editingTask.team_id ?? ''}
                    onChange={e => setEditingTask({ ...editingTask, team_id: e.target.value || undefined })}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">チームなし</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(true)}
                    className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition-colors"
                    title="新規チーム作成"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {showCreateTeam && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) createTeam(); }}
                      placeholder="チーム名（例: UIチーム）"
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button onClick={createTeam} disabled={!newTeamName.trim()} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg disabled:opacity-50">作成</button>
                    <button onClick={() => { setShowCreateTeam(false); setNewTeamName(''); }} className="px-2 py-1.5 text-slate-400 text-xs">✕</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">開始日</label>
                  <input
                    type="date"
                    value={editingTask.start_date ?? ''}
                    onChange={e => setEditingTask({ ...editingTask, start_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">期限</label>
                  <input
                    type="date"
                    value={editingTask.due_date ?? ''}
                    onChange={e => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-3 border-t border-slate-700">
              <button onClick={() => setEditingTask(null)} className="text-sm text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-700">キャンセル</button>
              <button
                onClick={async () => {
                  await updateTask(editingTask.id, {
                    title: editingTask.title,
                    description: editingTask.description,
                    priority: editingTask.priority,
                    assignee_id: editingTask.assignee_id,
                    team_id: editingTask.team_id || null,
                    start_date: editingTask.start_date,
                    due_date: editingTask.due_date,
                  } as any);
                  setEditingTask(null);
                }}
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
