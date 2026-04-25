'use client';

import React, { useState } from 'react';
import { X, Sparkles, FileText, AtSign, ListTodo, Loader2 } from 'lucide-react';

interface Task {
  title: string;
  assignee: string | null;
  priority: 'high' | 'medium' | 'low';
}

interface ChannelAssistantProps {
  channelId: string;
  channelName: string;
  userName?: string;
  onClose: () => void;
  onAddTasks?: (tasks: Task[]) => void;
}

export default function ChannelAssistant({
  channelId,
  channelName,
  userName,
  onClose,
  onAddTasks,
}: ChannelAssistantProps) {
  const [result, setResult] = useState<string | null>(null);
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    setActiveAction(action);
    setResult(null);
    setExtractedTasks([]);
    setError(null);

    try {
      const res = await fetch('/api/communication/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          channel_id: channelId,
          user_name: userName,
        }),
      });

      if (!res.ok) throw new Error('Failed to get AI response');
      const data = await res.json();

      if (action === 'todo_extract') {
        try {
          // Extract JSON from response (may be wrapped in markdown code block)
          const jsonStr = data.data.result.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          const tasks = JSON.parse(jsonStr) as Task[];
          setExtractedTasks(tasks);
        } catch {
          setResult(data.data.result);
        }
      } else {
        setResult(data.data.result);
      }
    } catch (e: any) {
      setError(e.message ?? 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const priorityLabels = { high: '高', medium: '中', low: '低' };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          <span className="font-semibold text-white text-sm">AIアシスタント</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Channel info */}
      <div className="px-4 py-2 border-b border-slate-700/50">
        <span className="text-xs text-slate-400">#{channelName}</span>
      </div>

      {/* Action buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => handleAction('summary')}
          disabled={isLoading}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
            activeAction === 'summary' && isLoading
              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
              : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600'
          } disabled:opacity-60`}
        >
          <FileText size={18} className="shrink-0" />
          <div className="text-left">
            <div className="font-medium">直近の要約</div>
            <div className="text-xs text-slate-400 mt-0.5">最近の会話内容をまとめます</div>
          </div>
          {isLoading && activeAction === 'summary' && <Loader2 size={16} className="ml-auto animate-spin" />}
        </button>

        <button
          onClick={() => handleAction('mention_summary')}
          disabled={isLoading}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
            activeAction === 'mention_summary' && isLoading
              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
              : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600'
          } disabled:opacity-60`}
        >
          <AtSign size={18} className="shrink-0" />
          <div className="text-left">
            <div className="font-medium">メンション要約</div>
            <div className="text-xs text-slate-400 mt-0.5">自分宛てのメンションを整理</div>
          </div>
          {isLoading && activeAction === 'mention_summary' && <Loader2 size={16} className="ml-auto animate-spin" />}
        </button>

        <button
          onClick={() => handleAction('todo_extract')}
          disabled={isLoading}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
            activeAction === 'todo_extract' && isLoading
              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
              : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600'
          } disabled:opacity-60`}
        >
          <ListTodo size={18} className="shrink-0" />
          <div className="text-left">
            <div className="font-medium">Todoの整理</div>
            <div className="text-xs text-slate-400 mt-0.5">会話からタスクを抽出</div>
          </div>
          {isLoading && activeAction === 'todo_extract' && <Loader2 size={16} className="ml-auto animate-spin" />}
        </button>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-purple-400" />
              <span className="text-xs text-slate-400">AIが分析中...</span>
            </div>
          </div>
        )}

        {/* Text result (summary / mention summary) */}
        {result && !isLoading && (
          <div className="rounded-lg bg-slate-900/50 border border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                {activeAction === 'summary' ? '要約' : activeAction === 'mention_summary' ? 'メンション要約' : '結果'}
              </span>
            </div>
            <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        )}

        {/* Extracted tasks */}
        {extractedTasks.length > 0 && !isLoading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ListTodo size={14} className="text-purple-400" />
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
                抽出されたタスク ({extractedTasks.length}件)
              </span>
            </div>
            {extractedTasks.map((task, i) => (
              <div key={i} className="rounded-lg bg-slate-900/50 border border-slate-700 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-slate-200 font-medium">{task.title}</span>
                  <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
                {task.assignee && (
                  <span className="text-xs text-slate-400 mt-1 block">担当: {task.assignee}</span>
                )}
              </div>
            ))}
            {onAddTasks && (
              <button
                onClick={() => onAddTasks(extractedTasks)}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
              >
                すべてタスクに追加
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
