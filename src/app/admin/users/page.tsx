'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Users, UserPlus, Pencil, Trash2, Loader2, ShieldCheck, GraduationCap,
  X, Check, Ban,
} from 'lucide-react';
import {
  listUsers, createUser, updateUser, deleteUser, type AdminUser,
} from '@/lib/admin/usersApi';

type Draft = {
  email: string;
  displayName: string;
  password: string;
  role: 'admin' | 'student';
};

const emptyDraft: Draft = { email: '', displayName: '', password: '', role: 'student' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editPassword, setEditPassword] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const handleCreate = async () => {
    if (!draft.email || !draft.password) {
      toast.error('メールアドレスとパスワードは必須です');
      return;
    }
    setBusy(true);
    try {
      await createUser(draft);
      toast.success('ユーザーを作成しました');
      setCreating(false);
      setDraft(emptyDraft);
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await updateUser(editing.uid, {
        displayName: editing.displayName,
        role: editing.role,
        disabled: editing.disabled,
        ...(editPassword ? { password: editPassword } : {}),
      });
      toast.success('ユーザーを更新しました');
      setEditing(null);
      setEditPassword('');
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`「${u.displayName || u.email}」を削除します。よろしいですか？\nこの操作は取り消せません。`)) return;
    setBusy(true);
    try {
      await deleteUser(u.uid);
      toast.success('ユーザーを削除しました');
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users size={24} className="text-amber-500" />
            ユーザー管理
          </h1>
          <p className="text-sm text-slate-500 mt-1">学習ページに入れるユーザーを登録・編集・削除します</p>
        </div>
        <button
          onClick={() => { setDraft(emptyDraft); setCreating(true); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <UserPlus size={18} /> ユーザーを追加
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> <span className="font-bold text-sm">読み込み中...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          <Users size={40} className="mx-auto mb-3" />
          <p className="font-bold">ユーザーがいません</p>
          <p className="text-xs mt-1">「ユーザーを追加」から登録してください。</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left font-bold px-5 py-3">ユーザー</th>
                <th className="text-left font-bold px-5 py-3">ロール</th>
                <th className="text-left font-bold px-5 py-3">状態</th>
                <th className="text-right font-bold px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        {(u.displayName || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{u.displayName || '（名前なし）'}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                        <ShieldCheck size={12} /> 管理者
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        <GraduationCap size={12} /> 受講者
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {u.disabled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                        <Ban size={12} /> 無効
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        <Check size={12} /> 有効
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing(u); setEditPassword(''); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={busy}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 作成モーダル */}
      {creating && (
        <Modal title="ユーザーを追加" onClose={() => setCreating(false)}>
          <Field label="メールアドレス *">
            <input
              type="email" value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="input" placeholder="student@example.com"
            />
          </Field>
          <Field label="表示名">
            <input
              type="text" value={draft.displayName}
              onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
              className="input" placeholder="山田 太郎"
            />
          </Field>
          <Field label="初期パスワード *（6文字以上）">
            <input
              type="text" value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              className="input" placeholder="初期パスワード"
            />
          </Field>
          <Field label="ロール">
            <RoleSelect value={draft.role} onChange={(role) => setDraft({ ...draft, role })} />
          </Field>
          <ModalActions onCancel={() => setCreating(false)} onSave={handleCreate} busy={busy} saveLabel="作成" />
        </Modal>
      )}

      {/* 編集モーダル */}
      {editing && (
        <Modal title="ユーザーを編集" onClose={() => setEditing(null)}>
          <Field label="メールアドレス">
            <input type="email" value={editing.email} disabled className="input bg-slate-50 text-slate-400" />
          </Field>
          <Field label="表示名">
            <input
              type="text" value={editing.displayName}
              onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="ロール">
            <RoleSelect value={editing.role} onChange={(role) => setEditing({ ...editing, role })} />
          </Field>
          <Field label="状態">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input
                type="checkbox" checked={editing.disabled}
                onChange={(e) => setEditing({ ...editing, disabled: e.target.checked })}
              />
              このユーザーを無効化する（ログイン不可）
            </label>
          </Field>
          <Field label="パスワードを再設定（変更する場合のみ入力）">
            <input
              type="text" value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              className="input" placeholder="新しいパスワード（6文字以上）"
            />
          </Field>
          <ModalActions onCancel={() => setEditing(null)} onSave={handleUpdate} busy={busy} saveLabel="保存" />
        </Modal>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { box-shadow: 0 0 0 2px #f59e0b; border-color: transparent; }
      `}</style>
    </div>
  );
}

// ---- 小物コンポーネント ----
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: 'admin' | 'student'; onChange: (r: 'admin' | 'student') => void }) {
  return (
    <div className="flex gap-2">
      {(['student', 'admin'] as const).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`flex-1 px-3 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
            value === r ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'
          }`}
        >
          {r === 'admin' ? '管理者' : '受講者'}
        </button>
      ))}
    </div>
  );
}

function ModalActions({ onCancel, onSave, busy, saveLabel }: { onCancel: () => void; onSave: () => void; busy: boolean; saveLabel: string }) {
  return (
    <div className="flex gap-2 pt-2">
      <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
        キャンセル
      </button>
      <button
        onClick={onSave}
        disabled={busy}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        {saveLabel}
      </button>
    </div>
  );
}
