-- ============================================
-- 短期バイト募集・送客管理（staffing_*）
-- ============================================
-- 有料職業紹介事業の管理簿出力に対応するための基盤テーブル群。
-- クライアント企業（オフィスマリ・同友会など）はこれまで通り organizations を流用し、
-- 短期バイト求人企業として管理する場合は is_staffing_client フラグ + staffing_client_settings を持つ。

-- 1. organizations 拡張
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_staffing_client BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.organizations.is_staffing_client IS
  '短期バイトの求人企業（クライアント）として管理する場合 true。詳細設定は staffing_client_settings。';

CREATE INDEX IF NOT EXISTS idx_organizations_is_staffing_client
  ON public.organizations(is_staffing_client)
  WHERE is_staffing_client = true;

-- 2. staffing_client_settings: 求人企業ごとの送付先・契約情報
CREATE TABLE IF NOT EXISTS public.staffing_client_settings (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_to_email TEXT,                          -- 名簿送付先（例：ktakagi@office-mari.co.jp）
  report_to_name TEXT,                           -- 宛名（例：富岡 様）
  report_cc TEXT[] NOT NULL DEFAULT '{}',        -- cc 一覧
  report_sender_name TEXT,                       -- 送信者署名（例：舟戸妃呂子）
  report_sender_email TEXT,                      -- Reply-To（例：funato.tapst@gmail.com）
  contract_type TEXT NOT NULL DEFAULT 'introduction'
    CHECK (contract_type IN ('introduction', 'dispatch')),  -- 有料職業紹介 / 派遣
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staffing_client_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages staffing_client_settings" ON public.staffing_client_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 3. staffing_workers: 短期バイト応募者（求職者）
CREATE TABLE IF NOT EXISTS public.staffing_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Ehime Base ユーザーと紐付く場合
  name TEXT NOT NULL,
  name_kana TEXT,
  gender TEXT CHECK (gender IN ('男', '女', 'その他', '回答しない')),
  birth_date DATE,
  attribute TEXT CHECK (attribute IN ('社会人', '学生', 'その他')),  -- 名簿の「属性」列
  phone TEXT,
  email TEXT,
  postal_code TEXT,
  address TEXT,
  occupation TEXT,                                 -- 職業 / 学校名
  emergency_contact TEXT,                          -- 緊急連絡先
  source TEXT,                                     -- 流入元: 'instagram' | 'line_eis_baito' | 'line_eis' | 'referral' | 'other'
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'interview_scheduled', 'approved', 'rejected', 'inactive')),
  notes TEXT,                                      -- 管理者メモ
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staffing_workers_status ON public.staffing_workers(status);
CREATE INDEX IF NOT EXISTS idx_staffing_workers_user_id ON public.staffing_workers(user_id);

ALTER TABLE public.staffing_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages staffing_workers" ON public.staffing_workers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 公開フォームから登録できるように INSERT は誰でも許可（service role 経由でも可）
CREATE POLICY "Anyone can apply" ON public.staffing_workers
  FOR INSERT WITH CHECK (true);

-- 4. staffing_jobs: 求人案件
CREATE TABLE IF NOT EXISTS public.staffing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,                              -- 例：4月通行量調査
  description TEXT,
  location TEXT,
  hourly_wage INTEGER,                              -- 時給（円）
  fee_per_worker INTEGER,                           -- 1人あたり紹介手数料
  status TEXT NOT NULL DEFAULT 'recruiting'
    CHECK (status IN ('draft', 'recruiting', 'closed', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staffing_jobs_client ON public.staffing_jobs(client_organization_id);
CREATE INDEX IF NOT EXISTS idx_staffing_jobs_status ON public.staffing_jobs(status);

ALTER TABLE public.staffing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages staffing_jobs" ON public.staffing_jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 5. staffing_shifts: 案件のシフト（日付×時間帯）
CREATE TABLE IF NOT EXISTS public.staffing_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.staffing_jobs(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,              -- 必要人数
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staffing_shifts_job ON public.staffing_shifts(job_id);
CREATE INDEX IF NOT EXISTS idx_staffing_shifts_date ON public.staffing_shifts(shift_date);

ALTER TABLE public.staffing_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages staffing_shifts" ON public.staffing_shifts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 6. staffing_assignments: 応募者 × シフトのアサイン
CREATE TABLE IF NOT EXISTS public.staffing_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.staffing_workers(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.staffing_shifts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('proposed', 'confirmed', 'attended', 'no_show', 'cancelled')),
  attended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, shift_id)
);

CREATE INDEX IF NOT EXISTS idx_staffing_assignments_worker ON public.staffing_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_staffing_assignments_shift ON public.staffing_assignments(shift_id);

ALTER TABLE public.staffing_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages staffing_assignments" ON public.staffing_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 7. updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION public.staffing_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  CREATE TRIGGER trg_staffing_workers_updated_at BEFORE UPDATE ON public.staffing_workers
    FOR EACH ROW EXECUTE FUNCTION public.staffing_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  CREATE TRIGGER trg_staffing_jobs_updated_at BEFORE UPDATE ON public.staffing_jobs
    FOR EACH ROW EXECUTE FUNCTION public.staffing_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  CREATE TRIGGER trg_staffing_assignments_updated_at BEFORE UPDATE ON public.staffing_assignments
    FOR EACH ROW EXECUTE FUNCTION public.staffing_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
BEGIN
  CREATE TRIGGER trg_staffing_client_settings_updated_at BEFORE UPDATE ON public.staffing_client_settings
    FOR EACH ROW EXECUTE FUNCTION public.staffing_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
