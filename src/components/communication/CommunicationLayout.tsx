'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Hash, Megaphone, Users, Menu, ArrowLeft, Settings, ImagePlus, Pencil, Save, X as XIcon, Upload, Loader2, Sparkles, LayoutGrid, GanttChartSquare, MessageSquare, ListTodo, Search } from 'lucide-react';
import { useCommunicationStore } from '@/lib/communicationStore';
import { createClient } from '@/utils/supabase/client';
import WorkspaceSidebar from './WorkspaceSidebar';
import ChannelSidebar from './ChannelSidebar';
import MessageList, { Message } from './MessageList';
import MessageInput, { ReplyTo } from './MessageInput';
import ChannelSettingsModal from './ChannelSettingsModal';
import ChannelAssistant from './ChannelAssistant';
import ChannelTabs from './ChannelTabs';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import MyTasksView from './MyTasksView';
import WorkspaceDashboard from './WorkspaceDashboard';

// ---------------------------------------------------------------------------
// Mobile view enum
// ---------------------------------------------------------------------------

type MobilePanel = 'workspaces' | 'channels' | 'messages';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommunicationLayout() {
  const store = useCommunicationStore();
  const {
    workspaces,
    activeWorkspaceId,
    activeChannelId,
    channels,
    channelMessages,
    typingUsers,
    members,
    fetchChannelMessages,
    sendChannelMessage,
    isLoading,
  } = store;

  // Fetch workspaces if not loaded
  useEffect(() => {
    if (workspaces.length === 0) {
      store.fetchWorkspaces?.();
    }
  }, []);

  // Derived state
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? null;
  const activeChannel = channels.find(c => c.id === activeChannelId) ?? null;
  const rawMessages = activeChannelId ? (channelMessages[activeChannelId] ?? []) : [];
  const currentUserId = rawMessages[0]?.sender_id ?? '';

  // Convert ChannelMessage to MessageList.Message format
  const messages: Message[] = rawMessages.map(m => ({
    id: m.id,
    user: {
      id: m.sender_id,
      name: m.sender?.full_name ?? '不明',
      avatar: m.sender?.avatar_url,
    },
    content: m.content ?? '',
    created_at: m.created_at,
    updated_at: m.edited_at ?? undefined,
    is_deleted: !!m.deleted_at,
    is_pinned: m.is_pinned,
    is_system: m.is_system,
    reply_to: m.reply_to ? {
      id: m.reply_to_id!,
      user_name: m.reply_to.sender_name,
      content: m.reply_to.content,
    } : null,
    reactions: (m.reactions ?? []).map(r => ({
      emoji: r.emoji,
      count: r.count,
      reacted: r.users?.includes(currentUserId) ?? false,
    })),
    attachment_url: m.attachment_url ?? undefined,
    attachment_type: m.attachment_type ?? undefined,
    attachment_name: m.attachment_name ?? undefined,
  }));

  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('workspaces');
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [taskFromMessage, setTaskFromMessage] = useState<{ messageId: string; title: string } | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', assignee_id: '', assignee_team_id: '', due_date: '', due_time: '', description: '' });
  const [teams, setTeams] = useState<{ id: string; name: string; color: string }[]>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [channelTab, setChannelTab] = useState<'chat' | 'kanban' | 'gantt'>('chat');
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // Listen for sidebar events
  useEffect(() => {
    const handleMyTasks = () => { setShowMyTasks(true); setShowDashboard(false); };
    const handleDashboard = () => { setShowDashboard(true); setShowMyTasks(false); };
    window.addEventListener('show-my-tasks', handleMyTasks);
    window.addEventListener('show-ws-dashboard', handleDashboard);
    return () => {
      window.removeEventListener('show-my-tasks', handleMyTasks);
      window.removeEventListener('show-ws-dashboard', handleDashboard);
    };
  }, []);

  // When a channel is selected, hide overlays
  useEffect(() => {
    if (activeChannelId) { setShowMyTasks(false); setShowDashboard(false); }
  }, [activeChannelId]);

  // Get current user name for AI assistant
  const currentUserName = (members ?? []).find(m => m.profile)?.profile?.full_name;

  // Fetch teams when workspace changes
  useEffect(() => {
    if (!activeWorkspaceId) return;
    fetch(`/api/communication/teams?workspace_id=${activeWorkspaceId}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setTeams(d.data ?? []))
      .catch(() => {});
  }, [activeWorkspaceId]);

  // When active channel changes, load messages & switch to message panel on mobile
  useEffect(() => {
    if (activeChannelId) {
      fetchChannelMessages?.(activeChannelId);
      setMobilePanel('messages');
      setReplyTo(null);
      setChannelTab('chat');
    }
  }, [activeChannelId, fetchChannelMessages]);

  // When workspace changes, show channel panel on mobile
  useEffect(() => {
    if (activeWorkspaceId) {
      setMobilePanel('channels');
    }
  }, [activeWorkspaceId]);

  // Handlers
  const handleSend = useCallback(
    async (content: string, attachment?: File | null, replyToId?: string) => {
      if (!activeChannelId) return;

      let attachmentUrl: string | undefined;
      let attachmentType: string | undefined;
      let attachmentName: string | undefined;

      // Upload attachment to Supabase Storage if provided
      if (attachment) {
        try {
          const supabase = createClient();
          const ext = attachment.name.split('.').pop() || 'file';
          const path = `channels/${activeChannelId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

          const { data, error } = await supabase.storage
            .from('workspace-assets')
            .upload(path, attachment, { contentType: attachment.type });

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('workspace-assets')
            .getPublicUrl(data.path);

          attachmentUrl = urlData.publicUrl;
          attachmentType = attachment.type;
          attachmentName = attachment.name;
        } catch (e) {
          console.error('File upload failed:', e);
          return;
        }
      }

      // Send message with optional attachment
      await fetch(`/api/communication/channels/${activeChannelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          attachment_url: attachmentUrl,
          attachment_type: attachmentType,
          attachment_name: attachmentName,
          reply_to_id: replyToId,
        }),
      });

      // Refresh messages to get the new one with proper sender info
      await fetchChannelMessages?.(activeChannelId);
      setReplyTo(null);
    },
    [activeChannelId, fetchChannelMessages]
  );

  const handleReply = useCallback((msg: Message) => {
    setReplyTo({
      id: msg.id,
      user_name: msg.user.name,
      content: msg.content,
    });
  }, []);

  const handleScrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-blue-500/10');
      setTimeout(() => el.classList.remove('bg-blue-500/10'), 2000);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (activeChannelId && messages.length > 0) {
      fetchChannelMessages?.(activeChannelId, messages[0]?.id);
    }
  }, [activeChannelId, fetchChannelMessages, messages]);

  // Edit message
  const handleEdit = useCallback(async (messageId: string, newContent: string) => {
    if (!activeChannelId) return;
    try {
      await fetch(`/api/communication/channels/${activeChannelId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, content: newContent }),
      });
      // Update local state
      store.editChannelMessage?.(activeChannelId, messageId, newContent);
    } catch (e) {
      console.error('Edit failed:', e);
    }
  }, [activeChannelId, store]);

  // Delete message
  const handleDelete = useCallback(async (messageId: string) => {
    if (!activeChannelId) return;
    try {
      await fetch(`/api/communication/channels/${activeChannelId}/messages?message_id=${messageId}`, {
        method: 'DELETE',
      });
      store.deleteChannelMessage?.(activeChannelId, messageId);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }, [activeChannelId, store]);

  // Toggle reaction
  const handleReact = useCallback(async (messageId: string, emoji: string) => {
    if (!activeChannelId) return;
    try {
      const res = await fetch(`/api/communication/channels/${activeChannelId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, reaction: emoji }),
      });
      const json = await res.json();
      if (json.data?.reactions) {
        store.updateMessageReactions?.(activeChannelId, messageId, json.data.reactions);
      }
    } catch (e) {
      console.error('Reaction failed:', e);
    }
  }, [activeChannelId, store]);

  // Toggle pin
  const handlePin = useCallback(async (messageId: string) => {
    if (!activeChannelId) return;
    const msg = rawMessages.find(m => m.id === messageId);
    const newPinned = !(msg?.is_pinned);
    try {
      await fetch(`/api/communication/channels/${activeChannelId}/messages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, is_pinned: newPinned }),
      });
      store.pinChannelMessage?.(activeChannelId, messageId, newPinned);
    } catch (e) {
      console.error('Pin failed:', e);
    }
  }, [activeChannelId, rawMessages, store]);

  // Create task from message — open modal with defaults
  const handleCreateTask = useCallback((messageId: string, title: string) => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 7);
    const currentMember = (members ?? []).find(m => m.profile);
    setTaskFromMessage({ messageId, title });
    setTaskForm({
      title: title.substring(0, 100),
      assignee_id: currentMember?.user_id ?? '',
      due_date: defaultDue.toISOString().split('T')[0],
      description: '',
    });
  }, [members]);

  const submitTaskFromMessage = async () => {
    if (!activeChannelId || !activeWorkspaceId || !taskFromMessage) return;
    try {
      const boardRes = await fetch(`/api/communication/tasks?channel_id=${activeChannelId}&workspace_id=${activeWorkspaceId}`);
      const boardData = await boardRes.json();
      const board = boardData.data?.board;
      const firstCol = boardData.data?.columns?.[0];
      if (!board || !firstCol) return;

      await fetch('/api/communication/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: board.id,
          column_id: firstCol.id,
          title: taskForm.title || 'メッセージからのタスク',
          description: taskForm.description || undefined,
          assignee_id: taskForm.assignee_id || undefined,
          due_date: taskForm.due_date || undefined,
          source_message_id: taskFromMessage.messageId,
          source_channel_id: activeChannelId,
        }),
      });

      setTaskFromMessage(null);
    } catch (e) {
      console.error('Create task from message failed:', e);
    }
  };

  // Channel icon helper
  const channelIcon = activeChannel?.type === 'announcement'
    ? <Megaphone size={20} className="text-slate-400" />
    : <Hash size={20} className="text-slate-400" />;

  return (
    <div className="flex h-full w-full bg-slate-900 text-white overflow-hidden">
      {/* ================================================================= */}
      {/* Desktop layout                                                    */}
      {/* ================================================================= */}

      {/* Workspace sidebar - always visible on desktop */}
      <div className="hidden md:block">
        <WorkspaceSidebar />
      </div>

      {/* Channel sidebar - always visible on desktop */}
      <div className="hidden md:block">
        <ChannelSidebar />
      </div>

      {/* Main content area */}
      <div className="hidden md:flex flex-1 flex-col bg-slate-700 min-w-0">
        {!activeWorkspaceId ? (
          <WelcomeScreen />
        ) : showMyTasks && activeWorkspaceId ? (
          <MyTasksView
            workspaceId={activeWorkspaceId}
            onNavigateToChannel={(channelId) => {
              store.setActiveChannel(channelId);
              setShowMyTasks(false);
            }}
          />
        ) : (showDashboard || !activeChannelId || !activeChannel) && activeWorkspaceId ? (
          <WorkspaceDashboard
            workspace={activeWorkspace}
            workspaceId={activeWorkspaceId}
            members={members}
            channels={channels}
            onNavigateToChannel={(channelId) => {
              store.setActiveChannel(channelId);
              setShowDashboard(false);
            }}
            onShowMyTasks={() => { setShowMyTasks(true); setShowDashboard(false); }}
          />
        ) : (
          <>
            {/* Channel header */}
            <div className="flex items-center gap-3 border-b border-slate-600 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                {channelIcon}
                <h2 className="font-semibold text-white">
                  {activeChannel.name}
                </h2>
              </div>
              {activeChannel.topic && (
                <>
                  <div className="h-5 w-px bg-slate-500" />
                  <span className="truncate text-sm text-slate-400">
                    {activeChannel.topic}
                  </span>
                </>
              )}
              <div className="ml-auto flex items-center gap-3 text-slate-400">
                <div className="flex items-center gap-1">
                  <Users size={18} />
                  <span className="text-sm">{members.length}</span>
                </div>
                <button
                  onClick={() => { setShowSearch(!showSearch); if (showSearch) { setSearchQuery(''); setSearchResults([]); } }}
                  className={`p-1 rounded transition-colors ${showSearch ? 'text-blue-400 bg-blue-500/20' : 'hover:text-white hover:bg-slate-600'}`}
                  title="メッセージ検索"
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => setShowAssistant(!showAssistant)}
                  className={`p-1 rounded transition-colors ${showAssistant ? 'text-purple-400 bg-purple-500/20' : 'hover:text-white hover:bg-slate-600'}`}
                  title="AIアシスタント"
                >
                  <Sparkles size={18} />
                </button>
                <button
                  onClick={() => setShowChannelSettings(true)}
                  className="p-1 hover:text-white hover:bg-slate-600 rounded transition-colors"
                  title="チャンネル設定"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 px-4 py-1 border-b border-slate-700/50 bg-slate-800/30">
              {[
                { key: 'chat' as const, icon: MessageSquare, label: 'チャット' },
                { key: 'kanban' as const, icon: LayoutGrid, label: 'カンバン' },
                { key: 'gantt' as const, icon: GanttChartSquare, label: 'ガント' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setChannelTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    channelTab === tab.key
                      ? 'bg-slate-600/50 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search bar */}
            {showSearch && (
              <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim().length >= 2) {
                        const q = e.target.value.toLowerCase();
                        setSearchResults(messages.filter(m => m.content.toLowerCase().includes(q)));
                      } else {
                        setSearchResults([]);
                      }
                    }}
                    placeholder="メッセージを検索..."
                    autoFocus
                    className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    <span className="text-[10px] text-slate-500">{searchResults.length}件の結果</span>
                    {searchResults.map(msg => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          handleScrollToMessage(msg.id);
                          setShowSearch(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="w-full flex items-start gap-2 p-2 rounded-lg text-left hover:bg-slate-700/50 transition-colors"
                      >
                        <span className="text-xs text-blue-400 font-medium shrink-0">{msg.user.name}</span>
                        <span className="text-xs text-slate-300 truncate">{msg.content}</span>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-auto">
                          {new Date(msg.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500 text-center py-2">検索結果がありません</p>
                )}
              </div>
            )}

            {/* Channel Tabs (URL links / Notes) */}
            {activeChannelId && (
              <ChannelTabs channelId={activeChannelId} isAdmin={true} />
            )}

            {/* Tab content */}
            {channelTab === 'chat' && (
              <>
                <MessageList
                  messages={messages ?? []}
                  currentUserId={currentUserId}
                  onLoadMore={handleLoadMore}
                  isLoadingMore={isLoading}
                  hasMore={false}
                  onReply={handleReply}
                  onReact={handleReact}
                  onPin={handlePin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onScrollToMessage={handleScrollToMessage}
                  onCreateTask={handleCreateTask}
                />
                <MessageInput
                  channelName={activeChannel.name}
                  replyTo={replyTo}
                  typingUsers={activeChannelId ? (typingUsers[activeChannelId] ?? []) : []}
                  mentionUsers={(members ?? []).map(m => ({
                    id: m.user_id,
                    name: m.profile?.full_name ?? m.user_id,
                    avatar: m.profile?.avatar_url,
                  }))}
                  onSend={handleSend}
                  onCancelReply={() => setReplyTo(null)}
                />
              </>
            )}

            {channelTab === 'kanban' && activeWorkspaceId && (
              <KanbanBoard
                channelId={activeChannel.id}
                workspaceId={activeWorkspaceId}
                members={members}
              />
            )}

            {channelTab === 'gantt' && activeWorkspaceId && (
              <GanttChart
                channelId={activeChannel.id}
                workspaceId={activeWorkspaceId}
              />
            )}

            {/* Channel settings modal */}
            {showChannelSettings && activeChannel && activeWorkspaceId && (
              <ChannelSettingsModal
                channel={{
                  id: activeChannel.id,
                  name: activeChannel.name,
                  topic: activeChannel.topic,
                  type: activeChannel.type,
                  visibility: activeChannel.visibility,
                  is_archived: activeChannel.is_archived,
                  workspace_id: activeChannel.workspace_id,
                }}
                workspaceId={activeWorkspaceId}
                onClose={() => setShowChannelSettings(false)}
                onUpdate={() => {
                  store.setActiveWorkspace(activeWorkspaceId);
                  setShowChannelSettings(false);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* AI Assistant Panel (Desktop) */}
      {showAssistant && activeChannel && (
        <div className="hidden md:flex">
          <ChannelAssistant
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            userName={currentUserName}
            onClose={() => setShowAssistant(false)}
          />
        </div>
      )}

      {/* Task from message modal */}
      {taskFromMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setTaskFromMessage(null)}>
          <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ListTodo size={16} className="text-purple-400" />
                メッセージからタスクを作成
              </h3>
              <button onClick={() => setTaskFromMessage(null)} className="text-slate-400 hover:text-white">
                <XIcon size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">タスク名</label>
                <input
                  value={taskForm.title}
                  onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">コメント・詳細</label>
                <textarea
                  value={taskForm.description}
                  onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="タスクの詳細やメモを入力..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">担当者</label>
                  <select
                    value={taskForm.assignee_id}
                    onChange={e => setTaskForm(f => ({ ...f, assignee_id: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">未割当</option>
                    {(members ?? []).map(m => (
                      <option key={m.user_id} value={m.user_id}>{m.profile?.full_name ?? m.user_id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">期日</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-3 border-t border-slate-700">
              <button onClick={() => setTaskFromMessage(null)} className="text-sm text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-700">
                キャンセル
              </button>
              <button
                onClick={submitTaskFromMessage}
                disabled={!taskForm.title.trim()}
                className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                <ListTodo size={14} /> タスクを作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Mobile layout                                                     */}
      {/* ================================================================= */}

      <div className="flex flex-1 flex-col md:hidden overflow-hidden" style={{ height: 'calc(100dvh - 44px)' }}>
        {mobilePanel === 'workspaces' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-slate-700 px-4 py-3">
              <h1 className="font-semibold text-white text-lg">ワークスペース</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {workspaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={24} className="animate-spin text-slate-500" />
                  <p className="text-sm text-slate-500">ワークスペースを読み込み中...</p>
                </div>
              ) : (
                workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => { store.setActiveWorkspace(ws.id); setMobilePanel('channels'); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                      activeWorkspaceId === ws.id ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {ws.icon_url ? (
                        <img src={ws.icon_url} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                      ) : (
                        ws.name[0]
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{ws.name}</p>
                      {ws.description && <p className="text-xs text-slate-400 truncate">{ws.description}</p>}
                    </div>
                    <ArrowLeft size={16} className="text-slate-500 rotate-180 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {mobilePanel === 'channels' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="shrink-0 flex items-center gap-2 border-b border-slate-700 px-4 py-3">
              <button
                onClick={() => setMobilePanel('workspaces')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="font-semibold text-white">
                {activeWorkspace?.name ?? 'チャンネル'}
              </h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChannelSidebar onBack={() => setMobilePanel('workspaces')} hideHeader />
            </div>
          </div>
        )}

        {mobilePanel === 'messages' && (
          <div className="flex flex-1 flex-col overflow-hidden bg-slate-700">
            {!activeChannel && !showMyTasks ? (
              activeWorkspaceId ? (
                <WorkspaceDashboard
                  workspace={activeWorkspace}
                  workspaceId={activeWorkspaceId}
                  members={members}
                  channels={channels}
                  onNavigateToChannel={(channelId) => {
                    store.setActiveChannel(channelId);
                  }}
                  onShowMyTasks={() => setShowMyTasks(true)}
                />
              ) : (
                <WorkspaceHomeScreen workspace={activeWorkspace} members={members} channels={channels} />
              )
            ) : showMyTasks && activeWorkspaceId ? (
              <>
                <div className="shrink-0 flex items-center gap-2 border-b border-slate-600 px-3 py-2.5 bg-slate-800">
                  <button onClick={() => setShowMyTasks(false)} className="text-slate-400 hover:text-white">
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="font-semibold text-white text-sm">マイタスク</h2>
                </div>
                <MyTasksView
                  workspaceId={activeWorkspaceId}
                  onNavigateToChannel={(channelId) => {
                    store.setActiveChannel(channelId);
                    setShowMyTasks(false);
                  }}
                />
              </>
            ) : activeChannel ? (
              <>
                {/* Mobile channel header with full features */}
                <div className="shrink-0 flex items-center gap-2 border-b border-slate-600 px-3 py-2.5 shadow-sm bg-slate-800">
                  <button
                    onClick={() => setMobilePanel('channels')}
                    className="text-slate-400 hover:text-white"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  {channelIcon}
                  <h2 className="font-semibold text-white truncate text-sm flex-1">
                    {activeChannel.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[10px]">{members.length}</span>
                    <button
                      onClick={() => setShowAssistant(!showAssistant)}
                      className={`p-1 rounded transition-colors ${showAssistant ? 'text-purple-400 bg-purple-500/20' : 'hover:text-white'}`}
                      title="AI"
                    >
                      <Sparkles size={16} />
                    </button>
                    <button
                      onClick={() => setShowChannelSettings(true)}
                      className="p-1 rounded hover:text-white transition-colors"
                      title="設定"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>

                {/* Mobile AI Assistant overlay */}
                {showAssistant && (
                  <div className="absolute inset-0 z-40 bg-slate-800/95 flex flex-col" style={{ top: '44px' }}>
                    <ChannelAssistant
                      channelId={activeChannel.id}
                      channelName={activeChannel.name}
                      userName={currentUserName}
                      onClose={() => setShowAssistant(false)}
                    />
                  </div>
                )}

                {/* Messages - scrollable */}
                <MessageList
                  messages={messages ?? []}
                  currentUserId={currentUserId}
                  onLoadMore={handleLoadMore}
                  isLoadingMore={isLoading}
                  hasMore={false}
                  onReply={handleReply}
                  onReact={handleReact}
                  onPin={handlePin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onScrollToMessage={handleScrollToMessage}
                  onCreateTask={handleCreateTask}
                />

                {/* Input - fixed at bottom */}
                <MessageInput
                  channelName={activeChannel.name}
                  replyTo={replyTo}
                  typingUsers={activeChannelId ? (typingUsers[activeChannelId] ?? []) : []}
                  mentionUsers={(members ?? []).map(m => ({
                    id: m.user_id,
                    name: m.profile?.full_name ?? m.user_id,
                    avatar: m.profile?.avatar_url,
                  }))}
                  onSend={handleSend}
                  onCancelReply={() => setReplyTo(null)}
                />

                {/* Channel settings modal */}
                {showChannelSettings && activeWorkspaceId && (
                  <ChannelSettingsModal
                    channel={{
                      id: activeChannel.id,
                      name: activeChannel.name,
                      topic: activeChannel.topic,
                      type: activeChannel.type,
                      visibility: activeChannel.visibility,
                      is_archived: activeChannel.is_archived,
                      workspace_id: activeChannel.workspace_id,
                    }}
                    workspaceId={activeWorkspaceId}
                    onClose={() => setShowChannelSettings(false)}
                    onUpdate={() => {
                      store.setActiveWorkspace(activeWorkspaceId);
                      setShowChannelSettings(false);
                    }}
                  />
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-screens
// ---------------------------------------------------------------------------

function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      icon: '💬',
      title: 'チームでつながるコミュニケーション',
      description: 'プロジェクトごとにチャンネルを作成し、チームメンバーとリアルタイムでやりとりができます。テキスト、ファイル、画像を共有しましょう。',
      features: ['リアルタイムチャット', 'ファイル共有', '画像添付'],
    },
    {
      icon: '📋',
      title: 'タスクで進捗を見える化',
      description: 'チャンネルごとにタスクボード（カンバン）を使って、やるべきことを整理。担当者の割り当てや期限設定も簡単です。',
      features: ['カンバンボード', '担当者割り当て', '期限管理'],
    },
    {
      icon: '🔔',
      title: 'メンションで大事な連絡を見逃さない',
      description: '@名前 で特定の人に通知を送れます。@everyone でチャンネル全員に呼びかけることも。重要なメッセージにはリアクションやピン留めも。',
      features: ['@メンション', 'リアクション', 'ピン留め'],
    },
    {
      icon: '✨',
      title: 'AIアシスタントが会話を整理',
      description: 'チャンネルの会話をAIが要約したり、自分宛てのメンションをまとめたり、会話からTodoを自動抽出してくれます。',
      features: ['会話の要約', 'メンション要約', 'Todo自動抽出'],
    },
    {
      icon: '👥',
      title: 'プロジェクトごとのワークスペース',
      description: '左のアイコンからワークスペースを選んで始めましょう。プロジェクトや目的ごとに空間が分かれているので、情報が混ざりません。',
      features: ['複数ワークスペース', 'ロール管理', 'チーム管理'],
    },
  ];

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <div className="w-full max-w-lg">
        {/* Slide content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-6">{slide.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-3">{slide.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{slide.description}</p>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {slide.features.map((f, i) => (
              <span key={i} className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-700">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-blue-500 w-6' : 'bg-slate-600 hover:bg-slate-500'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3">
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(c => c - 1)}
              className="px-5 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              戻る
            </button>
          )}
          <button
            onClick={() => isLast ? setCurrentSlide(0) : setCurrentSlide(c => c + 1)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isLast ? '← ワークスペースを選ぶ' : '次へ →'}
          </button>
        </div>

        {/* Skip link */}
        {!isLast && (
          <div className="text-center mt-4">
            <button
              onClick={() => setCurrentSlide(slides.length - 1)}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
            >
              スキップ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkspaceHomeScreen({
  workspace,
  members,
  channels,
}: {
  workspace: any;
  members: any[];
  channels: any[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(workspace?.description || '');
  const [editBanner, setEditBanner] = useState(workspace?.banner_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  const { setActiveChannel } = useCommunicationStore();

  useEffect(() => {
    setEditDesc(workspace?.description || '');
    setEditBanner(workspace?.banner_url || '');
    setIsEditing(false);
  }, [workspace?.id]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('5MB以下にしてください'); return; }
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/banner-${workspace.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('workspace-assets').upload(path, file, { upsert: true });
      if (error) { alert('アップロードに失敗しました'); return; }
      const { data: { publicUrl } } = supabase.storage.from('workspace-assets').getPublicUrl(path);
      setEditBanner(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!workspace) return;
    setSaving(true);
    try {
      await fetch(`/api/communication/workspaces/${workspace.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDesc, banner_url: editBanner }),
      });
      workspace.description = editDesc;
      workspace.banner_url = editBanner;
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!workspace) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* バナー画像エリア */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-purple-600/30 overflow-hidden">
        {(editBanner || workspace.banner_url) && (
          <img
            src={isEditing ? editBanner : workspace.banner_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-700/90 to-transparent" />

        {/* 編集ボタン */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm transition-colors"
        >
          {isEditing ? <XIcon size={14} /> : <Pencil size={14} />}
          {isEditing ? 'キャンセル' : '編集'}
        </button>

        {/* ワークスペース名（バナー下部） */}
        <div className="absolute bottom-4 left-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-slate-700">
              {workspace.icon_url ? (
                <img src={workspace.icon_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                workspace.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">{workspace.name}</h1>
              <p className="text-sm text-slate-300">{members.length}人のメンバー</p>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-6 space-y-6">
        {/* 編集モード */}
        {isEditing ? (
          <div className="space-y-4 bg-slate-600/30 rounded-xl p-5 border border-slate-600">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">バナー画像</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? 'アップロード中...' : '画像をアップロード'}
                </button>
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                <span className="text-xs text-slate-500">または</span>
                <input
                  value={editBanner}
                  onChange={e => setEditBanner(e.target.value)}
                  placeholder="画像URLを入力..."
                  className="flex-1 px-3 py-2 bg-slate-900 rounded-lg text-xs text-white border border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>
              {editBanner && (
                <div className="mt-2 h-20 rounded-lg overflow-hidden bg-slate-900">
                  <img src={editBanner} alt="プレビュー" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">ワークスペースの説明</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={4}
                placeholder="このワークスペースの目的や紹介文を入力..."
                className="w-full px-3 py-2 bg-slate-900 rounded-lg text-sm text-white border border-slate-600 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save size={14} />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 説明文 */}
            {workspace.description ? (
              <div className="bg-slate-600/20 rounded-xl p-5 border border-slate-600/50">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">このワークスペースについて</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{workspace.description}</p>
              </div>
            ) : (
              <div className="bg-slate-600/10 rounded-xl p-5 border border-dashed border-slate-600 text-center">
                <p className="text-sm text-slate-500">説明文がまだ設定されていません</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  説明を追加する
                </button>
              </div>
            )}
          </>
        )}

        {/* チャンネル一覧カード */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">チャンネル一覧</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-600/20 hover:bg-slate-600/40 rounded-xl border border-slate-600/30 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center shrink-0">
                  {ch.type === 'announcement' ? (
                    <Megaphone size={16} className="text-amber-400" />
                  ) : (
                    <Hash size={16} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white group-hover:text-blue-300 truncate">{ch.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {ch.topic || (ch.type === 'announcement' ? 'アナウンスチャンネル' : 'テキストチャンネル')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* メンバー一覧（最初の数人） */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">メンバー ({members.length}人)</h3>
          <div className="flex flex-wrap gap-2">
            {members.slice(0, 12).map(m => (
              <div key={m.user_id} className="flex items-center gap-2 px-3 py-2 bg-slate-600/20 rounded-lg">
                <img
                  src={m.profile?.avatar_url || '/images/defaults/default_user_avatar.png'}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs text-slate-300">{m.profile?.full_name || m.nickname || '不明'}</span>
              </div>
            ))}
            {members.length > 12 && (
              <div className="flex items-center px-3 py-2 text-xs text-slate-500">
                +{members.length - 12}人
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
