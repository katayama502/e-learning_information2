"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, FileText, ArrowRight } from "lucide-react";

export default function AdminTopPage() {
  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
          管理画面
        </h1>
        <p className="text-slate-500 font-bold mb-8">
          e-ラーニングのコース／カリキュラム／コンテンツを管理します
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/elearning"
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <GraduationCap size={24} />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2">
                e-ラーニング管理
                <ArrowRight size={16} className="text-slate-400" />
              </h2>
              <p className="text-sm text-slate-500 font-bold">
                コース・カリキュラム・コンテンツの作成と編集
              </p>
            </div>
          </Link>

          <Link
            href="/admin/elearning/courses"
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <BookOpen size={24} />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2">
                コース一覧
                <ArrowRight size={16} className="text-slate-400" />
              </h2>
              <p className="text-sm text-slate-500 font-bold">
                登録済みコースの確認と編集
              </p>
            </div>
          </Link>

          <Link
            href="/admin/elearning/curriculums"
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2">
                カリキュラム管理
                <ArrowRight size={16} className="text-slate-400" />
              </h2>
              <p className="text-sm text-slate-500 font-bold">
                カリキュラムとレッスンの構成管理
              </p>
            </div>
          </Link>

          <Link
            href="/admin/elearning/content"
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-slate-800 mb-1 flex items-center gap-2">
                コンテンツ管理
                <ArrowRight size={16} className="text-slate-400" />
              </h2>
              <p className="text-sm text-slate-500 font-bold">
                動画／資料／クイズなどコンテンツの作成
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
