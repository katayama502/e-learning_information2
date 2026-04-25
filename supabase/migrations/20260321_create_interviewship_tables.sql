-- ============================================
-- インタビューシップ機能 テーブル作成
-- ============================================

-- 1. インタビューシップ管理者
CREATE TABLE IF NOT EXISTS public.interviewship_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.interviewship_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view interviewship admins"
  ON public.interviewship_admins FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage interviewship admins"
  ON public.interviewship_admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid() AND ia.role = 'admin'
    )
  );

-- 2. インタビューシップ企業（ベースプール）
CREATE TABLE IF NOT EXISTS public.interviewship_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  interview_available_times TEXT,
  max_students INTEGER DEFAULT 5,
  available_topics TEXT[],
  pr_message TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(organization_id)
);

ALTER TABLE public.interviewship_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active interviewship companies"
  ON public.interviewship_companies FOR SELECT
  USING (is_active = true);

CREATE POLICY "Interviewship admins can manage companies"
  ON public.interviewship_companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE INDEX idx_interviewship_companies_org ON public.interviewship_companies(organization_id);

-- 3. インタビューシッププログラム（学校単位）
CREATE TABLE IF NOT EXISTS public.interviewship_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  application_start DATE,
  application_end DATE,
  student_application_enabled BOOLEAN DEFAULT false,
  max_applications_per_student INTEGER DEFAULT 3,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.interviewship_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active programs"
  ON public.interviewship_programs FOR SELECT
  USING (status IN ('active', 'closed'));

CREATE POLICY "Interviewship admins can manage programs"
  ON public.interviewship_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE INDEX idx_interviewship_programs_status ON public.interviewship_programs(status);

-- 4. プログラム企業紐付け
CREATE TABLE IF NOT EXISTS public.interviewship_program_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.interviewship_programs(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.interviewship_companies(id) ON DELETE CASCADE NOT NULL,
  slots INTEGER DEFAULT 5,
  slots_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'full')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(program_id, company_id)
);

ALTER TABLE public.interviewship_program_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view program companies"
  ON public.interviewship_program_companies FOR SELECT
  USING (true);

CREATE POLICY "Interviewship admins can manage program companies"
  ON public.interviewship_program_companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE INDEX idx_ipc_program ON public.interviewship_program_companies(program_id);
CREATE INDEX idx_ipc_company ON public.interviewship_program_companies(company_id);

-- 5. カスタム申し込みフォーム
CREATE TABLE IF NOT EXISTS public.interviewship_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.interviewship_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('company_entry', 'student_application')),
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.interviewship_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active forms"
  ON public.interviewship_forms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Interviewship admins can manage forms"
  ON public.interviewship_forms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

-- 6. フォーム回答データ
CREATE TABLE IF NOT EXISTS public.interviewship_form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.interviewship_forms(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.interviewship_programs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.interviewship_companies(id),
  submitted_by UUID REFERENCES auth.users,
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.interviewship_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON public.interviewship_form_submissions FOR SELECT
  USING (submitted_by = auth.uid());

CREATE POLICY "Interviewship admins can view all submissions"
  ON public.interviewship_form_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can submit forms"
  ON public.interviewship_form_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Interviewship admins can manage submissions"
  ON public.interviewship_form_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE INDEX idx_ifs_form ON public.interviewship_form_submissions(form_id);
CREATE INDEX idx_ifs_program ON public.interviewship_form_submissions(program_id);

-- 7. 学生インタビュー申し込み（早い者勝ち管理）
CREATE TABLE IF NOT EXISTS public.interviewship_student_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.interviewship_programs(id) ON DELETE CASCADE NOT NULL,
  program_company_id UUID REFERENCES public.interviewship_program_companies(id) ON DELETE CASCADE NOT NULL,
  student_user_id UUID REFERENCES auth.users,
  student_name TEXT NOT NULL,
  student_email TEXT,
  student_school TEXT,
  form_submission_id UUID REFERENCES public.interviewship_form_submissions(id),
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'confirmed', 'cancelled', 'completed')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(program_id, program_company_id, student_user_id)
);

ALTER TABLE public.interviewship_student_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own applications"
  ON public.interviewship_student_applications FOR SELECT
  USING (student_user_id = auth.uid());

CREATE POLICY "Interviewship admins can view all applications"
  ON public.interviewship_student_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can apply"
  ON public.interviewship_student_applications FOR INSERT
  WITH CHECK (student_user_id = auth.uid());

CREATE POLICY "Interviewship admins can manage applications"
  ON public.interviewship_student_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.interviewship_admins ia
      WHERE ia.user_id = auth.uid()
    )
  );

CREATE INDEX idx_isa_program ON public.interviewship_student_applications(program_id);
CREATE INDEX idx_isa_company ON public.interviewship_student_applications(program_company_id);
CREATE INDEX idx_isa_student ON public.interviewship_student_applications(student_user_id);

-- 8. 枠数自動更新トリガー
CREATE OR REPLACE FUNCTION update_program_company_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('applied', 'confirmed') THEN
    UPDATE public.interviewship_program_companies
    SET slots_used = slots_used + 1,
        status = CASE
          WHEN slots_used + 1 >= slots THEN 'full'
          ELSE status
        END
    WHERE id = NEW.program_company_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IN ('applied', 'confirmed') AND NEW.status = 'cancelled' THEN
    UPDATE public.interviewship_program_companies
    SET slots_used = GREATEST(slots_used - 1, 0),
        status = CASE
          WHEN slots_used - 1 < slots THEN 'active'
          ELSE status
        END
    WHERE id = NEW.program_company_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_slots
  AFTER INSERT OR UPDATE ON public.interviewship_student_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_program_company_slots();

-- 9. updated_atトリガー
CREATE TRIGGER handle_interviewship_companies_updated_at
  BEFORE UPDATE ON public.interviewship_companies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_interviewship_programs_updated_at
  BEFORE UPDATE ON public.interviewship_programs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_interviewship_forms_updated_at
  BEFORE UPDATE ON public.interviewship_forms
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
