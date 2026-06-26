-- 情報2 学習プラットフォーム スキーマ
-- Adds joho2-specific tables without touching existing reskill/elearning tables

-- Extend profiles (safe: ADD COLUMN IF NOT EXISTS)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank TEXT    NOT NULL DEFAULT 'ビギナー';

-- Rank definitions
CREATE TABLE IF NOT EXISTS ranks (
  name   TEXT PRIMARY KEY,
  min_xp INTEGER NOT NULL UNIQUE
);
INSERT INTO ranks(name, min_xp) VALUES
  ('ビギナー', 0),
  ('ルーキー', 100),
  ('ブロンズ', 300),
  ('シルバー', 700),
  ('ゴールド', 1500),
  ('プラチナ', 3000),
  ('マスター', 6000)
ON CONFLICT (name) DO NOTHING;

-- Learning units (大単元)
CREATE TABLE IF NOT EXISTS units (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title   TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Materials = 1 lesson each
CREATE TABLE IF NOT EXISTS materials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id      UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  slide_ref    TEXT,
  starter_code TEXT,
  "order"      INTEGER NOT NULL DEFAULT 0
);

-- Questions (choice or code)
CREATE TABLE IF NOT EXISTS questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('choice', 'code')),
  prompt      TEXT NOT NULL,
  choices     JSONB,
  correct     JSONB,
  points      INTEGER NOT NULL DEFAULT 10,
  "order"     INTEGER NOT NULL DEFAULT 0
);

-- Code test cases (server-side only: no SELECT RLS)
CREATE TABLE IF NOT EXISTS code_tests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  input           TEXT NOT NULL DEFAULT '',
  expected_output TEXT NOT NULL
);

-- Attempt history
CREATE TABLE IF NOT EXISTS attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL DEFAULT 0,
  passed      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual answers
CREATE TABLE IF NOT EXISTS answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id  UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer JSONB,
  is_correct  BOOLEAN NOT NULL DEFAULT false
);

-- XP audit log
CREATE TABLE IF NOT EXISTS xp_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent double XP for slide reads
CREATE UNIQUE INDEX IF NOT EXISTS xp_log_slide_once
  ON xp_log(user_id, material_id) WHERE reason = 'slide_read';

-- RLS
ALTER TABLE attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE units       ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials   ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranks       ENABLE ROW LEVEL SECURITY;
-- code_tests: NO SELECT policy (service role only for grading)

DROP POLICY IF EXISTS own_attempts ON attempts;
DROP POLICY IF EXISTS own_answers  ON answers;
DROP POLICY IF EXISTS own_xp       ON xp_log;
DROP POLICY IF EXISTS read_units   ON units;
DROP POLICY IF EXISTS read_materials ON materials;
DROP POLICY IF EXISTS read_questions ON questions;
DROP POLICY IF EXISTS read_ranks   ON ranks;

CREATE POLICY own_attempts    ON attempts  FOR ALL     USING (auth.uid() = user_id);
CREATE POLICY own_answers     ON answers   FOR ALL
  USING (EXISTS (SELECT 1 FROM attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid()));
CREATE POLICY own_xp          ON xp_log    FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY read_units      ON units     FOR SELECT  USING (true);
CREATE POLICY read_materials  ON materials FOR SELECT  USING (true);
CREATE POLICY read_questions  ON questions FOR SELECT  USING (true);
CREATE POLICY read_ranks      ON ranks     FOR SELECT  USING (true);

-- Sample seed data for testing
INSERT INTO units(id, title, "order") VALUES
  ('11111111-0000-0000-0000-000000000001', 'プログラミング基礎', 1),
  ('11111111-0000-0000-0000-000000000002', 'データ構造とアルゴリズム', 2)
ON CONFLICT DO NOTHING;

INSERT INTO materials(id, unit_id, title, starter_code, "order") VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001',
   'Hello, Python!',
   E'# Pythonの基本\n# print()で文字を表示しよう\nprint("Hello, World!")\n', 1),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001',
   '変数と計算',
   E'# 変数を使って計算してみよう\nx = 10\ny = 20\nprint(x + y)\n', 2)
ON CONFLICT DO NOTHING;

INSERT INTO questions(id, material_id, type, prompt, choices, correct, points, "order") VALUES
  ('33333333-0000-0000-0000-000000000001',
   '22222222-0000-0000-0000-000000000001',
   'choice',
   'Pythonで文字列を表示するために使う関数はどれですか？',
   '["input()", "print()", "show()", "display()"]',
   '1',
   10, 1)
ON CONFLICT DO NOTHING;
