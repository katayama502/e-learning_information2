-- ============================================
-- 短期バイト Phase 1.5: リマインド・添付・キャンセル連動
-- ============================================

-- 1. staffing_jobs にリマインド・連絡先・テンプレ追加
ALTER TABLE public.staffing_jobs
  ADD COLUMN IF NOT EXISTS work_type TEXT,                          -- 例: 通行量調査 / 書類封入
  ADD COLUMN IF NOT EXISTS meeting_place_address TEXT,              -- 例: ISSEIビル 入口前 (松山市三番町1丁目11-10)
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,             -- 例: 川本
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,            -- 例: 09095505962
  ADD COLUMN IF NOT EXISTS reminder_template TEXT,                  -- 案件固有のリマインド本文（変数置換あり）
  ADD COLUMN IF NOT EXISTS public_description TEXT;                 -- 求職者向け公開説明（持参物・服装等）

COMMENT ON COLUMN public.staffing_jobs.reminder_template IS
  '使える変数: {{prefix}} {{shift_date}} {{shift_time}} {{meeting_time}} {{meeting_place}} {{work_type}} {{emergency_contact_name}} {{emergency_contact_phone}}';

-- 2. staffing_shifts に集合時間
ALTER TABLE public.staffing_shifts
  ADD COLUMN IF NOT EXISTS meeting_time TIME;                       -- 業務開始時刻 (start_time) と別管理

-- 3. 案件添付ファイル（集合場所案内、当日の動き等）
CREATE TABLE IF NOT EXISTS public.staffing_job_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.staffing_jobs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,                                          -- 表示名
  file_path TEXT NOT NULL,                                          -- storage 上のキー (staffing-attachments/{job_id}/{uuid}.pdf)
  file_url TEXT NOT NULL,                                           -- public URL
  content_type TEXT,
  size_bytes INTEGER,
  kind TEXT NOT NULL DEFAULT 'other'
    CHECK (kind IN ('meeting_place', 'day_of_flow', 'other')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staffing_job_attachments_job ON public.staffing_job_attachments(job_id);

ALTER TABLE public.staffing_job_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages staffing_job_attachments" ON public.staffing_job_attachments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

CREATE POLICY "Authenticated users can view attachments" ON public.staffing_job_attachments
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. リマインド送信履歴（誰に・いつ・どの種類で送ったか）
CREATE TABLE IF NOT EXISTS public.staffing_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.staffing_jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.staffing_workers(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('week_before', 'day_before', 'cancel_filled', 'custom')),
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'line', 'sms')),
  to_address TEXT,
  subject TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_staffing_reminders_job ON public.staffing_reminders(job_id);
CREATE INDEX IF NOT EXISTS idx_staffing_reminders_worker ON public.staffing_reminders(worker_id);

ALTER TABLE public.staffing_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages staffing_reminders" ON public.staffing_reminders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 5. ストレージバケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('staffing-attachments', 'staffing-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read staffing-attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'staffing-attachments');

CREATE POLICY "Authenticated upload staffing-attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'staffing-attachments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated delete staffing-attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'staffing-attachments'
    AND auth.role() = 'authenticated'
  );
