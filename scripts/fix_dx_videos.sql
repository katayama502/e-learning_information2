-- DXコース 動画修正スクリプト
-- 調査により内容が不適切と判明した2本を差し替え

-- #6: PPkOfsqAxDQ（失敗要因メインで「成功事例」カテゴリに不適切）
--   → KqrUScpW0uY「企業のDX導入における成功事例5選」に変更
UPDATE course_lessons
SET
  title       = '【業務効率化】企業のDX導入における成功事例5選',
  description = '実際の企業がDX導入でどのように業務効率化を実現したか、具体的な成功事例を5社分わかりやすく紹介します。',
  youtube_url = 'https://www.youtube.com/watch?v=KqrUScpW0uY',
  duration    = '20:00'
WHERE id = 'c1020102-0000-0000-0000-000000000001';

-- #8: g4eMLAgxwl0（GLOBIS上級者向けパネル、初心者コースに不向き）
--   → Bs8qgsFc8i0「IPA公式 DX実践事例・成功の秘訣」に変更
UPDATE course_lessons
SET
  title       = '【DX実践の事例】なぜDXが失敗するのか？DX成功の秘訣とは',
  description = 'IPA（情報処理推進機構）公式による、DX推進で失敗しないための成功要因と実践事例を解説します。',
  youtube_url = 'https://www.youtube.com/watch?v=Bs8qgsFc8i0',
  duration    = '25:00'
WHERE id = 'c1020104-0000-0000-0000-000000000001';
