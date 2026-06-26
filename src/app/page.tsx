"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, ShieldCheck, LogIn, Code2 } from "lucide-react";
import { useAppStore } from "@/lib/appStore";

export default function HomePage() {
  const { authStatus } = useAppStore();
  const isAuthenticated = authStatus === "authenticated";

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center mb-10">
        <div className="inline-flex w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center text-blue-600 mb-4">
          <GraduationCap size={36} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
          e-ラーニング システム
        </h1>
        <p className="text-slate-500 font-bold">
          コース・カリキュラム・レッスンを管理／受講できる学習プラットフォーム
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        <Link
          href="/reskill"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
        >
          <BookOpen className="text-blue-600 mb-3" size={28} />
          <h2 className="font-black text-slate-800 mb-1">受講者ダッシュボード</h2>
          <p className="text-sm text-slate-500 font-bold">
            コース一覧・レッスン視聴
          </p>
        </Link>

        <Link
          href="/joho2"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
        >
          <Code2 className="text-purple-600 mb-3" size={28} />
          <h2 className="font-black text-slate-800 mb-1">情報2</h2>
          <p className="text-sm text-slate-500 font-bold">
            スライド＋Pythonで学ぶ情報講座
          </p>
        </Link>

        <Link
          href="/admin/elearning"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
        >
          <ShieldCheck className="text-emerald-600 mb-3" size={28} />
          <h2 className="font-black text-slate-800 mb-1">管理画面</h2>
          <p className="text-sm text-slate-500 font-bold">
            コース／カリキュラム／コンテンツ管理
          </p>
        </Link>
      </div>

      {!isAuthenticated && (
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-md"
        >
          <LogIn size={18} />
          ログイン
        </Link>
      )}
    </main>
  );
}
