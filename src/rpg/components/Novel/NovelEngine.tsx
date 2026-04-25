"use client";

import React, { useState } from 'react';
import { useRPGStore } from '@/rpg/store/rpgStore';

export default function NovelEngine() {
    const { setMode } = useRPGStore();
    const [step, setStep] = useState(0);

    const scenario = [
        { name: "案内人", text: "ようこそ、愛媛 Base RPG の世界へ！" },
        { name: "案内人", text: "ここでは愛媛の企業や仕事について学びながら冒険できるぞ。" },
        { name: "案内人", text: "まずは村の北にある「ITの塔」を目指すといいだろう。" },
    ];

    const next = () => {
        if (step < scenario.length - 1) {
            setStep(step + 1);
        } else {
            setMode('map');
        }
    };

    return (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-8">
            {/* 背景演出など */}
            <div className="flex-1 w-full max-w-2xl bg-slate-800 rounded-3xl border-2 border-slate-700 mb-8 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                {/* 立ち絵プレースホルダー */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-64 bg-zinc-700 border-x-2 border-t-2 border-zinc-600 rounded-t-full shadow-2xl" />
            </div>

            {/* メッセージウィンドウ */}
            <div
                onClick={next}
                className="w-full max-w-2xl bg-slate-950 border-4 border-slate-700 p-6 rounded-2xl cursor-pointer hover:border-blue-500 transition-all shadow-2xl"
            >
                <div className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full w-fit mb-2">
                    {scenario[step].name}
                </div>
                <p className="text-white text-lg font-bold leading-relaxed min-h-[4.5em]">
                    {scenario[step].text}
                </p>
                <div className="flex justify-end mt-2 animate-bounce">
                    <span className="text-blue-500 text-xs font-black">▼ NEXT</span>
                </div>
            </div>
        </div>
    );
}
