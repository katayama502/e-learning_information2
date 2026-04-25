-- インタビューシップ一斉メール送信に「カスタムセグメント」機能を追加。
--
-- 単一のプログラムだけでなく、以下のような条件で送信対象を絞り込めるようにする：
--   - 含めるプログラム（OR/AND 結合）
--   - 除外するプログラム
--   - 明示的に除外する組織
--
-- target_mode='custom_segment' のときに segment_config を参照する。
-- 構造:
--   {
--     "include_program_ids": [uuid, ...],
--     "include_combine": "and" | "or",          // デフォルト or
--     "exclude_program_ids": [uuid, ...],
--     "exclude_organization_ids": [uuid, ...]
--   }

ALTER TABLE public.interviewship_email_drafts
  ADD COLUMN IF NOT EXISTS segment_config jsonb;

COMMENT ON COLUMN public.interviewship_email_drafts.segment_config IS
  'target_mode=custom_segment のときに参照するセグメント条件。include_program_ids/include_combine/exclude_program_ids/exclude_organization_ids を持つ';
