'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Check, Video, FileText, Loader2 } from 'lucide-react';
import { ContentItem } from '@/data/mock_elearning_data';

interface ContentPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selectedItems: ContentItem[]) => void;
}

export default function ContentPicker({ isOpen, onClose, onSelect }: ContentPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [allContent, setAllContent] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real content from API
    useEffect(() => {
        if (!isOpen) return;
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/elearning/content?limit=500');
                if (res.ok) {
                    const data = await res.json();
                    const items = (data.data ?? data ?? []).map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        type: item.type || 'video',
                        url: item.youtube_url || item.url || '',
                        duration: item.duration || '',
                        category: item.category || '',
                        createdAt: item.created_at || '',
                    }));
                    setAllContent(items);
                }
            } catch (e) {
                console.error('Failed to fetch content:', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredContent = allContent.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleConfirm = () => {
        const items = allContent.filter(item => selectedIds.includes(item.id));
        onSelect(items);
        onClose();
        setSelectedIds([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900">コンテンツを選択</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="タイトルで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin text-blue-500" />
                        </div>
                    ) : filteredContent.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-bold">
                            {searchQuery ? '検索結果がありません' : 'コンテンツがありません'}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredContent.map(item => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleSelection(item.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border-2
                                            ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'}
                                        `}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                                            ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}
                                        `}>
                                            {isSelected && <Check size={14} strokeWidth={4} />}
                                        </div>

                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                            ${item.type === 'video' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}
                                        `}>
                                            {item.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                {item.category && <span>{item.category}</span>}
                                                {item.category && item.duration && <span>•</span>}
                                                {item.duration && <span>{item.duration}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
                    <span className="text-sm font-bold text-slate-500">
                        {selectedIds.length}件 選択中
                    </span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">キャンセル</button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg
                                ${selectedIds.length > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
                            `}
                        >
                            コースに追加
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
