-- 登録フォームテーブル（講師登録・講座情報登録用）
CREATE TABLE IF NOT EXISTS registration_forms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    form_type text NOT NULL CHECK (form_type IN ('instructor', 'course')),
    token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    title text NOT NULL,
    description text,
    created_by uuid REFERENCES profiles(id),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    expires_at timestamp with time zone,
    submitted_data jsonb,
    submitted_at timestamp with time zone,
    submitted_by_email text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE registration_forms ENABLE ROW LEVEL SECURITY;

-- Admin can manage forms
CREATE POLICY "Admin can manage forms" ON registration_forms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'admin'
        )
    );

-- Public can view active forms by token (for submission)
CREATE POLICY "Public can view active forms by token" ON registration_forms
    FOR SELECT USING (status = 'active');

-- Public can update forms (submit)
CREATE POLICY "Anyone can submit to active forms" ON registration_forms
    FOR UPDATE USING (status = 'active')
    WITH CHECK (status IN ('active', 'used'));
