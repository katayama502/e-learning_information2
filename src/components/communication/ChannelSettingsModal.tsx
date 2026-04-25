'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Hash, Megaphone, Settings, Users, Shield, Bell, Trash2,
  Lock, Unlock, Archive, Pin, Check, Plus, Search, UserPlus
} from 'lucide-react';

interface ChannelInfo {
  id: string;
  name: string;
  topic?: string;
  type: 'text' | 'announcement' | 'support';
  visibility: 'public' | 'private';
  is_archived: boolean;
  workspace_id: string;
}

interface Member {
  user_id: string;
  role: string;
  profile?: {
    full_name: string;
    avatar_url: string;
    email?: string;
  };
}

interface Props {
  channel: ChannelInfo;
  workspaceId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

type Tab = 'overview' | 'members' | 'permissions' | 'danger';

export default function ChannelSettingsModal({ channel, workspaceId, onClose, onUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 概要編集
  const [editName, setEditName] = useState(channel.name);
  const [editTopic, setEditTopic] = useState(channel.topic || '');
  const [editType, setEditType] = useState(channel.type);
  const [editVisibility, setEditVisibility] = useState(channel.visibility);
  const [slowMode, setSlowMode] = useState(0);

  // メンバー
  const [members, setMembers] = useState<Member[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/communication/workspaces/${workspaceId}`);
      if (res.ok) {
        const { data } = await res.json();
        setAllMembers(data?.members || []);
        // チャンネルが公開なら全メンバー、非公開なら権限持ちのみ
        setMembers(data?.members || []);
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // チャンネル設定保存
  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/communication/channels/${channel.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          topic: editTopic,
          type: editType,
          visibility: editVisibility,
        }),
      });
      if (res.ok) {
        onUpdate?.();
      }
    } finally {
      setSaving(false);
    }
  };

  // チャンネルアーカイブ
  const archiveChannel = async () => {
    if (!confirm('このチャンネルをアーカイブしますか？メッセージは残りますが、新しいメッセージは送れなくなります。')) return;
    await fetch(`/api/communication/channels/${channel.id}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: true }),
    });
    onUpdate?.();
    onClose();
  };

  // チャンネル削除
  const deleteChannel = async () => {
    if (!confirm('このチャンネルを完全に削除しますか？この操作は取り消せません。')) return;
    if (!confirm('本当に削除しますか？全てのメッセージが失われます。')) return;
    await fetch(`/api/communication/channels/${channel.id}/settings`, {
      method: 'DELETE',
    });
    onUpdate?.();
    onClose();
  };

  // メンバー招待
  const inviteMember = async (userId: string) => {
    await fetch(`/api/communication/workspaces/${workspaceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'invite', user_id: userId }),
    });
    await fetchMembers();
  };

  const filteredAddMembers = allMembers.filter(m => {
    if (!searchQuery) return true;
    const name = m.profile?.full_name || '';
    const email = m.profile?.email || '';
    return name.includes(searchQuery) || email.includes(searchQuery);
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '概要', icon: <Settings size={16} /> },
    { id: 'members', label: 'メンバー', icon: <Users size={16} /> },
    { id: 'permissions', label: '権限', icon: <Shield size={16} /> },
    { id: 'danger', label: '管理', icon: <Trash2 size={16} /> },
  ];

  const channelTypeIcon = editType === 'announcement'
    ? <Megaphone size={18} className="text-amber-400" />
    : <Hash size={18} className="text-slate-400" />;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="relative flex w-[800px] max-w-[95vw] h-[550px] max-h-[85vh] rounded-xl bg-slate-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Left nav */}
        <div className="w-44 shrink-0 bg-slate-900 p-3 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            {channelTypeIcon}
            <span className="text-sm font-bold text-white truncate">{channel.name}</span>
          </div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <OverviewTab
                editName={editName} setEditName={setEditName}
                editTopic={editTopic} setEditTopic={setEditTopic}
                editType={editType} setEditType={setEditType}
                editVisibility={editVisibility} setEditVisibility={setEditVisibility}
                slowMode={slowMode} setSlowMode={setSlowMode}
                saving={saving} onSave={saveSettings}
                isSystemChannel={['general', 'announcements', 'random'].includes(channel.name)}
              />
            )}
            {activeTab === 'members' && (
              <MembersTab
                members={members}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showAddMember={showAddMember}
                setShowAddMember={setShowAddMember}
              />
            )}
            {activeTab === 'permissions' && <PermissionsTab visibility={editVisibility} />}
            {activeTab === 'danger' && (
              <DangerTab
                isSystemChannel={['general'].includes(channel.name)}
                onArchive={archiveChannel}
                onDelete={deleteChannel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 概要タブ
// ============================================================
function OverviewTab({
  editName, setEditName, editTopic, setEditTopic,
  editType, setEditType, editVisibility, setEditVisibility,
  slowMode, setSlowMode,
  saving, onSave, isSystemChannel,
}: any) {
  return (
    <div className="space-y-6">
      {/* チャンネル名 */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">チャンネル名</label>
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-slate-500" />
          <input
            value={editName}
            onChange={e => setEditName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="flex-1 px-3 py-2 bg-slate-900 rounded text-sm text-white border border-slate-600 focus:border-blue-500 outline-none"
            placeholder="channel-name"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">半角英数とハイフンのみ</p>
      </div>

      {/* トピック */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">トピック / 説明</label>
        <textarea
          value={editTopic}
          onChange={e => setEditTopic(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-slate-900 rounded text-sm text-white border border-slate-600 focus:border-blue-500 outline-none resize-none"
          placeholder="このチャンネルの目的や話題を説明"
        />
      </div>

      {/* チャンネルタイプ */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">チャンネルタイプ</label>
        <div className="flex gap-2">
          {[
            { value: 'text', label: 'テキスト', icon: <Hash size={14} />, desc: '通常のメッセージチャンネル' },
            { value: 'announcement', label: 'アナウンス', icon: <Megaphone size={14} />, desc: '管理者のみ投稿可' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setEditType(opt.value)}
              className={`flex-1 flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                editType === opt.value
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              {opt.icon}
              <div className="text-left">
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-slate-500">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 公開/非公開 */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">公開設定</label>
        <div className="flex gap-2">
          <button
            onClick={() => setEditVisibility('public')}
            className={`flex-1 flex items-center gap-2 p-3 rounded-lg border transition-colors ${
              editVisibility === 'public'
                ? 'border-green-500 bg-green-500/10 text-white'
                : 'border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Unlock size={14} />
            <div className="text-left">
              <div className="text-sm font-medium">公開</div>
              <div className="text-xs text-slate-500">メンバー全員がアクセス可</div>
            </div>
          </button>
          <button
            onClick={() => setEditVisibility('private')}
            className={`flex-1 flex items-center gap-2 p-3 rounded-lg border transition-colors ${
              editVisibility === 'private'
                ? 'border-amber-500 bg-amber-500/10 text-white'
                : 'border-slate-600 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Lock size={14} />
            <div className="text-left">
              <div className="text-sm font-medium">非公開</div>
              <div className="text-xs text-slate-500">招待されたメンバーのみ</div>
            </div>
          </button>
        </div>
      </div>

      {/* スローモード */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">スローモード</label>
        <select
          value={slowMode}
          onChange={e => setSlowMode(Number(e.target.value))}
          className="px-3 py-2 bg-slate-900 rounded text-sm text-white border border-slate-600 focus:border-blue-500 outline-none"
        >
          <option value={0}>オフ</option>
          <option value={5}>5秒</option>
          <option value={10}>10秒</option>
          <option value={30}>30秒</option>
          <option value={60}>1分</option>
          <option value={300}>5分</option>
        </select>
        <p className="text-xs text-slate-500 mt-1">メンバーが連続して投稿するまでの待ち時間</p>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : '変更を保存'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// メンバータブ
// ============================================================
function MembersTab({ members, searchQuery, setSearchQuery, showAddMember, setShowAddMember }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-lg border border-slate-600">
          <Search size={14} className="text-slate-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="メンバーを検索..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-slate-500"
          />
        </div>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={14} />
          追加
        </button>
      </div>

      <p className="text-xs text-slate-500">{members.length}人のメンバー</p>

      <div className="space-y-1">
        {members
          .filter((m: Member) => {
            if (!searchQuery) return true;
            return (m.profile?.full_name || '').includes(searchQuery);
          })
          .map((member: Member) => (
            <div key={member.user_id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-700/30">
              <div className="flex items-center gap-3">
                <img
                  src={member.profile?.avatar_url || '/images/defaults/default_user_avatar.png'}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium text-white">{member.profile?.full_name || '不明'}</div>
                  <div className="text-xs text-slate-500">{member.role}</div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ============================================================
// 権限タブ
// ============================================================
function PermissionsTab({ visibility }: { visibility: string }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-700/30 rounded-lg">
        <h4 className="text-sm font-bold text-white mb-2">チャンネルの権限について</h4>
        <p className="text-sm text-slate-400">
          {visibility === 'public'
            ? 'このチャンネルは公開チャンネルです。ワークスペースの全メンバーが閲覧・投稿できます。個別の権限はワークスペースのロール設定で管理されます。'
            : 'このチャンネルは非公開チャンネルです。招待されたメンバーのみがアクセスできます。'}
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">デフォルト権限</h4>
        {[
          { label: 'メッセージの閲覧', enabled: true },
          { label: 'メッセージの送信', enabled: true },
          { label: 'ファイルの添付', enabled: true },
          { label: 'リアクションの追加', enabled: true },
          { label: 'メッセージのピン留め', enabled: false },
          { label: '他人のメッセージ削除', enabled: false },
        ].map(perm => (
          <div key={perm.label} className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-700/30">
            <span className="text-sm text-slate-300">{perm.label}</span>
            <div className={`w-9 h-5 rounded-full relative transition-colors ${perm.enabled ? 'bg-green-500' : 'bg-slate-600'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${perm.enabled ? 'left-4' : 'left-0.5'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 管理タブ
// ============================================================
function DangerTab({ isSystemChannel, onArchive, onDelete }: { isSystemChannel: boolean; onArchive: () => void; onDelete: () => void }) {
  return (
    <div className="space-y-6">
      {/* アーカイブ */}
      <div className="p-4 bg-slate-700/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Archive size={16} className="text-amber-400" />
              チャンネルをアーカイブ
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              アーカイブすると新しいメッセージは送れなくなりますが、過去のメッセージは閲覧できます。
            </p>
          </div>
          <button
            onClick={onArchive}
            className="px-4 py-2 bg-amber-600/20 text-amber-400 text-sm rounded-md hover:bg-amber-600/30 border border-amber-600/30 transition-colors"
          >
            アーカイブ
          </button>
        </div>
      </div>

      {/* 削除 */}
      <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <Trash2 size={16} />
              チャンネルを削除
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              チャンネルと全てのメッセージが完全に削除されます。この操作は取り消せません。
            </p>
          </div>
          <button
            onClick={onDelete}
            disabled={isSystemChannel}
            className="px-4 py-2 bg-red-600/20 text-red-400 text-sm rounded-md hover:bg-red-600/30 border border-red-600/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSystemChannel ? '削除不可' : '削除'}
          </button>
        </div>
        {isSystemChannel && (
          <p className="text-xs text-red-400/60 mt-2">デフォルトチャンネルは削除できません。</p>
        )}
      </div>
    </div>
  );
}
