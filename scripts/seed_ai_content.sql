-- ============================================================
-- AI E-learning コンテンツ 一括投入スクリプト
-- トラック6本 / モジュール13本 / レッスン60本+
-- ============================================================

-- ============================================================
-- TRACK 1: DX（デジタルトランスフォーメーション）入門
-- ============================================================
INSERT INTO courses (id, title, description, category, level, is_published, order_index)
VALUES (
  'a1000001-0000-0000-0000-000000000001',
  'DX（デジタルトランスフォーメーション）入門',
  'デジタルトランスフォーメーション（DX）の基礎から実践事例まで、体系的に学びます。DXの定義・必要性・推進方法・成功事例を通じて、デジタル時代のビジネス変革を理解しましょう。',
  'Track', 'beginner', true, 1
) ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  is_published = true,
  order_index = EXCLUDED.order_index;

-- Module 1-1: DXの基礎知識
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000101-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'DX（デジタルトランスフォーメーション）入門'),
  'DXの基礎知識',
  'DXとは何か、なぜ必要なのか、IT化との違いを基礎から学びます。',
  1, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c1010101-0000-0000-0000-000000000001', 'b1000101-0000-0000-0000-000000000001',
   'DXとは？意味と定義をわかりやすく解説',
   'DXの基本的な意味・定義を、専門用語を使わずわかりやすく解説します。',
   'https://www.youtube.com/watch?v=yLPS9R0tdTk', '12:00', 1, 'video'),
  ('c1010102-0000-0000-0000-000000000001', 'b1000101-0000-0000-0000-000000000001',
   'DX化とIT化の違いを事例でわかりやすく解説',
   '混同されがちなDXとIT化の本質的な違いを具体的な事例とともに解説します。',
   'https://www.youtube.com/watch?v=yHRVwGK0L_o', '14:00', 2, 'video'),
  ('c1010103-0000-0000-0000-000000000001', 'b1000101-0000-0000-0000-000000000001',
   'DX基礎講座①「DXが求められる背景とその本質」',
   'なぜ今DXが求められるのか、社会・経済的な背景からDXの本質を解説します。',
   'https://www.youtube.com/watch?v=B_FuK-tFgO4', '20:00', 3, 'video'),
  ('c1010104-0000-0000-0000-000000000001', 'b1000101-0000-0000-0000-000000000001',
   '【超入門】DXとは？業界のプロが分かりやすく解説【大塚商会】',
   '大塚商会によるDXの意味・必要性を初心者向けにわかりやすく解説する入門動画。',
   'https://www.youtube.com/watch?v=S-9cRjcLIkc', '18:00', 4, 'video')
ON CONFLICT (id) DO NOTHING;

-- Module 1-2: DX推進の実践と事例
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000102-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'DX（デジタルトランスフォーメーション）入門'),
  'DX推進の実践と成功事例',
  '実際の企業事例からDX推進の成功パターンと失敗の落とし穴を学びます。',
  2, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c1020101-0000-0000-0000-000000000001', 'b1000102-0000-0000-0000-000000000001',
   '成功事例から学ぶ！中小企業のDX導入の実情',
   '中小企業がDXを導入する際のリアルな実情をプロがわかりやすく解説します。',
   'https://www.youtube.com/watch?v=jWVMCxKf5BY', '22:00', 1, 'video'),
  ('c1020102-0000-0000-0000-000000000001', 'b1000102-0000-0000-0000-000000000001',
   '【業務効率化】企業のDX導入における成功事例5選',
   '実際の企業がDX導入でどのように業務効率化を実現したか、具体的な成功事例を5社分わかりやすく紹介します。',
   'https://www.youtube.com/watch?v=KqrUScpW0uY', '20:00', 2, 'video'),
  ('c1020103-0000-0000-0000-000000000001', 'b1000102-0000-0000-0000-000000000001',
   '【社会人必須知識】DX（デジタルトランスフォーメーション）徹底解説',
   '働く社会人が必ず知っておくべきDXの全体像をシリーズで学ぶ入門講座。',
   'https://www.youtube.com/watch?v=qZG6zc5HeOA', '30:00', 3, 'video'),
  ('c1020104-0000-0000-0000-000000000001', 'b1000102-0000-0000-0000-000000000001',
   '【DX実践の事例】なぜDXが失敗するのか？DX成功の秘訣とは',
   'IPA（情報処理推進機構）公式による、DX推進で失敗しないための成功要因と実践事例を解説します。',
   'https://www.youtube.com/watch?v=Bs8qgsFc8i0', '25:00', 4, 'video')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRACK 2: ChatGPT完全マスター
