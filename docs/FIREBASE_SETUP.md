# Firebase + 認証・管理ボード セットアップ手順

このアプリは **Firebase（Authentication + Cloud Firestore）** を使い、
- ログイン機能（サインアップ無し。アカウントは管理者が発行）
- 管理者が登録した有効ユーザーのみ学習ページにアクセス可能
- ユーザーごとの学習進捗（XP・合格レッスン）を保存
- 管理ボードでの「ユーザー」と「カリキュラム」のCRUD

を実現します。

---

## 1. Firebaseプロジェクトを作成

1. [Firebase コンソール](https://console.firebase.google.com/) で新規プロジェクトを作成
2. **Authentication** を有効化 → 「Sign-in method」で **メール/パスワード** を有効化
3. **Cloud Firestore** を作成（本番モードで開始）
4. プロジェクト設定 → 「マイアプリ」で **ウェブアプリ（</>）** を追加し、`firebaseConfig` の値を控える

---

## 2. サービスアカウント鍵を取得（サーバー側 / 管理者操作用）

1. プロジェクト設定 → **サービスアカウント** タブ
2. 「新しい秘密鍵を生成」でJSONをダウンロード
3. JSON内の `project_id` / `client_email` / `private_key` を使用

---

## 3. 環境変数を設定

ローカルは `.env.local`、本番は **Netlify の環境変数** に同じ値を設定します（`.env.example` 参照）。

| 変数 | 用途 |
|------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` ほか `NEXT_PUBLIC_FIREBASE_*` | クライアント設定（手順1のfirebaseConfig） |
| `FIREBASE_PROJECT_ID` | サービスアカウントの `project_id` |
| `FIREBASE_CLIENT_EMAIL` | サービスアカウントの `client_email` |
| `FIREBASE_PRIVATE_KEY` | サービスアカウントの `private_key`（改行を `\n` にした一行。Netlifyではダブルクオートで囲む） |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | 初期管理者（シード用） |

> **注意**: `FIREBASE_PRIVATE_KEY` は `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` の形式。

---

## 4. Firestore セキュリティルールを適用

リポジトリ同梱の [`firestore.rules`](../firestore.rules) の内容を
Firebase コンソール → Firestore → **ルール** に貼り付けて「公開」します。

- `users` / `progress` … 本人・管理者のみ
- `units` / `materials` … ログインユーザーは閲覧、管理者（カスタムクレーム `admin`）のみ編集

---

## 5. 初期データを投入（管理者 + 36レッスン）

`.env.local` に Firebase Admin と `ADMIN_*` を設定したうえで:

```bash
npm run seed
```

実行すると以下が行われます。

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` で **初期管理者** を作成（`role=admin`・カスタムクレーム付与）
- 既存の **5ユニット / 36教材** を Firestore（`units` / `materials`）に投入

---

## 6. 起動・ログイン

```bash
npm run dev
```

1. `/login` で初期管理者のメール・パスワードでログイン
2. 管理者はサイドバー / `/admin` から **管理ボード** に入れる
   - **ユーザー管理**: 受講者・管理者の追加 / 編集（表示名・ロール・有効無効・パスワード再設定）/ 削除
   - **カリキュラム管理**: ユニット・教材（スライドURL・Pythonコード・確認テスト）の追加 / 編集 / 削除
3. 管理者が作成した受講者アカウントでログインすると、学習ページ（`/joho2`）にアクセスでき、進捗が個別に保存されます

---

## アーキテクチャ概要

| 領域 | 実装 |
|------|------|
| 認証 | Firebase Auth（メール/パスワード）/ `src/lib/auth/AuthProvider.tsx` |
| アクセス制御 | `src/components/auth/RequireAuth.tsx`（学習ページ・管理ボードをガード） |
| 進捗 | Firestore `progress/{uid}` / `src/lib/progress/ProgressProvider.tsx` |
| カリキュラム | Firestore `units` `materials` / `src/lib/curriculum/*` |
| ユーザー管理API | `src/app/api/admin/users/**`（Admin SDKで作成・削除、Bearerトークン検証） |
| 初期シード | `scripts/seed.ts`（`npm run seed`） |
