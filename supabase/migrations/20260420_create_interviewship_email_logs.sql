-- ============================================
-- インタビューシップ メール送信履歴
-- ============================================

CREATE TABLE IF NOT EXISTS public.interviewship_email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_type TEXT NOT NULL CHECK (email_type IN ('account_invite', 'password_reset', 'reminder', 'bulk_resend', 'manual')),
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body_preview TEXT,                              -- 本文の先頭数百文字（プレビュー用）
  company_id UUID REFERENCES public.interviewship_companies(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.interviewship_programs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  resend_id TEXT,                                 -- Resend APIが返すID（将来のトラッキング用）
  sent_by UUID REFERENCES auth.users,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.interviewship_email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interviewship admins can view email logs"
  ON public.interviewship_email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert email logs"
  ON public.interviewship_email_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_iel_company ON public.interviewship_email_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_iel_sent_at ON public.interviewship_email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_iel_type ON public.interviewship_email_logs(email_type);

-- 企業に「最終メール送信日時」と「アカウント発行済みフラグ」を追加
ALTER TABLE public.interviewship_companies
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;

COMMENT ON COLUMN public.interviewship_companies.last_email_sent_at IS '最後に送信したアカウント系メールの日時';
COMMENT ON COLUMN public.interviewship_companies.account_created_at IS 'Auth.usersにアカウントが作成された日時';
COMMENT ON COLUMN public.interviewship_companies.user_id IS 'Auth.usersの紐付け';
