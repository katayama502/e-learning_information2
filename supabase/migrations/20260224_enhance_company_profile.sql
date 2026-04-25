-- 企業情報の拡充と不一致解消のためのカラム追加
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS philosophy text, -- 企業理念
ADD COLUMN IF NOT EXISTS rjp_positives text, -- 魅力・やりがい
ADD COLUMN IF NOT EXISTS access text, -- 最寄り駅・アクセス
ADD COLUMN IF NOT EXISTS sns_links jsonb DEFAULT '{}', -- SNSリンク (JSON)
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}', -- 追加の画像ギャラリー
ADD COLUMN IF NOT EXISTS message_to_seekers text; -- 求職者へのメッセージ

-- representative_name, established_date, website_url, business_content は
-- 過去のマイグレーションで追加済み、または seed で使用されていることを確認していますが、
-- 確実に存在させるために追加（重複は無視される）
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS representative_name text,
ADD COLUMN IF NOT EXISTS established_date text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS business_content text;
