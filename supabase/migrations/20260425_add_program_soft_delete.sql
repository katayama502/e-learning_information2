-- インタビューシップ・プログラムを「ゴミ箱」方式で論理削除できるようにする。
-- 完全削除ではなく deleted_at に削除日時を記録し、復元可能にする。

ALTER TABLE public.interviewship_programs
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ゴミ箱内のレコードを高速にフィルタするための部分インデックス
CREATE INDEX IF NOT EXISTS idx_interviewship_programs_deleted_at
  ON public.interviewship_programs(deleted_at)
  WHERE deleted_at IS NOT NULL;
