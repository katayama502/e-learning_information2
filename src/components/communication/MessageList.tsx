'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Reply,
  SmilePlus,
  Pin,
  Pencil,
  Trash2,
  ListTodo,
  ArrowDown,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MessageUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean; // whether current user has reacted
}

export interface MessageReply {
  id: string;
  user_name: string;
  content: string;
}

export interface Message {
  id: string;
  user: MessageUser;
  content: string;
  created_at: string; // ISO
  updated_at?: string;
  is_deleted?: boolean;
  is_pinned?: boolean;
  is_system?: boolean;
  reply_to?: MessageReply | null;
  reactions?: MessageReaction[];
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
}

interface MessageListProps {
  messages: Message[];
  channelType?: 'text' | 'announcement' | 'dm';
  currentUserId?: string;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
  onCreateTask?: (messageId: string, title: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return '今日';
  if (isYesterday) return '昨日';
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Are two timestamps within 5 minutes of each other? */
function withinFiveMinutes(a: string, b: string): boolean {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 5 * 60_000;
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

/** Render text with @mention highlights */
function renderContent(text: string) {
  const parts = text.split(/(@\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="rounded bg-blue-500/20 px-1 text-blue-300 font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MessageList({
  messages,
  currentUserId,
  onLoadMore,
  isLoadingMore,
  hasMore,
  onReply,
  onReact,
  onPin,
  onEdit,
  onDelete,
  onScrollToMessage,
  onCreateTask,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢', '🔥', '👀', '✅', '🙏'];

  // Touch handlers for mobile action menu
  const handleTouchStart = useCallback((msgId: string) => {
    longPressTimer.current = setTimeout(() => {
      setActiveMessageId(prev => prev === msgId ? null : msgId);
    }, 400);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Only auto-scroll if user is near the bottom
    const el = containerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (isNearBottom) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 400);

    // Load more when scrolled to top
    if (el.scrollTop < 50 && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditText(msg.content);
  };

  const submitEdit = (msgId: string) => {
    if (editText.trim() && onEdit) {
      onEdit(msgId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <>
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-slate-600"
    >
      {/* Loading indicator at top */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4 text-slate-400">
          <Loader2 size={18} className="animate-spin mr-2" />
          <span className="text-sm">新しいメッセージを読み込み中...</span>
        </div>
      )}

      {messages.map((msg, idx) => {
        const prev = idx > 0 ? messages[idx - 1] : null;

        // Date separator
        const showDateSep =
          !prev || !isSameDay(prev.created_at, msg.created_at);

        // Compact mode: same user, within 5 min, not system, not first of day
        const isCompact =
          !showDateSep &&
          prev &&
          !msg.is_system &&
          !prev.is_system &&
          prev.user.id === msg.user.id &&
          withinFiveMinutes(prev.created_at, msg.created_at);

        // System messages
        if (msg.is_system) {
          return (
            <React.Fragment key={msg.id}>
              {showDateSep && <DateSeparator date={msg.created_at} />}
              <div className="my-2 flex justify-center">
                <span className="rounded-full bg-slate-700/60 px-4 py-1 text-xs text-slate-400">
                  {msg.content}
                </span>
              </div>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={msg.id}>
            {showDateSep && <DateSeparator date={msg.created_at} />}

            <div
              id={`msg-${msg.id}`}
              className={`group relative flex gap-3 hover:bg-slate-600/20 rounded px-2 ${
                isCompact ? 'py-0.5' : 'mt-4 pt-1 pb-0.5'
              }`}
              onTouchStart={() => handleTouchStart(msg.id)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              {/* Avatar column */}
              <div className="w-10 shrink-0">
                {!isCompact ? (
                  <div className="h-10 w-10 rounded-full bg-slate-600 overflow-hidden">
                    {msg.user.avatar ? (
                      <img
                        src={msg.user.avatar}
                        alt={msg.user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                        {msg.user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Compact: show time on hover */
                  <span className="hidden group-hover:flex h-full items-center justify-end text-[10px] text-slate-500">
                    {formatTime(msg.created_at)}
                  </span>
                )}
              </div>

              {/* Content column */}
              <div className="min-w-0 flex-1">
                {/* Reply reference */}
                {msg.reply_to && (
                  <button
                    onClick={() => onScrollToMessage?.(msg.reply_to!.id)}
                    className="mb-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <Reply size={12} className="rotate-180" />
                    <span className="font-semibold">
                      {msg.reply_to.user_name}
                    </span>
                    <span className="truncate max-w-[300px]">
                      {msg.reply_to.content}
                    </span>
                  </button>
                )}

                {/* Header: username + timestamp (full messages only) */}
                {!isCompact && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white text-[15px] hover:underline cursor-pointer">
                      {msg.user.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTime(msg.created_at)}
                    </span>
                    {msg.is_pinned && (
                      <Pin
                        size={12}
                        className="text-yellow-500"
                        fill="currentColor"
                      />
                    )}
                  </div>
                )}

                {/* Message body */}
                {msg.is_deleted ? (
                  <p className="text-sm italic text-slate-500">
                    このメッセージは削除されました
                  </p>
                ) : editingId === msg.id ? (
                  /* Edit mode */
                  <div className="mt-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          submitEdit(msg.id);
                        }
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-full rounded bg-slate-600 p-2 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                      autoFocus
                    />
                    <div className="mt-1.5 flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs rounded-md bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => submitEdit(msg.id)}
                        className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
                    {renderContent(msg.content)}
                    {msg.updated_at && msg.updated_at !== msg.created_at && (
                      <span className="ml-1 text-[10px] text-slate-500">
                        (編集済み)
                      </span>
                    )}
                  </p>
                )}

                {/* Attachment */}
                {msg.attachment_url && !msg.is_deleted && (
                  <div className="mt-1">
                    {msg.attachment_type?.startsWith('image/') ? (
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.attachment_url}
                          alt={msg.attachment_name || 'attachment'}
                          className="max-w-xs max-h-64 rounded-lg border border-slate-600 object-cover hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ) : (
                      <a
                        href={msg.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-700/50 border border-slate-600 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-700 transition-colors"
                      >
                        <span>📎</span>
                        <span className="truncate max-w-[200px]">{msg.attachment_name || 'ファイル'}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && !msg.is_deleted && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {msg.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => onReact?.(msg.id, r.emoji)}
                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                          r.reacted
                            ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                            : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span>{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action bar (hover on desktop, long-press on mobile) */}
              {!msg.is_deleted && !msg.is_system && (
                <div className={`absolute -top-3 right-2 gap-0.5 rounded bg-slate-800 border border-slate-600 shadow-lg ${activeMessageId === msg.id ? 'flex' : 'hidden group-hover:flex'}`}>
                  <div className="relative">
                    <ActionBtn
                      icon={<SmilePlus size={16} />}
                      title="リアクション"
                      onClick={() => setEmojiPickerFor(emojiPickerFor === msg.id ? null : msg.id)}
                    />
                    {emojiPickerFor === msg.id && (
                      <div className="absolute -top-12 right-0 z-50 flex gap-1 rounded-lg bg-slate-700 border border-slate-600 p-1.5 shadow-xl">
                        {QUICK_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            className="hover:bg-slate-600 rounded p-1 text-lg transition-colors"
                            onClick={() => {
                              onReact?.(msg.id, emoji);
                              setEmojiPickerFor(null);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <ActionBtn
                    icon={<Reply size={16} />}
                    title="返信"
                    onClick={() => onReply?.(msg)}
                  />
                  <ActionBtn
                    icon={<Pin size={16} />}
                    title="ピン留め"
                    onClick={() => onPin?.(msg.id)}
                  />
                  {onCreateTask && (
                    <ActionBtn
                      icon={<ListTodo size={16} />}
                      title="タスクにする"
                      onClick={() => onCreateTask(msg.id, msg.content.substring(0, 100))}
                    />
                  )}
                  {msg.user.id === currentUserId && (
                    <>
                      <ActionBtn
                        icon={<Pencil size={16} />}
                        title="編集"
                        onClick={() => startEdit(msg)}
                      />
                      <ActionBtn
                        icon={<Trash2 size={16} />}
                        title="削除"
                        onClick={() => onDelete?.(msg.id)}
                        danger
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />
    </div>

    {/* Scroll to bottom button - positioned above input */}
    {showScrollBtn && (
      <div className="flex justify-center py-1.5">
        <button
          onClick={scrollToBottom}
          className="flex items-center gap-1 rounded-full bg-slate-800 border border-slate-600 px-4 py-1.5 text-xs text-slate-300 shadow-lg hover:bg-slate-700 transition-colors"
        >
          <ArrowDown size={14} />
          <span>最新へ</span>
        </button>
      </div>
    )}
  </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="my-4 flex items-center gap-2">
      <div className="flex-1 border-t border-slate-600" />
      <span className="text-xs font-semibold text-slate-400">
        {formatDate(date)}
      </span>
      <div className="flex-1 border-t border-slate-600" />
    </div>
  );
}

function ActionBtn({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 transition-colors ${
        danger
          ? 'text-slate-400 hover:text-red-400'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}
