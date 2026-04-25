'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Plus, Smile, Send, X, AtSign } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReplyTo {
  id: string;
  user_name: string;
  content: string;
}

export interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
}

interface MessageInputProps {
  channelName: string;
  replyTo?: ReplyTo | null;
  typingUsers?: string[];
  mentionUsers?: MentionUser[];
  onSend: (content: string, attachment?: File | null, replyToId?: string) => void;
  onCancelReply?: () => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MessageInput({
  channelName,
  replyTo,
  typingUsers,
  mentionUsers = [],
  onSend,
  onCancelReply,
  disabled,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  // Auto-resize textarea (1-5 rows)
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = 22; // approx
    const minH = lineHeight; // 1 row
    const maxH = lineHeight * 5; // 5 rows
    ta.style.height = `${Math.min(Math.max(ta.scrollHeight, minH), maxH)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    onSend(trimmed, attachment, replyTo?.id);
    setText('');
    setAttachment(null);
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, attachment, replyTo, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME変換中（日本語入力の確定Enterなど）は無視
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;

    // Mention navigation
    if (showMentions && filteredMentions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(i => (i + 1) % filteredMentions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(i => (i - 1 + filteredMentions.length) % filteredMentions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMentions[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    }

    // Cmd+Enter (Mac) or Ctrl+Enter (Windows) で送信
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
    // 通常のEnterは改行（デフォルト動作のまま）
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachment(file);
  };

  // Mention logic
  const allMentionOptions: MentionUser[] = [
    { id: 'everyone', name: 'everyone' },
    ...mentionUsers,
  ];
  const filteredMentions = allMentionOptions.filter(u =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 8);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    // Check for @ mention trigger
    const cursor = e.target.selectionStart || 0;
    const beforeCursor = val.slice(0, cursor);
    const atMatch = beforeCursor.match(/@(\S*)$/);
    if (atMatch) {
      setShowMentions(true);
      setMentionQuery(atMatch[1]);
      setMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: MentionUser) => {
    const cursor = textareaRef.current?.selectionStart || 0;
    const beforeCursor = text.slice(0, cursor);
    const atPos = beforeCursor.lastIndexOf('@');
    if (atPos === -1) return;

    const before = text.slice(0, atPos);
    const after = text.slice(cursor);
    const mention = `@${user.name} `;
    setText(before + mention + after);
    setShowMentions(false);

    // Refocus
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) {
        const newPos = before.length + mention.length;
        ta.focus();
        ta.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const typingText = (() => {
    if (!typingUsers || typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]}が入力中...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]}と${typingUsers[1]}が入力中...`;
    return `${typingUsers[0]}と他${typingUsers.length - 1}人が入力中...`;
  })();

  return (
    <div className="shrink-0 px-4 pb-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      {/* Reply preview bar */}
      {replyTo && (
        <div className="mb-1 flex items-center gap-2 rounded-t-lg bg-slate-600/50 px-3 py-2 text-sm">
          <span className="text-slate-400">返信先:</span>
          <span className="font-semibold text-blue-400">
            {replyTo.user_name}
          </span>
          <span className="truncate text-slate-300 max-w-[400px]">
            {replyTo.content}
          </span>
          <button
            onClick={onCancelReply}
            className="ml-auto shrink-0 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="mb-1 flex items-center gap-2 rounded bg-slate-600/50 px-3 py-2 text-sm text-slate-300">
          <span className="truncate">{attachment.name}</span>
          <span className="text-xs text-slate-500">
            ({(attachment.size / 1024).toFixed(1)} KB)
          </span>
          <button
            onClick={() => setAttachment(null)}
            className="ml-auto shrink-0 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Mention autocomplete */}
      {showMentions && filteredMentions.length > 0 && (
        <div className="mb-1 rounded-lg bg-slate-800 border border-slate-600 shadow-xl max-h-48 overflow-y-auto">
          {filteredMentions.map((user, i) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                i === mentionIndex ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs">
                  {user.id === 'everyone' ? <AtSign size={14} /> : user.name[0]}
                </div>
              )}
              <span>{user.name}</span>
              {user.id === 'everyone' && (
                <span className="text-xs text-slate-400 ml-auto">全員にメンション</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        className={`flex items-end gap-2 rounded-lg bg-slate-600/50 px-3 py-2 ${
          replyTo ? 'rounded-t-none' : ''
        }`}
      >
        {/* File attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mb-0.5 shrink-0 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-500/50 transition-colors"
          title="ファイルを添付"
        >
          <Plus size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={`#${channelName} にメッセージを送信（⌘/Ctrl+Enter で送信）`}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-base md:text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
          style={{ maxHeight: '110px', fontSize: '16px' }}
        />

        {/* Emoji button */}
        <button
          className="mb-0.5 shrink-0 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-500/50 transition-colors"
          title="絵文字"
        >
          <Smile size={20} />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !attachment)}
          className="mb-0.5 shrink-0 rounded-full p-2 bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
          title="送信"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Typing indicator */}
      <div className="h-5 px-3 pt-1">
        {typingText && (
          <span className="text-xs text-slate-400 animate-pulse">
            {typingText}
          </span>
        )}
      </div>
    </div>
  );
}