-- ============================================================
INSERT INTO courses (id, title, description, category, level, is_published, order_index)
VALUES (
  'a1000002-0000-0000-0000-000000000001',
  'ChatGPT完全マスター',
  'ChatGPTの基本的な使い方から、ビジネスで即使えるプロンプト術まで体系的に習得。生産性を劇的に向上させる実践的なChatGPT活用法を学びます。',
  'Track', 'beginner', true, 2
) ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  is_published = true,
  order_index = EXCLUDED.order_index;

-- Module 2-1: ChatGPT入門
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000201-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'ChatGPT完全マスター'),
  'ChatGPT入門・基本の使い方',
  'ChatGPTのアカウント作成から基本的な使い方まで、ゼロから始める入門編。',
  1, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c2010101-0000-0000-0000-000000000001', 'b1000201-0000-0000-0000-000000000001',
   '5分でわかる ChatGPTの始め方',
   'ChatGPTの登録・ログインから基本操作まで、5分でわかるスピード入門。',
   'https://www.youtube.com/watch?v=VGDtniZ1fOA', '05:00', 1, 'video'),
  ('c2010102-0000-0000-0000-000000000001', 'b1000201-0000-0000-0000-000000000001',
   '【2024年最新版】超初心者向け！ChatGPTの使い方・基礎をわかりやすく解説',
   'ChatGPTの基礎機能を資料付きでわかりやすく解説する初心者向け完全入門。',
   'https://www.youtube.com/watch?v=n2_2xjWoFBc', '45:00', 2, 'video'),
  ('c2010103-0000-0000-0000-000000000001', 'b1000201-0000-0000-0000-000000000001',
   '【保存版】ChatGPT 2025年最新入門～6つのステップで基礎から応用までマスター',
   '無料版対応！初心者から中級者まで、6ステップでChatGPTを完全習得する保存版動画。',
   'https://www.youtube.com/watch?v=UIyokWUJHck', '60:00', 3, 'video'),
  ('c2010104-0000-0000-0000-000000000001', 'b1000201-0000-0000-0000-000000000001',
   'ChatGPTとは？料金・始め方・日本語の使い方を徹底解説',
   'ChatGPTの料金体系・始め方・日本語での使い方・注意点を網羅的に解説。',
   'https://www.youtube.com/watch?v=40szS0xM8Uc', '30:00', 4, 'video')
ON CONFLICT (id) DO NOTHING;

