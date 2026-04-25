-- インタビューシッププログラムに定員（capacity）カラムを追加。
-- 申込フォーム送信時に現在の有効な submission 数が capacity に達したら、
-- そのプログラムに紐付く is_active=true のフォームを自動的に受付停止に切り替える。
--
-- 既存プログラムへの移行：
--   NULL = 定員無制限（従来の挙動）
--   正の整数 = 定員。達したら自動受付停止。

ALTER TABLE public.interviewship_programs
  ADD COLUMN IF NOT EXISTS capacity integer;

COMMENT ON COLUMN public.interviewship_programs.capacity IS
  'プログラム全体の定員数（NULL=無制限）。申込件数がこの数に達したら紐付くフォームを自動的に is_active=false にする';
