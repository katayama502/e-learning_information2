-- interviewship_forms.form_type に 'event_application' を許容するよう check 制約を拡張。
--
-- 従来: 'company_entry'（新規企業登録フロー） or 'student_application'
-- 追加: 'event_application'（既存企業とのファジーマッチで紐付け。既存担当者は上書きしない）

ALTER TABLE public.interviewship_forms
  DROP CONSTRAINT IF EXISTS interviewship_forms_form_type_check;

ALTER TABLE public.interviewship_forms
  ADD CONSTRAINT interviewship_forms_form_type_check
  CHECK (form_type IN ('company_entry', 'event_application', 'student_application'));