-- Module 2-2: プロンプトエンジニアリング
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000202-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'ChatGPT完全マスター'),
  'プロンプトエンジニアリング・活用術',
  'ChatGPTからより良い回答を引き出すプロンプト技術を実践的に学びます。',
  2, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c2020101-0000-0000-0000-000000000001', 'b1000202-0000-0000-0000-000000000001',
   '誰でも「プロンプト達人」になれる7つのポイント【ChatGPTビジネス活用】',
   'AI専門家・野口竜司氏が教える、仕事量を半減させるプロンプト達人への道。',
   'https://www.youtube.com/watch?v=GCwEIvzxPSc', '40:00', 1, 'video'),
  ('c2020102-0000-0000-0000-000000000001', 'b1000202-0000-0000-0000-000000000001',
   '【初めてでもわかる】ChatGPTプロンプトの作り方講座',
   '見ながら簡単に実践できる、ChatGPTプロンプト作り方の基礎講座。',
   'https://www.youtube.com/watch?v=JQHNFyaUics', '35:00', 2, 'video'),
  ('c2020103-0000-0000-0000-000000000001', 'b1000202-0000-0000-0000-000000000001',
   '【必見】ChatGPT最新の仕事術～5つのパターン＆10の活用事例',
   'ChatGPTを業務で活かす5パターンと10の実践的な活用事例を徹底解説。',
   'https://www.youtube.com/watch?v=bxOOE6QTCv4', '38:00', 3, 'video'),
  ('c2020104-0000-0000-0000-000000000001', 'b1000202-0000-0000-0000-000000000001',
   '【9割が知らない】ChatGPTプロンプト 最強フレーズ10選',
   '多くの人が知らない、ChatGPTから最高の回答を引き出す最強フレーズ集。',
   'https://www.youtube.com/watch?v=Kugl__hnQzw', '25:00', 4, 'video'),
  ('c2020105-0000-0000-0000-000000000001', 'b1000202-0000-0000-0000-000000000001',
   '【脱初心者】ChatGPT・Geminiのプロンプトのコツ！7つの最適解',
   'ChatGPTとGemini両方に使える、初心者を卒業するための7つのプロンプト最適解。',
   'https://www.youtube.com/watch?v=qcui5UQV45U', '28:00', 5, 'video')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRACK 3: Google Gemini マスター
-- ============================================================
INSERT INTO courses (id, title, description, category, level, is_published, order_index)
VALUES (
  'a1000003-0000-0000-0000-000000000001',
  'Google Gemini マスター',
  'GoogleのAI「Gemini」の全機能を基礎から実践まで徹底解説。Gemini for Google WorkspaceやNotebookLMとの連携活用法も学び、業務効率を最大化します。',
  'Track', 'beginner', true, 3
) ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  is_published = true,
  order_index = EXCLUDED.order_index;

-- Module 3-1: Gemini入門
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000301-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'Google Gemini マスター'),
  'Gemini入門・基本機能マスター',
  'GeminiのUIから基本機能まで、ゼロから使いこなす入門講座。',
  1, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c3010101-0000-0000-0000-000000000001', 'b1000301-0000-0000-0000-000000000001',
   '【2026最新！】Google最強AI「Gemini」使い方・全機能・活用法を徹底解説',
   '超初心者OK！資料・プロンプト付きで、Geminiの全機能と活用法を完全解説。',
   'https://www.youtube.com/watch?v=o5kXK5JvIt8', '50:00', 1, 'video'),
  ('c3010102-0000-0000-0000-000000000001', 'b1000301-0000-0000-0000-000000000001',
   '【Gemini総まとめ】初心者向けにGeminiの使い方や便利機能を徹底解説',
   'Geminiの使い方と便利機能を初心者向けにまとめた完全解説動画。',
   'https://www.youtube.com/watch?v=watp8CGPa6c', '40:00', 2, 'video'),
  ('c3010103-0000-0000-0000-000000000001', 'b1000301-0000-0000-0000-000000000001',
   'Google生成AI Gemini（ジェミニ）完全解説【この動画一本で全て理解できる！】',
   'Geminiの基礎からビジネス活用まで、一本で全てを理解できる完全解説動画。',
   'https://www.youtube.com/watch?v=tqk95bTg5pc', '55:00', 3, 'video'),
  ('c3010104-0000-0000-0000-000000000001', 'b1000301-0000-0000-0000-000000000001',
   '【生成AI】超初心者OK！「Gemini」完全マスター・全機能解説',
   'Geminiの基礎から応用まで、完全マスターを目指す超初心者向け解説動画。',
   'https://www.youtube.com/watch?v=yd-bpNe3Axg', '45:00', 4, 'video')
ON CONFLICT (id) DO NOTHING;

