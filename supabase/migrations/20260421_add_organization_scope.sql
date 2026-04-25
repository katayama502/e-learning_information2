-- ============================================
-- 企業の登録スコープ管理（access_tier）
-- ============================================
-- main側のコードが access_tier を使用しているため、これに合わせる。

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS access_tier TEXT
  NOT NULL DEFAULT 'full'
  CHECK (access_tier IN ('full', 'interviewship_only'));

COMMENT ON COLUMN public.organizations.access_tier IS
  '企業のアクセス権限。interviewship_only=インタビューシップ限定、full=フル機能';

CREATE INDEX IF NOT EXISTS idx_organizations_access_tier ON public.organizations(access_tier);
