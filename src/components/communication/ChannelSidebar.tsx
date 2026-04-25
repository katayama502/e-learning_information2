'use client';

import React, { useState } from 'react';
import {
  Hash,
  Megaphone,
  ChevronDown,
  ListTodo,
  Layout,
  ChevronRight,
  Plus,
  X,
  Settings,
} from 'lucide-react';
import { useCommunicationStore } from '@/lib/communicationStore';
import WorkspaceSettingsModal from './WorkspaceSettingsModal';
import ChannelSettingsModal from './ChannelSettingsModal';

interface ChannelCategory {
  name: string;
  channels: Channel[];
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'announcement' | 'voice';
  category?: string;
  unread_count?: number;
}

interface DirectMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  is_online?: boolean;
  unread_count?: number;
}

interface ChannelSidebarProps {
  onBack?: () => void;
  hideHeader?: boolean;
}

export default function ChannelSidebar({ onBack, hideHeader }: ChannelSidebarProps) {
  const store = useCommunicationStore();
  const {
    workspaces,
    activeWorkspaceId,
    channels: storeChannels,
    activeChannelId,
    setActiveChannel,
    dmConversations,
  } = store;

  const { channelMessages } = store;
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) ?? null;

  // Get current user name for mention detection
  const currentUserName = (() => {
    try {
      const members = store.members ?? [];
      const me = members.find(m => {
        // Compare with supabase auth user
        return m.profile?.full_name;
      });
      return me?.profile?.full_name;
    } catch { return undefined; }
  })();

  // Count mentions per channel
  const mentionCounts: Record<string, number> = {};
  if (currentUserName) {
    Object.entries(channelMessages).forEach(([chId, msgs]) => {
      const count = (msgs ?? []).filter(m =>
        m.content?.includes(`@${currentUserName}`) || m.content?.includes('@everyone')
      ).length;
      if (count > 0) mentionCounts[chId] = count;
    });
  }

  const channels: Channel[] = (storeChannels ?? []).map(ch => ({
    id: ch.id,
    name: ch.name,
    type: ch.type === 'support' ? 'text' : ch.type,
    category: ch.category_id ?? undefined,
    unread_count: ch.unread_count,
  })) as Channel[];

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [channelSettingsId, setChannelSettingsId] = useState<string | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'announcement'>('text');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  if (!activeWorkspace) return null;

  // Group channels by category
  const categorized = (channels ?? []).reduce<Record<string, Channel[]>>(
    (acc, ch) => {
      const cat = ch.category ?? 'テキストチャンネル';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ch);
      return acc;
    },
    {}
  );

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const channelIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone size={16} className="shrink-0 text-slate-400" />;
      default:
        return <Hash size={16} className="shrink-0 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-full w-full md:w-60 flex-col bg-slate-800 text-slate-300">
      {/* Workspace header (hidden on mobile when hideHeader is true) */}
      {!hideHeader && (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between border-b border-slate-900 px-4 py-3 text-white shadow-sm hover:bg-slate-700 transition-colors"
        >
          <span className="truncate font-semibold text-[15px]">
            {activeWorkspace.name}
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* Dropdown menu (simplified) */}
      {showDropdown && (
        <div className="absolute left-[72px] top-12 z-50 w-56 rounded-md bg-slate-900 p-2 shadow-xl border border-slate-700">
          <button
            className="w-full rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => { setShowDropdown(false); setShowSettings(true); }}
          >
            ワークスペース設定
          </button>
          <button
            className="w-full rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => setShowDropdown(false)}
          >
            メンバーを招待
          </button>
          <button
            className="w-full rounded px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={() => { setShowDropdown(false); setShowCreateChannel(true); }}
          >
            チャンネルを作成
          </button>
        </div>
      )}

      {/* Dashboard & My Tasks */}
      <div className="px-2 pt-2 space-y-0.5">
        <button
          onClick={() => {
            store.setActiveChannel(null as any);
            window.dispatchEvent(new CustomEvent('show-ws-dashboard'));
          }}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
            !activeChannelId ? 'bg-slate-700/50 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Layout size={14} />
          <span>ダッシュボード</span>
        </button>
        <button
          onClick={() => {
            store.setActiveChannel(null as any);
            window.dispatchEvent(new CustomEvent('show-my-tasks'));
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <ListTodo size={14} />
          <span>マイタスク</span>
        </button>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-600">
        {Object.entries(categorized).map(([category, chList]) => {
          const isCollapsed = collapsedCategories.has(category);

          return (
            <div key={category}>
              {/* Category header */}
              <div className="group flex items-center justify-between px-1 mb-1">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-200"
                >
                  {isCollapsed ? (
                    <ChevronRight size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                  <span>{category}</span>
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200"
                  title="チャンネルを追加"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Channel items */}
              {!isCollapsed &&
                chList.map((ch) => {
                  const isActive = ch.id === activeChannelId;
                  const unread = ch.unread_count ?? 0;
                  const hasUnread = unread > 0;

                  return (
                    <div
                      key={ch.id}
                      className={`group/ch flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-600/70 text-white'
                          : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                      }`}
                      onClick={() => setActiveChannel(ch.id)}
                    >
                      {channelIcon(ch.type)}
                      <span
                        className={`truncate flex-1 ${
                          hasUnread && !isActive
                            ? 'font-semibold text-white'
                            : ''
                        }`}
                      >
                        {ch.name}
                      </span>
                      {/* ホバー時に設定ボタン表示 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setChannelSettingsId(ch.id); }}
                        className="opacity-0 group-hover/ch:opacity-100 shrink-0 p-0.5 text-slate-500 hover:text-white transition-all"
                        title="チャンネル設定"
                      >
                        <Settings size={13} />
                      </button>
                      {/* Mention badge */}
                      {(mentionCounts[ch.id] ?? 0) > 0 && !isActive && (
                        <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white" title="メンションあり">
                          @{mentionCounts[ch.id]}
                        </span>
                      )}
                      {/* Unread badge (only if no mention badge) */}
                      {hasUnread && !isActive && !(mentionCounts[ch.id] ?? 0) && (
                        <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-500 px-1 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* Direct Messages section */}
      <div className="border-t border-slate-700 px-2 py-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            ダイレクトメッセージ
          </span>
          <button className="text-slate-400 hover:text-slate-200">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
          {(dmConversations ?? []).map((dm) => {
            const hasUnread = (dm.unread_count ?? 0) > 0;
            const dmName = dm.name || dm.participants?.[0]?.full_name || 'DM';
            const dmAvatar = dm.participants?.[0]?.avatar_url;

            return (
              <button
                key={dm.id}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-slate-700/50 text-slate-400 hover:text-slate-200`}
              >
                {/* User avatar */}
                <div className="relative shrink-0">
                  <div className="h-6 w-6 rounded-full bg-slate-600 overflow-hidden">
                    {dmAvatar ? (
                      <img
                        src={dmAvatar}
                        alt={dmName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-white">
                        {dmName.charAt(0)}
                      </span>
                    )}
                  </div>
                  {/* Online indicator */}
                  {false && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-800 bg-green-500" />
                  )}
                </div>
                <span
                  className={`truncate ${hasUnread ? 'font-semibold text-white' : ''}`}
                >
                  {dmName}
                </span>
                {hasUnread && (
                  <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {dm.unread_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace Settings Modal */}
      {showSettings && activeWorkspace && (
        <WorkspaceSettingsModal
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Channel Settings Modal */}
      {channelSettingsId && activeWorkspace && (() => {
        const ch = (storeChannels ?? []).find(c => c.id === channelSettingsId);
        if (!ch) return null;
        return (
          <ChannelSettingsModal
            channel={{
              id: ch.id,
              name: ch.name,
              topic: ch.topic,
              type: ch.type,
              visibility: ch.visibility,
              is_archived: ch.is_archived,
              workspace_id: ch.workspace_id,
            }}
            workspaceId={activeWorkspace.id}
            onClose={() => setChannelSettingsId(null)}
            onUpdate={() => {
              store.setActiveWorkspace(activeWorkspace.id);
              setChannelSettingsId(null);
            }}
          />
        );
      })()}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCreateChannel(false)}>
          <div className="w-full max-w-md rounded-xl bg-slate-800 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">チャンネルを作成</h3>
              <button onClick={() => setShowCreateChannel(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">チャンネルの種類</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewChannelType('text')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      newChannelType === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Hash size={16} /> テキスト
                  </button>
                  <button
                    onClick={() => setNewChannelType('announcement')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      newChannelType === 'announcement' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Megaphone size={16} /> アナウンス
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">チャンネル名</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="新しいチャンネル"
                  className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCreateChannel(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  disabled={!newChannelName.trim() || isCreatingChannel}
                  onClick={async () => {
                    if (!activeWorkspaceId || !newChannelName.trim()) return;
                    setIsCreatingChannel(true);
                    try {
                      const res = await fetch(`/api/communication/workspaces/${activeWorkspaceId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'create_channel',
                          name: newChannelName.trim(),
                          type: newChannelType,
                        }),
                      });
                      if (res.ok) {
                        // Refresh workspace to get new channel
                        store.setActiveWorkspace(activeWorkspaceId);
                        setShowCreateChannel(false);
                        setNewChannelName('');
                        setNewChannelType('text');
                      }
                    } catch (e) {
                      console.error('Create channel failed:', e);
                    } finally {
                      setIsCreatingChannel(false);
                    }
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isCreatingChannel ? '作成中...' : '作成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
