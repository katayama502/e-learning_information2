"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, ArrowRight } from "lucide-react";

export default function AdminTopPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">管理ホーム</h1>
                <p className="text-slate-500 font-bold mt-1">
                    リスキル大学のコース・コンテンツを管理します
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                    href="/admin/elearning"
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex items-start gap-4 group"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <GraduationCap size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                            トラック管理
                            <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </h2>
                        <p className="text-sm text-slate-500 font-bold">
                            学習トラック（カリキュラム）の作成・編集・公開管理
                        </p>
                    </div>
                </Link>

                <Link
                    href="/admin/elearning/content"
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all flex items-start gap-4 group"
                >
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <BookOpen size={24} />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                            コンテンツ管理
                            <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </h2>
                        <p className="text-sm text-slate-500 font-bold">
                            動画レッスン・クイズ・CSVインポートなどコンテンツ管理
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
