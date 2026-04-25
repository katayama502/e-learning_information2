-- =====================================================
-- リスキル大学：イベント・セミナー機能 マイグレーション
-- =====================================================

-- 1. イベントテーブル
CREATE TABLE IF NOT EXISTS reskill_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  event_type TEXT CHECK (event_type IN ('webinar', 'real', 'event')) NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  location TEXT,
  web_url TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'completed', 'cancelled')) DEFAULT 'published',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 申し込みテーブル
CREATE TABLE IF NOT EXISTS reskill_event_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES reskill_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('applied', 'cancelled')) DEFAULT 'applied',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- RLS有効化
ALTER TABLE reskill_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reskill_event_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLSポリシー: reskill_events
-- =====================================================

-- 公開済みイベントは誰でも閲覧可能
CREATE POLICY "Published events are viewable by everyone" ON reskill_events
  FOR SELECT USING (status = 'published');

-- 管理者は全操作可能
CREATE POLICY "Admins can manage all events" ON reskill_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- 講師は自分のイベントを管理可能
CREATE POLICY "Instructors can manage own events" ON reskill_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM instructors i 
      WHERE i.id = reskill_events.instructor_id 
      AND i.user_id = auth.uid()
    )
  );

-- =====================================================
-- RLSポリシー: reskill_event_applications
-- =====================================================

-- ユーザーは自分の申し込み情報を閲覧可能
CREATE POLICY "Users can view own applications" ON reskill_event_applications
  FOR SELECT USING (user_id = auth.uid());

-- ユーザーは自分で申し込み・キャンセル可能
CREATE POLICY "Users can manage own applications" ON reskill_event_applications
  FOR ALL USING (user_id = auth.uid());

-- 講師は自分のイベントの申し込み情報を閲覧可能
CREATE POLICY "Instructors can view applications for own events" ON reskill_event_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reskill_events e
      JOIN instructors i ON e.instructor_id = i.id
      WHERE e.id = reskill_event_applications.event_id
      AND i.user_id = auth.uid()
    )
  );

-- 管理者は全操作可能
CREATE POLICY "Admins can manage all applications" ON reskill_event_applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- インデックス
CREATE INDEX IF NOT EXISTS idx_reskill_events_instructor_id ON reskill_events(instructor_id);
CREATE INDEX IF NOT EXISTS idx_reskill_events_status ON reskill_events(status);
CREATE INDEX IF NOT EXISTS idx_reskill_event_applications_event_id ON reskill_event_applications(event_id);
CREATE INDEX IF NOT EXISTS idx_reskill_event_applications_user_id ON reskill_event_applications(user_id);
