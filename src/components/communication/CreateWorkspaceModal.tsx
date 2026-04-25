'use client';

import React, { useState, useRef } from 'react';
import { X, Loader2, Upload, ImagePlus } from 'lucide-react';
import { useCommunicationStore } from '@/lib/communicationStore';
import { createClient } from '@/utils/supabase/client';

interface CreateWorkspaceModalProps {
  onClose: () => void;
}

export default function CreateWorkspaceModal({
  onClose,
}: CreateWorkspaceModalProps) {
  const { createWorkspace } = useCommunicationStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください');
      return;
    }
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
    setIconUrl(''); // URL入力をクリア
  };

  const uploadIcon = async (): Promise<string | undefined> => {
    if (!iconFile) return iconUrl.trim() || undefined;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const ext = iconFile.name.split('.').pop() || 'png';
      const path = `${user.id}/ws-icon-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('workspace-assets')
        .upload(path, iconFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('workspace-assets')
        .getPublicUrl(path);

      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ワークスペース名を入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const finalIconUrl = await uploadIcon();
      await createWorkspace(name.trim(), description.trim(), finalIconUrl);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? '作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            ワークスペースを作成
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-300">
              ワークスペース名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 開発チーム"
              autoFocus
              className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-300">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="このワークスペースの目的を記入..."
              rows={3}
              className="w-full resize-none rounded bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-300">
              アイコン
            </label>
            <div className="flex items-center gap-4">
              {/* プレビュー / アップロードボタン */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700 border-2 border-dashed border-slate-500 hover:border-blue-500 transition-colors overflow-hidden group"
              >
                {(iconPreview || iconUrl) ? (
                  <img
                    src={iconPreview || iconUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <ImagePlus size={24} className="text-slate-400 group-hover:text-blue-400" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">クリックして画像をアップロード</p>
                <p className="text-xs text-slate-500">PNG, JPG, GIF (5MB以下)</p>
                {iconFile && (
                  <p className="text-xs text-green-400 mt-1">{iconFile.name}</p>
                )}
              </div>
            </div>
            {/* URL直接入力（折りたたみ） */}
            {!iconFile && (
              <div className="mt-2">
                <input
                  type="url"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="または画像URLを直接入力..."
                  className="w-full rounded bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
