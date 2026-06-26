# e-ラーニング システム

Ehime Base アプリの **e-ラーニング機能のみ** を抽出した、独立して動作する Next.js プロジェクトです。

- **受講者向け**: コース閲覧・レッスン視聴
- **管理者向け**: コース／カリキュラム／コンテンツの作成・編集

---

## 必要環境

| ツール | バージョン |
|--------|------------|
| Node.js | 20 以上 |
| npm | 10 以上 |
| Supabase アカウント | 無料プランで OK |

---

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase プロジェクトの作成

1. <https://supabase.com> にログインし、新しいプロジェクトを作成
2. **Project Settings → API** から以下を取得
   - `Project URL`
   - `anon public` キー
   - `service_role` キー（管理操作用、絶対に公開しないこと）

### 3. 環境変数の設定

`.env.example` を `.env.local` にコピーして編集します。

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. データベースのセットアップ

`supabase/migrations/` に SQL マイグレーションが入っています。
Supabase ダッシュボードの **SQL Editor** で以下を順番に実行してください。

**最低限 e-ラーニング機能を動かすために必要なもの：**

```
supabase/migrations/20240122_add_elearning_tables.sql
supabase/migrations/20240123_fix_public_rls.sql
supabase/migrations/20260128_fix_elearning_rls.sql
supabase/migrations/20260128_add_elearning_constraints.sql
supabase/migrations/20260128_add_thumbnail_to_curriculums.sql
supabase/migrations/20260129_add_lesson_options.sql
supabase/migrations/20260130_add_course_view_count_and_tags.sql
supabase/migrations/20260130_add_lesson_columns.sql
supabase/migrations/20260130100000_add_lesson_flags.sql
supabase/migrations/20260201_add_category_to_curriculums.sql
supabase/migrations/20260203_add_course_status.sql
supabase/migrations/20260208_add_module_is_public.sql
supabase/migrations/20260215_allow_null_curriculum_id.sql
```

> **補足**: 他のマイグレーション（profiles テーブル等）も同梱されています。
> 認証・プロフィール周辺で参照されるため、すべて適用することを推奨します。

### 5. 管理者ユーザーの作成

管理画面 (`/admin/elearning`) は `profiles.user_type = 'admin'` のユーザーのみアクセス可能です。

1. Supabase ダッシュボード → **Authentication → Users** で新規ユーザーを作成
2. **SQL Editor** で以下を実行（メールアドレスは作成したユーザーのもの）

```sql
insert into profiles (id, email, user_type)
select id, email, 'admin' from auth.users where email = 'your-admin@example.com'
on conflict (id) do update set user_type = 'admin';
```

### 6. 開発サーバー起動

```bash
npm run dev
```

ブラウザで <http://localhost:3000> を開きます。

---

## 主な画面

| URL | 内容 |
|-----|------|
| `/` | トップページ（受講者／管理者の入口） |
| `/login` | ログイン画面 |
| `/reskill` | 受講者ダッシュボード（コース一覧） |
| `/reskill/course/[id]` | コース詳細・レッスン一覧 |
| `/reskill/lesson/[id]` | レッスン視聴画面 |
| `/elearning` | e-ラーニング案内ページ |
| `/admin/elearning` | 管理画面トップ |
| `/admin/elearning/courses` | コース管理 |
| `/admin/elearning/curriculums` | カリキュラム管理 |
| `/admin/elearning/content` | コンテンツ管理 |

---

## ディレクトリ構成

```
e-ラーニング/
├── src/
│   ├── app/
│   │   ├── elearning/        # 受講者入口ページ
│   │   ├── reskill/          # 受講者ダッシュボード
│   │   ├── admin/elearning/  # 管理画面
│   │   ├── api/elearning/    # API ルート
│   │   ├── login/            # ログイン
│   │   └── auth/             # 認証コールバック
│   ├── components/           # UI コンポーネント
│   ├── lib/                  # 状態管理・ユーティリティ
│   ├── services/elearning.ts # e-ラーニングサービス層
│   └── utils/supabase/       # Supabase クライアント
├── supabase/migrations/      # DB マイグレーション
├── public/                   # 静的素材（コースサムネ等）
└── .env.example              # 環境変数テンプレート
```

---

## トラブルシュート

### ログインしても `/admin/elearning` で 403 になる
→ `profiles.user_type = 'admin'` が設定されているか確認してください（手順 5）。

### コースが表示されない
→ `courses` テーブルに `status = 'published'` のレコードがあるか確認してください。
管理画面 (`/admin/elearning`) からコースを新規作成できます。

### ビルドエラーが出る
→ `node_modules` と `package-lock.json` を削除して `npm install` をやり直してください。

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 注意

- このコードは Ehime Base アプリ（合同会社EIS）から e-ラーニング機能だけを抽出したものです。
- e-ラーニング以外のモジュール（求人・コミュニティ等）のコードも一部残っていますが、
  メニューから外しているのでアクセスされません。
- 共有先での利用範囲は提供元と相談してください。
# E-learning.v1
# e-learning_information2