-- Module 3-2: Gemini実践活用
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000302-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'Google Gemini マスター'),
  'Gemini実践・Workspace連携活用',
  'Gemini for Google Workspace・NotebookLMとの連携で業務を効率化する実践編。',
  2, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c3020101-0000-0000-0000-000000000001', 'b1000302-0000-0000-0000-000000000001',
   '【決定版】GeminiアプリからNotebookLMまで、基本機能と活用シーンを網羅的に紹介',
   'Geminiアプリ・Gemini for Google Workspace・NotebookLMを完全網羅した決定版解説。',
   'https://www.youtube.com/watch?v=iKUmRtPkcmU', '60:00', 1, 'video'),
  ('c3020102-0000-0000-0000-000000000001', 'b1000302-0000-0000-0000-000000000001',
   '自分専用の生成AI？Gemini for Google WorkspaceのGemsを活用する方法',
   'Gemini for Google WorkspaceのGems機能で自分専用AIを作る実践的な活用法。',
   'https://www.youtube.com/watch?v=_G2KCLW9Rzo', '30:00', 2, 'video'),
  ('c3020103-0000-0000-0000-000000000001', 'b1000302-0000-0000-0000-000000000001',
   '【企業のAI活用入門】Google Gemini Liveで音声対話！スマホで業務効率化',
   'Gemini Liveを使った音声対話AIで業務効率化を実現する企業向け活用入門。',
   'https://www.youtube.com/watch?v=ZrJYpYloUlo', '25:00', 3, 'video')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRACK 4: Claude（クロード）完全活用
-- ============================================================
INSERT INTO courses (id, title, description, category, level, is_published, order_index)
VALUES (
  'a1000004-0000-0000-0000-000000000001',
  'Claude（クロード）完全活用',
  'Anthropic社のAI「Claude」の基本から応用まで徹底解説。ChatGPT・Geminiとの違いを理解しながら、Claudeの強みを最大限に活かした使い方を習得します。',
  'Track', 'beginner', true, 4
) ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  is_published = true,
  order_index = EXCLUDED.order_index;

-- Module 4-1: Claude入門
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000401-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'Claude（クロード）完全活用'),
  'Claude入門・基本機能と特徴',
  'ClaudeとはどんなAIか、ChatGPT・Geminiとの違い、基本的な使い方を学びます。',
  1, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c4010101-0000-0000-0000-000000000001', 'b1000401-0000-0000-0000-000000000001',
   '【最新版】Claude（クロード）完全解説！20以上の便利機能を1本で全て解説',
   'Claudeの20以上の機能を1本で網羅した完全解説動画。Projects・MCPまで対応。',
   'https://www.youtube.com/watch?v=OhO0WcRP6Ow', '50:00', 1, 'video'),
  ('c4010102-0000-0000-0000-000000000001', 'b1000401-0000-0000-0000-000000000001',
   '【1本で全てわかる】Claudeの使い方・初心者入門講座。ChatGPT/Geminiとの違いも比較',
   '図解でわかりやすい！Claude初心者入門講座。ChatGPT・Geminiとの比較解説付き。',
   'https://www.youtube.com/watch?v=3whmRVpLpfw', '55:00', 2, 'video'),
  ('c4010103-0000-0000-0000-000000000001', 'b1000401-0000-0000-0000-000000000001',
   'Claude完全ガイド【これ1本で理解できるクロードの教科書】',
   'ChatGPT・Geminiとの違いも徹底解説。Claudeを完全理解できる教科書動画。',
   'https://www.youtube.com/watch?v=qZT57PZXG3o', '45:00', 3, 'video')
ON CONFLICT (id) DO NOTHING;

