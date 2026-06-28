import 'server-only';

// ============================================================
//  Firebase Admin SDK 初期化（サーバー側のみ）
//  ユーザーの作成・削除・カスタムクレーム付与に使用。
//  サービスアカウント鍵は環境変数（Netlify）から読み込む。
//    FIREBASE_PROJECT_ID
//    FIREBASE_CLIENT_EMAIL
//    FIREBASE_PRIVATE_KEY   ← 改行を \n でエスケープした文字列
// ============================================================

import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Netlify等では改行が \n 文字として保存されるため復元する
  // Netlify等では改行が \n 文字として保存されるため復元する。
  // 環境変数をダブルクォートで囲んだまま貼り付けた場合の前後クォートも除去する。
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
  const privateKey = rawKey.replace(/^"([\s\S]*)"$/, '$1').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin の環境変数が未設定です（FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY）'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminAuth = (): Auth => getAuth(getAdminApp());
export const adminDb = (): Firestore => getFirestore(getAdminApp());
