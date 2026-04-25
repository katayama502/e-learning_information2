"use client";

import React from 'react';
import { useRPGStore } from '@/rpg/store/rpgStore';
import { Shield, Sword, Zap, Brain, Briefcase } from 'lucide-react';

export default function MenuScreen() {
    const { player, setMode } = useRPGStore();

    return (
        <div className="w-full h-full bg-black/90 backdrop-blur-xl flex items-center justify-center p-8">
            <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden flex flex-col">
                {/* ヘッダー */}
                <div className="p-6 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white">ステータス</h2>
                        <p className="text-blue-400 text-xs font-bold">愛媛 Base RPG プロトタイプ</p>
                    </div>
                    <button
                        onClick={() => setMode('map')}
                        className="bg-white text-black px-4 py-1 rounded-full text-xs font-black uppercase hover:bg-slate-200"
                    >
                        Close
                    </button>
                </div>

                {/* キャラ情報 */}
                <div className="p-8 flex items-start gap-8">
                    <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-blue-400 shadow-lg overflow-hidden">
                        <img src="/rpg/hero_battle.png" className="w-full h-full object-cover scale-125" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <span className="text-zinc-500 text-[10px] font-black uppercase">Name</span>
                            <div className="text-2xl font-black text-white">{player.name}</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                                <span className="text-[10px] text-zinc-400 block">LEVEL</span>
                                <span className="text-lg font-black text-white">{player.level}</span>
                            </div>
                            <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 flex-1">
                                <span className="text-[10px] text-zinc-400 block">HP</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full" style={{ width: '100%' }} />
                                    </div>
                                    <span className="text-sm font-black text-white">{player.hp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* パラメータ */}
                <div className="p-8 bg-slate-950/50 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-900/30 rounded-lg text-red-500"><Sword size={18} /></div>
                        <div>
                            <span className="text-[10px] text-zinc-500 block">就活攻撃力</span>
                            <span className="font-black text-white">{player.attack}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-900/30 rounded-lg text-blue-500"><Shield size={18} /></div>
                        <div>
                            <span className="text-[10px] text-zinc-500 block">ストレス耐性</span>
                            <span className="font-black text-white">{player.defense}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-900/30 rounded-lg text-yellow-500"><Brain size={18} /></div>
                        <div>
                            <span className="text-[10px] text-zinc-500 block">企業知識度</span>
                            <span className="font-black text-white">{player.mp}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-500"><Briefcase size={18} /></div>
                        <div>
                            <span className="text-[10px] text-zinc-500 block">内定数</span>
                            <span className="font-black text-white">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