-- Module 4-2: Claude実践活用
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000402-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'Claude（クロード）完全活用'),
  'Claude Code・高度な活用',
  'Claude Codeによるコード生成・Webサイト作成など、Claudeの高度な活用法を学びます。',
  2, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c4020101-0000-0000-0000-000000000001', 'b1000402-0000-0000-0000-000000000001',
   '【Claude Code超入門】Webサイト作成の様子を初心者でもわかるように解説',
   'Claude Codeで実際にWebサイトを作成する過程を、初心者向けにわかりやすく解説。',
   'https://www.youtube.com/watch?v=X32pPFe5EIU', '40:00', 1, 'video'),
  ('c4020102-0000-0000-0000-000000000001', 'b1000402-0000-0000-0000-000000000001',
   '【初心者】Claude Codeの全体像がたった9分で丸分かり！始め方〜活用法まで',
   '9分でClaude Codeの始め方から活用法まで全体像を掴める入門動画。',
   'https://www.youtube.com/watch?v=4NDb-X624gY', '09:00', 2, 'video'),
  ('c4020103-0000-0000-0000-000000000001', 'b1000402-0000-0000-0000-000000000001',
   'Claude CoworkやClaude Codeで作れるAIエージェントの作り方と活用コツ',
   'Claude CoworkとClaude Codeを使ったAIエージェントの作り方と活用コツを解説。',
   'https://www.youtube.com/watch?v=0O1_1Uz4kL4', '35:00', 3, 'video')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRACK 5: AX（AIトランスフォーメーション）実践
-- ============================================================
INSERT INTO courses (id, title, description, category, level, is_published, order_index)
VALUES (
  'a1000005-0000-0000-0000-000000000001',
  'AX（AIトランスフォーメーション）実践',
  'DXの次のステージ「AX（AI Transformation）」を体系的に学びます。AI導入から組織変革・業務効率化・経営高度化まで、AI時代の企業変革を実践的に習得します。',
  'Track', 'intermediate', true, 5
) ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  is_published = true,
  order_index = EXCLUDED.order_index;

-- Module 5-1: AXの概念と戦略
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000501-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'AX（AIトランスフォーメーション）実践'),
  'AXの概念と戦略',
  'AXとは何か、DXとの違い、AIトランスフォーメーションの本質と戦略を学びます。',
  1, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c5010101-0000-0000-0000-000000000001', 'b1000501-0000-0000-0000-000000000001',
   '【DXはもう古い？】AX仕掛け人が語るAIトランスフォーメーション(AX)徹底解説',
   'AI経営の第一歩。AX仕掛け人がAXと相性の良い業界・悪い業界も含めて徹底解説。',
   'https://www.youtube.com/watch?v=YmO6TnqLGH0', '45:00', 1, 'video'),
  ('c5010102-0000-0000-0000-000000000001', 'b1000501-0000-0000-0000-000000000001',
   '【AI新時代（前編）】便利ツールで終わらせないAI／AX（AI Transformation）とは',
   'AGI到来までのタイムラインとAI最適化組織への変革とは何かを深掘り解説。',
   'https://www.youtube.com/watch?v=7OIMy2m8Uj4', '50:00', 2, 'video'),
  ('c5010103-0000-0000-0000-000000000001', 'b1000501-0000-0000-0000-000000000001',
   '【AIトランスフォーメーション】"導入するだけ"で終わってませんか？AI×事業変革の本質',
   '単なるAI導入で終わらず、真の事業変革につなげるAIトランスフォーメーションの本質。',
   'https://www.youtube.com/watch?v=sth1y8Qdnho', '35:00', 3, 'video')
ON CONFLICT (id) DO NOTHING;

