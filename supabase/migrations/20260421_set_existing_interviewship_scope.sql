-- ============================================
-- 既存のインタビューシップ登録企業を interviewship_only に設定
-- ============================================

UPDATE public.organizations
SET access_tier = 'interviewship_only'
WHERE id IN (
  SELECT DISTINCT organization_id
  FROM public.interviewship_companies
);
