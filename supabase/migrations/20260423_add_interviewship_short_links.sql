-- メール本文で使う短縮 URL のためのテーブル。
-- 例: /s/kawa → https://ehime-base-app.vercel.app/interviewship/forms/43fd3f56-...
-- slug は短く覚えやすい任意の文字列。

CREATE TABLE IF NOT EXISTS public.interviewship_short_links (
  slug text PRIMARY KEY,
  target_url text NOT NULL,
  label text,
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 既存の川之石・宇和島南フォームを短縮URLで参照できるよう seed
INSERT INTO public.interviewship_short_links (slug, target_url, label)
VALUES
  ('kawa', 'https://ehime-base-app.vercel.app/interviewship/forms/43fd3f56-98a7-46dd-96b6-076d0df43913', '2026川之石高校 参加申込'),
  ('uwa',  'https://ehime-base-app.vercel.app/interviewship/forms/59f3fec9-a0b2-4905-8fbc-2dd20fe8649f', '2026宇和島南高校 参加申込')
ON CONFLICT (slug) DO UPDATE
  SET target_url = EXCLUDED.target_url,
      label = EXCLUDED.label,
      updated_at = now();

ALTER TABLE public.interviewship_short_links ENABLE ROW LEVEL SECURITY;

-- 公開 SELECT のみ許可（Next.js 側のリダイレクトページ用）
DROP POLICY IF EXISTS "Short links are readable" ON public.interviewship_short_links;
CREATE POLICY "Short links are readable"
  ON public.interviewship_short_links FOR SELECT
  USING (true);