-- Module 5-2: AI業務活用と生産性向上
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000502-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'AX（AIトランスフォーメーション）実践'),
  'AI業務活用と生産性向上',
  'AIを使った具体的な業務効率化・生産性向上の方法を実践的に学びます。',
  2, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c5020101-0000-0000-0000-000000000001', 'b1000502-0000-0000-0000-000000000001',
   'AIを使った定番の業務効率化5選',
   '知るだけで仕事の無駄時間が大幅に削減できるAI業務効率化の定番5選。',
   'https://www.youtube.com/watch?v=h5OjbZzbgoY', '25:00', 1, 'video'),
  ('c5020102-0000-0000-0000-000000000001', 'b1000502-0000-0000-0000-000000000001',
   '今日から即仕事で使える生成AIの活用法7選',
   'Felo・JENOVA・NotebookLMなど最新ツールを使った業務効率化7選を実践解説。',
   'https://www.youtube.com/watch?v=XZfrv7IWTRY', '30:00', 2, 'video'),
  ('c5020103-0000-0000-0000-000000000001', 'b1000502-0000-0000-0000-000000000001',
   '【知らないと損】生成AIで「ムリ・ムダ・ムラ」を解消！AI業務効率化の秘訣',
   '1時間でAI活用業務効率化のポイントと秘訣を全部お伝えする濃密な解説動画。',
   'https://www.youtube.com/watch?v=JKIhBu1RE4M', '60:00', 3, 'video'),
  ('c5020104-0000-0000-0000-000000000001', 'b1000502-0000-0000-0000-000000000001',
   '【5分で学ぶ！】生成AIの6つのメリットと活用事例',
   '生成AIがビジネスにもたらす6つのメリットと具体的な活用事例を5分でコンパクト解説。',
   'https://www.youtube.com/watch?v=bpPcVGYZjQs', '05:00', 4, 'video'),
  ('c5020105-0000-0000-0000-000000000001', 'b1000502-0000-0000-0000-000000000001',
   '初心者でもAIで業務改善できる！おすすめAIツール＆活用方法',
   'プロが薦める初心者でも使えるAIツールと、具体的な業務改善方法を解説。',
   'https://www.youtube.com/watch?v=NfPFJn_YQkU', '35:00', 5, 'video')
ON CONFLICT (id) DO NOTHING;

-- Module 5-3: AX成功事例と経営変革
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000503-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'AX（AIトランスフォーメーション）実践'),
  'AX成功事例と経営変革',
  'AIトランスフォーメーションの実際の成果と経営変革事例から実践的な知見を得ます。',
  3, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c5030101-0000-0000-0000-000000000001', 'b1000503-0000-0000-0000-000000000001',
   '【AIトランスフォーメーションの成果①】異次元の生産性向上',
   'AIトランスフォーメーションシリーズ第1弾。AIがもたらす異次元の生産性向上を解説。',
   'https://www.youtube.com/watch?v=CF2Ghzn5otc', '30:00', 1, 'video'),
  ('c5030102-0000-0000-0000-000000000001', 'b1000503-0000-0000-0000-000000000001',
   '【事例解説】AIトランスフォーメーション成功の鍵と陥りがちな落とし穴とは？',
   'AX成功の鍵と失敗パターンを事例から学ぶ実践的解説。落とし穴を避けて成功へ。',
   'https://www.youtube.com/watch?v=_tI9JSqvX4M', '35:00', 2, 'video'),
  ('c5030103-0000-0000-0000-000000000001', 'b1000503-0000-0000-0000-000000000001',
   '「AIで何ができる？」と聞く会社は100%失敗します｜AIトランスフォーメーション',
   '製造業・建設業・中小企業の経営者必見。AI経営で失敗しないための本質的な考え方。',
   'https://www.youtube.com/watch?v=h4Qe_N7lBtw', '28:00', 3, 'video'),
  ('c5030104-0000-0000-0000-000000000001', 'b1000503-0000-0000-0000-000000000001',
   '【生成AI時代の業務変革】成功企業の法則／業務効率化から競争力の強化へ',
   '400社以上のデジタルビジネス運用事例から抽出したAI活用成功パターンを解説。',
   'https://www.youtube.com/watch?v=LvgyPNZj3W4', '45:00', 4, 'video')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRACK 6: AI技術の基礎（機械学習・ディープラーニング）
-- ============================================================
INSERT INTO courses (id, title, description, category, level, is_published, order_index)
VALUES (
  'a1000006-0000-0000-0000-000000000001',
  'AI技術の基礎（機械学習・ディープラーニング）',
  'AI・機械学習・ディープラーニングの仕組みをわかりやすく解説。技術的な基礎知識を身につけることで、AI活用の幅を広げ、ビジネスでの意思決定に役立てます。',
  'Track', 'beginner', true, 6
) ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  is_published = true,
  order_index = EXCLUDED.order_index;

