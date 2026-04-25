'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Shield, Users, Plus, GripVertical, Trash2, ChevronRight, Check, Settings } from 'lucide-react';
import { ALL_PERMISSIONS, PERMISSION_CATEGORIES, type WorkspaceRole, type PermissionKey } from '@/lib/permissions';
import { useCommunicationStore } from '@/lib/communicationStore';

interface Props {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}

type Tab = 'overview' | 'roles' | 'members';

export default function WorkspaceSettingsModal({ workspaceId, workspaceName, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('roles');
  const [roles, setRoles] = useState<WorkspaceRole[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ロール編集状態
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#99AAB5');
  const [editPermissions, setEditPermissions] = useState<Set<string>>(new Set());

  // 新規ロール
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#99AAB5');

  const fetchRoles = useCallback(async () => {
    const res = await fetch(`/api/communication/workspaces/${workspaceId}/roles`);
    if (res.ok) {
      const { data } = await res.json();
      setRoles(data || []);
    }
  }, [workspaceId]);

  const fetchMembers = useCallback(async () => {
    const res = await fetch(`/api/communication/workspaces/${workspaceId}`);
    if (res.ok) {
      const { data } = await res.json();
      setMembers(data?.members || []);
    }
  }, [workspaceId]);

  useEffect(() => {
    Promise.all([fetchRoles(), fetchMembers()]).finally(() => setLoading(false));
  }, [fetchRoles, fetchMembers]);

  // ロール選択時
  const selectRole = (role: WorkspaceRole) => {
    setSelectedRoleId(role.id);
    setEditName(role.name);
    setEditColor(role.color);
    setEditPermissions(new Set(role.permissions));
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // 権限トグル
  const togglePermission = (perm: string) => {
    setEditPermissions(prev => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  // ロール保存
  const saveRole = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      await fetch(`/api/communication/workspaces/${workspaceId}/roles/${selectedRoleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          color: editColor,
          permissions: Array.from(editPermissions),
        }),
      });
      await fetchRoles();
    } finally {
      setSaving(false);
    }
  };

  // 新規ロール作成
  const createRole = async () => {
    if (!newRoleName.trim()) return;
    setSaving(true);
    try {
      const slug = newRoleName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      await fetch(`/api/communication/workspaces/${workspaceId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          slug: slug || `custom_${Date.now()}`,
          color: newRoleColor,
          permissions: ['messages.send'],
        }),
      });
      await fetchRoles();
      setShowNewRole(false);
      setNewRoleName('');
    } finally {
      setSaving(false);
    }
  };

  // ロール削除
  const deleteRole = async (roleId: string) => {
    if (!confirm('このロールを削除しますか？')) return;
    await fetch(`/api/communication/workspaces/${workspaceId}/roles/${roleId}`, { method: 'DELETE' });
    setSelectedRoleId(null);
    await fetchRoles();
  };

  // メンバーにロール付与
  const assignRole = async (userId: string, roleId: string) => {
    await fetch(`/api/communication/workspaces/${workspaceId}/members/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId }),
    });
    await fetchMembers();
  };

  // メンバーからロール除去
  const removeRole = async (userId: string, roleId: string) => {
    await fetch(`/api/communication/workspaces/${workspaceId}/members/${userId}/roles?role_id=${roleId}`, {
      method: 'DELETE',
    });
    await fetchMembers();
  };

  const COLORS = ['#F47373', '#7B68EE', '#2ECC71', '#E67E22', '#3498DB', '#E91E63', '#00BCD4', '#FF9800', '#99AAB5', '#95A5A6'];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '概要', icon: <Settings size={18} /> },
    { id: 'roles', label: 'ロール', icon: <Shield size={18} /> },
    { id: 'members', label: 'メンバー', icon: <Users size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="relative flex w-[900px] max-w-[95vw] h-[600px] max-h-[85vh] rounded-xl bg-slate-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Left nav */}
        <div className="w-48 shrink-0 bg-slate-900 p-3 space-y-1">
          <h2 className="text-sm font-bold text-slate-400 px-3 py-2 uppercase tracking-wider truncate">
            {workspaceName}
          </h2>
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
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400">読み込み中...</div>
            ) : activeTab === 'roles' ? (
              <RolesTab
                roles={roles}
                selectedRoleId={selectedRoleId}
                selectedRole={selectedRole}
                editName={editName}
                editColor={editColor}
                editPermissions={editPermissions}
                saving={saving}
                showNewRole={showNewRole}
                newRoleName={newRoleName}
                newRoleColor={newRoleColor}
                colors={COLORS}
                onSelectRole={selectRole}
                onEditName={setEditName}
                onEditColor={setEditColor}
                onTogglePermission={togglePermission}
                onSaveRole={saveRole}
                onDeleteRole={deleteRole}
                onCreateRole={createRole}
                onShowNewRole={setShowNewRole}
                onNewRoleName={setNewRoleName}
                onNewRoleColor={setNewRoleColor}
              />
            ) : activeTab === 'members' ? (
              <MembersTab
                members={members}
                roles={roles}
                onAssignRole={assignRole}
                onRemoveRole={removeRole}
              />
            ) : (
              <OverviewTab workspaceName={workspaceName} memberCount={members.length} roleCount={roles.length} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ロールタブ
// ============================================================
function RolesTab({
  roles, selectedRoleId, selectedRole, editName, editColor, editPermissions, saving,
  showNewRole, newRoleName, newRoleColor, colors,
  onSelectRole, onEditName, onEditColor, onTogglePermission, onSaveRole, onDeleteRole,
  onCreateRole, onShowNewRole, onNewRoleName, onNewRoleColor,
}: any) {
  return (
    <div className="flex gap-4 h-full">
      {/* ロール一覧 */}
      <div className="w-56 shrink-0 space-y-1">
        <button
          onClick={() => onShowNewRole(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-blue-400 hover:bg-slate-700 transition-colors"
        >
          <Plus size={16} /> カスタムロールを作成
        </button>

        {showNewRole && (
          <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
            <input
              value={newRoleName}
              onChange={e => onNewRoleName(e.target.value)}
              placeholder="ロール名"
              className="w-full px-3 py-1.5 bg-slate-900 rounded text-sm text-white border border-slate-600 focus:border-blue-500 outline-none"
              autoFocus
            />
            <div className="flex gap-1 flex-wrap">
              {colors.map((c: string) => (
                <button
                  key={c}
                  onClick={() => onNewRoleColor(c)}
                  className={`w-5 h-5 rounded-full border-2 ${newRoleColor === c ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={onCreateRole} disabled={!newRoleName.trim()} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">
                作成
              </button>
              <button onClick={() => onShowNewRole(false)} className="px-3 py-1 text-slate-400 text-xs hover:text-white">
                キャンセル
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-slate-700 my-2" />

        {roles.map((role: WorkspaceRole) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              selectedRoleId === role.id ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
            <span className="truncate">{role.name}</span>
            {role.is_system && <span className="text-[10px] text-slate-500 ml-auto">組込</span>}
          </button>
        ))}
      </div>

      {/* ロール詳細 */}
      <div className="flex-1 min-w-0">
        {selectedRole ? (
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">ロール設定</h4>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">ロール名</label>
                  <input
                    value={editName}
                    onChange={e => onEditName(e.target.value)}
                    disabled={selectedRole.is_system}
                    className="w-full px-3 py-2 bg-slate-900 rounded text-sm text-white border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">カラー</label>
                  <div className="flex gap-1">
                    {colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => onEditColor(c)}
                        className={`w-6 h-6 rounded-full border-2 ${editColor === c ? 'border-white' : 'border-transparent'} hover:scale-110 transition-transform`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 権限 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">権限</h4>
              {selectedRole.slug === 'owner' ? (
                <p className="text-sm text-slate-400">オーナーは全権限を持ちます（変更不可）</p>
              ) : (
                <div className="space-y-4">
                  {PERMISSION_CATEGORIES.map(category => (
                    <div key={category.name}>
                      <h5 className="text-xs font-semibold text-slate-400 mb-2">{category.name}</h5>
                      <div className="space-y-1">
                        {category.permissions.map(perm => (
                          <label
                            key={perm}
                            className="flex items-center justify-between px-3 py-2 rounded hover:bg-slate-700/50 cursor-pointer group"
                          >
                            <div>
                              <span className="text-sm text-slate-200">{ALL_PERMISSIONS[perm]}</span>
                              <span className="text-xs text-slate-500 ml-2">{perm}</span>
                            </div>
                            <button
                              onClick={() => onTogglePermission(perm)}
                              className={`w-10 h-5 rounded-full relative transition-colors ${
                                editPermissions.has(perm) ? 'bg-green-500' : 'bg-slate-600'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                                editPermissions.has(perm) ? 'left-5' : 'left-0.5'
                              }`} />
                            </button>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* アクションバー */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              {!selectedRole.is_system && (
                <button
                  onClick={() => onDeleteRole(selectedRole.id)}
                  className="flex items-center gap-1 text-red-400 text-sm hover:text-red-300"
                >
                  <Trash2 size={14} /> 削除
                </button>
              )}
              <div className="ml-auto">
                <button
                  onClick={onSaveRole}
                  disabled={saving || selectedRole.slug === 'owner'}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? '保存中...' : '変更を保存'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            左からロールを選択してください
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// メンバータブ
// ============================================================
function MembersTab({ members, roles, onAssignRole, onRemoveRole }: any) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400 mb-4">メンバー数: {members.length}人</p>
      {members.map((member: any) => (
        <div key={member.user_id} className="flex items-center justify-between px-4 py-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50">
          <div className="flex items-center gap-3">
            <img
              src={member.profile?.avatar_url || '/images/defaults/default_user_avatar.png'}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium text-white">{member.profile?.full_name || member.nickname || '不明'}</div>
              <div className="text-xs text-slate-400">{member.profile?.email || ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 現在のロール表示 */}
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: roles.find((r: any) => r.slug === member.role)?.color + '33' || '#99AAB533',
                color: roles.find((r: any) => r.slug === member.role)?.color || '#99AAB5',
              }}
            >
              {roles.find((r: any) => r.slug === member.role)?.name || member.role}
            </span>

            {/* ロール変更ボタン */}
            <div className="relative">
              <button
                onClick={() => setShowRolePicker(showRolePicker === member.user_id ? null : member.user_id)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
                title="ロールを変更"
              >
                <Shield size={14} />
              </button>

              {showRolePicker === member.user_id && (
                <div className="absolute right-0 top-8 z-50 w-48 bg-slate-900 rounded-lg shadow-xl border border-slate-700 p-1">
                  {roles.map((role: WorkspaceRole) => {
                    const isAssigned = role.slug === member.role;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          onAssignRole(member.user_id, role.id);
                          setShowRolePicker(null);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                          isAssigned ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.color }} />
                        <span className="truncate">{role.name}</span>
                        {isAssigned && <Check size={14} className="ml-auto text-green-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 概要タブ
// ============================================================
function OverviewTab({ workspaceName, memberCount, roleCount }: { workspaceName: string; memberCount: number; roleCount: number }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">ワークスペース情報</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-700/30 rounded-lg">
            <span className="text-sm text-slate-400">名前</span>
            <span className="text-sm text-white font-medium">{workspaceName}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-slate-700/30 rounded-lg">
            <span className="text-sm text-slate-400">メンバー数</span>
            <span className="text-sm text-white font-medium">{memberCount}人</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-slate-700/30 rounded-lg">
            <span className="text-sm text-slate-400">ロール数</span>
            <span className="text-sm text-white font-medium">{roleCount}個</span>
          </div>
        </div>
      </div>
    </div>
  );
}
