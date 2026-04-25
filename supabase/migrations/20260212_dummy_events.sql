-- =====================================================
-- リスキル大学：イベント・講師ダミーデータ (3名分)
-- =====================================================

-- 講師データの追加 (profilesテーブルのユーザーを講師として登録)
DO $$
DECLARE
    p1 UUID; p2 UUID; p3 UUID;
BEGIN
    SELECT id INTO p1 FROM profiles ORDER BY created_at LIMIT 1 OFFSET 0;
    SELECT id INTO p2 FROM profiles ORDER BY created_at LIMIT 1 OFFSET 1;
    SELECT id INTO p3 FROM profiles ORDER BY created_at LIMIT 1 OFFSET 2;

    IF p1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM instructors WHERE user_id = p1) THEN
        INSERT INTO instructors (user_id, display_name, bio, specialization, status, is_official)
        VALUES (p1, '西村 勇二', '愛媛のDX推進とデジタル人材育成に注力。EIS LLC代表。', 'DX戦略・キャリアデザイン', 'approved', TRUE);
    END IF;

    IF p2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM instructors WHERE user_id = p2) THEN
        INSERT INTO instructors (user_id, display_name, bio, specialization, status, is_official)
        VALUES (p2, '佐藤 美咲', 'SNSマーケティングの専門家として、地方企業のブランディングを支援。', 'SNSマーケティング・広報', 'approved', TRUE);
    END IF;

    IF p3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM instructors WHERE user_id = p3) THEN
        INSERT INTO instructors (user_id, display_name, bio, specialization, status, is_official)
        VALUES (p3, '中村 健一', 'フルスタックエンジニア。最新のAI技術を活用した業務効率化を提唱。', 'AI活用・Web開発', 'approved', TRUE);
    END IF;
END $$;

-- イベントの追加
-- 1. 西村講師のDXセミナー (Webinar)
INSERT INTO reskill_events (title, description, instructor_id, event_type, start_at, end_at, capacity, web_url, status)
SELECT 
    '【Web講習】地方企業のDX導入：最初の一歩', 
    'DXとは何か？という基礎から、愛媛県内での具体的な成功事例を交えて解説します。',
    id,
    'webinar',
    timezone('utc', now() + interval '7 days'),
    timezone('utc', now() + interval '7 days' + interval '1.5 hours'),
    100,
    'https://zoom.us/j/example-dx',
    'published'
FROM instructors 
WHERE display_name = '西村 勇二'
  AND NOT EXISTS (SELECT 1 FROM reskill_events WHERE title = '【Web講習】地方企業のDX導入：最初の一歩');

-- 2. 佐藤講師のSNSワークショップ (Real)
INSERT INTO reskill_events (title, description, instructor_id, event_type, start_at, end_at, capacity, location, status)
SELECT 
    '実践！SNSフォロワー倍増ワークショップ', 
    'スマホひとつで始められる、惹きつける写真の撮り方と投稿のコツを対面でレクチャーします。',
    id,
    'real',
    timezone('utc', now() + interval '10 days'),
    timezone('utc', now() + interval '10 days' + interval '3 hours'),
    15,
    '松山市内 コワーキングスペース',
    'published'
FROM instructors 
WHERE display_name = '佐藤 美咲'
  AND NOT EXISTS (SELECT 1 FROM reskill_events WHERE title = '実践！SNSフォロワー倍増ワークショップ');

-- 3. 中村講師のAI講座 (Webinar)
INSERT INTO reskill_events (title, description, instructor_id, event_type, start_at, end_at, capacity, web_url, status)
SELECT 
    'エンジニアのためのChatGPT活用術', 
    'プログラミングやドキュメント作成を10倍速くする、生成AIの使いこなし術を徹底解説。',
    id,
    'webinar',
    timezone('utc', now() + interval '5 days'),
    timezone('utc', now() + interval '5 days' + interval '1 hour'),
    50,
    'https://zoom.us/j/example-ai',
    'published'
FROM instructors 
WHERE display_name = '中村 健一'
  AND NOT EXISTS (SELECT 1 FROM reskill_events WHERE title = 'エンジニアのためのChatGPT活用術');