-- Module 6-1: AI・機械学習の基礎
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000601-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'AI技術の基礎（機械学習・ディープラーニング）'),
  'AI・機械学習の基礎概念',
  'AI・機械学習・ディープラーニングの違いと基本概念をわかりやすく理解します。',
  1, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c6010101-0000-0000-0000-000000000001', 'b1000601-0000-0000-0000-000000000001',
   '【6分でわかる】AIと機械学習とディープラーニングの違いとは！？',
   'AI・機械学習・ディープラーニングの違いを6分でスッキリ理解できる解説動画。',
   'https://www.youtube.com/watch?v=OFMaQBV3fp4', '06:00', 1, 'video'),
  ('c6010102-0000-0000-0000-000000000001', 'b1000601-0000-0000-0000-000000000001',
   'AI、機械学習、ディープラーニングの違いと関係がわかる！',
   'AI・機械学習・ディープラーニングの違いと相互関係を整理して解説。',
   'https://www.youtube.com/watch?v=hBpgeDwwgoQ', '15:00', 2, 'video'),
  ('c6010103-0000-0000-0000-000000000001', 'b1000601-0000-0000-0000-000000000001',
   '人工知能（AI）とは｜ノートで伝える機械学習入門シリーズ',
   'ノートを使った視覚的な解説でAI・機械学習の基礎概念をわかりやすく伝えるシリーズ。',
   'https://www.youtube.com/watch?v=62HftfNcH6U', '20:00', 3, 'video')
ON CONFLICT (id) DO NOTHING;

-- Module 6-2: ニューラルネットワークとディープラーニング
INSERT INTO course_curriculums (id, course_id, title, description, order_index, is_public, status)
VALUES (
  'b1000602-0000-0000-0000-000000000001',
  (SELECT id FROM courses WHERE title = 'AI技術の基礎（機械学習・ディープラーニング）'),
  'ニューラルネットワークとディープラーニング',
  'ニューラルネットワークの仕組みと、ディープラーニングの原理を理解します。',
  2, true, 'approved'
) ON CONFLICT (id) DO UPDATE SET is_public = true, status = 'approved';

INSERT INTO course_lessons (id, curriculum_id, title, description, youtube_url, duration, order_index, type)
VALUES
  ('c6020101-0000-0000-0000-000000000001', 'b1000602-0000-0000-0000-000000000001',
   'ニューラルネットワークの仕組み｜深層学習（ディープラーニング）Chapter 1',
   'ニューラルネットワークがどのように動くのか、その仕組みを丁寧に解説するシリーズ第1章。',
   'https://www.youtube.com/watch?v=tc8RTtwvd5U', '25:00', 1, 'video'),
  ('c6020102-0000-0000-0000-000000000001', 'b1000602-0000-0000-0000-000000000001',
   '【機械学習】深層学習（ディープラーニング）とは何か',
   'ディープラーニングの概念・仕組み・応用分野をわかりやすく解説する入門動画。',
   'https://www.youtube.com/watch?v=s5_Pk3CjhNA', '20:00', 2, 'video'),
  ('c6020103-0000-0000-0000-000000000001', 'b1000602-0000-0000-0000-000000000001',
   'Deep Learning入門：ニューラルネットワーク学習の仕組み',
   'Deep Learningにおけるニューラルネットワークの学習プロセスを基礎から解説。',
   'https://www.youtube.com/watch?v=r8bbe273vEs', '30:00', 3, 'video')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 投入結果確認
-- ============================================================
SELECT
  t.title AS "トラック",
  COUNT(DISTINCT m.id) AS "モジュール数",
  COUNT(l.id) AS "レッスン数"
FROM courses t
LEFT JOIN course_curriculums m ON m.course_id = t.id AND m.deleted_at IS NULL
LEFT JOIN course_lessons l ON l.curriculum_id = m.id AND l.deleted_at IS NULL
WHERE t.category = 'Track' AND t.deleted_at IS NULL
  AND t.id::text LIKE 'a10000%'
GROUP BY t.title, t.order_index
ORDER BY t.order_index;
