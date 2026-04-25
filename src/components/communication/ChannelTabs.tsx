'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ExternalLink, StickyNote, X, Pencil, Trash2, Link2, Save, Loader2 } from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  type: 'url' | 'note';
  url?: string;
  content?: string;
  icon?: string;
  position: number;
}

interface ChannelTabsProps {
  channelId: string;
  isAdmin?: boolean;
}

export default function ChannelTabs({ channelId, isAdmin }: ChannelTabsProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'url' | 'note'>('url');
  const [formUrl, setFormUrl] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!channelId) return;
    fetchTabs();
  }, [channelId]);

  const fetchTabs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/communication/channels/${channelId}/tabs`);
      if (res.ok) {
        const { data } = await res.json();
        setTabs(data ?? []);
      }
    } catch (e) {
      console.error('Failed to fetch tabs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/communication/channels/${channelId}/tabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          type: formType,
          url: formType === 'url' ? formUrl : undefined,
          content: formType === 'note' ? formContent : undefined,
          icon: formIcon || undefined,
        }),
      });
      if (res.ok) {
        await fetchTabs();
        resetForm();
        setShowAddModal(false);
      }
    } catch (e) {
      console.error('Failed to add tab:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingTab) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/communication/channels/${channelId}/tabs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab_id: editingTab.id,
          name: formName.trim(),
          url: formType === 'url' ? formUrl : undefined,
          content: formType === 'note' ? formContent : undefined,
          icon: formIcon || undefined,
        }),
      });
      if (res.ok) {
        await fetchTabs();
        resetForm();
        setEditingTab(null);
      }
    } catch (e) {
      console.error('Failed to update tab:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (tabId: string) => {
    try {
      await fetch(`/api/communication/channels/${channelId}/tabs?tab_id=${tabId}`, {
        method: 'DELETE',
      });
      setTabs(prev => prev.filter(t => t.id !== tabId));
      if (activeNoteId === tabId) setActiveNoteId(null);
    } catch (e) {
      console.error('Failed to delete tab:', e);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormType('url');
    setFormUrl('');
    setFormContent('');
    setFormIcon('');
  };

  const startEdit = (tab: Tab) => {
    setEditingTab(tab);
    setFormName(tab.name);
    setFormType(tab.type);
    setFormUrl(tab.url || '');
    setFormContent(tab.content || '');
    setFormIcon(tab.icon || '');
  };

  const handleTabClick = (tab: Tab) => {
    if (tab.type === 'url' && tab.url) {
      window.open(tab.url, '_blank', 'noopener,noreferrer');
    } else if (tab.type === 'note') {
      setActiveNoteId(activeNoteId === tab.id ? null : tab.id);
    }
  };

  const activeNote = tabs.find(t => t.id === activeNoteId);

  if (tabs.length === 0 && !isAdmin) return null;

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-800/50 border-b border-slate-700/50 overflow-x-auto scrollbar-thin">
        {tabs.map(tab => (
          <div key={tab.id} className="group flex items-center gap-1">
            <button
              onClick={() => handleTabClick(tab)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeNoteId === tab.id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.icon ? (
                <span>{tab.icon}</span>
              ) : tab.type === 'url' ? (
                <ExternalLink size={12} />
              ) : (
                <StickyNote size={12} />
              )}
              <span className="truncate max-w-[100px]">{tab.name}</span>
            </button>
            {isAdmin && (
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button onClick={() => startEdit(tab)} className="p-0.5 text-slate-500 hover:text-white">
                  <Pencil size={10} />
                </button>
                <button onClick={() => handleDelete(tab.id)} className="p-0.5 text-slate-500 hover:text-red-400">
                  <Trash2 size={10} />
                </button>
              </div>
            )}
          </div>
        ))}
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <Plus size={12} />
            <span>タブ追加</span>
          </button>
        )}
      </div>

      {/* Note content area */}
      {activeNote && (
        <div className="bg-slate-800/30 border-b border-slate-700/50 px-4 py-3 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <StickyNote size={14} className="text-yellow-400" />
              {activeNote.name}
            </h4>
            <button onClick={() => setActiveNoteId(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {activeNote.content || '（内容なし）'}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingTab) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setShowAddModal(false); setEditingTab(null); resetForm(); }}>
          <div className="w-full max-w-md rounded-xl bg-slate-800 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">{editingTab ? 'タブを編集' : 'タブを追加'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingTab(null); resetForm(); }} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {!editingTab && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">タイプ</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormType('url')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        formType === 'url' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <Link2 size={16} /> URLリンク
                    </button>
                    <button
                      onClick={() => setFormType('note')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        formType === 'note' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <StickyNote size={16} /> ノート
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-400 mb-1">名前</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="例: 企業HP、議事録メモ"
                  className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">アイコン（絵文字）</label>
                <input
                  type="text"
                  value={formIcon}
                  onChange={e => setFormIcon(e.target.value)}
                  placeholder="🌐"
                  className="w-20 rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              {formType === 'url' ? (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">URL</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">ノート内容</label>
                  <textarea
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    placeholder="メモを入力..."
                    rows={5}
                    className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowAddModal(false); setEditingTab(null); resetForm(); }}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  disabled={!formName.trim() || isSaving}
                  onClick={editingTab ? handleUpdate : handleAdd}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editingTab ? '更新' : '追加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
