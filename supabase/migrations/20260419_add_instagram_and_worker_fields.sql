-- ============================================
-- Add Instagram URL and enhance worker fields
-- ============================================

-- 1. プロフィールに instagram_url 列を追加（インスタグラム企画の連携用）
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS final_education TEXT;

COMMENT ON COLUMN profiles.instagram_url IS '受講生本人のInstagram URL（任意・インスタグラム企画連携用）';
COMMENT ON COLUMN profiles.job_title IS '社会人の職種（任意）';
COMMENT ON COLUMN profiles.final_education IS '社会人の最終学歴（任意）';

-- 2. RPC関数を更新してこれらのフィールドもUPSERTできるようにする
CREATE OR REPLACE FUNCTION register_user_profile(
  target_id UUID,
  profile_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
   -- Check if profile exists
   IF EXISTS (SELECT 1 FROM profiles WHERE id = target_id) THEN
      -- UPDATE
      IF auth.uid() = target_id THEN
        UPDATE profiles SET
          email = COALESCE(profile_data->>'email', email),
          last_name = COALESCE(profile_data->>'last_name', last_name),
          first_name = COALESCE(profile_data->>'first_name', first_name),
          full_name = COALESCE(profile_data->>'full_name', full_name),
          gender = COALESCE(profile_data->>'gender', gender),
          phone = COALESCE(profile_data->>'phone', phone),
          dob = COALESCE(NULLIF(profile_data->>'dob', '')::date, dob),
          user_type = COALESCE(profile_data->>'user_type', user_type),
          occupation_status = COALESCE(profile_data->>'occupation_status', occupation_status),
          worker_status = profile_data->>'worker_status',
          company_name = profile_data->>'company_name',
          job_title = profile_data->>'job_title',
          final_education = profile_data->>'final_education',
          school_type = profile_data->>'school_type',
          school_name = profile_data->>'school_name',
          source_of_knowledge = profile_data->>'source_of_knowledge',
          referral_source = profile_data->>'referral_source',
          usage_purpose = profile_data->>'usage_purpose',
          instagram_url = profile_data->>'instagram_url'
        WHERE id = target_id;
      ELSE
        RAISE EXCEPTION 'Not authorized to update this profile';
      END IF;
   ELSE
      -- INSERT
      INSERT INTO profiles (
        id, email, last_name, first_name, full_name, gender, phone, dob,
        user_type, occupation_status, worker_status, company_name, job_title,
        final_education, school_type, school_name,
        source_of_knowledge, referral_source, usage_purpose, instagram_url
      ) VALUES (
        target_id,
        profile_data->>'email',
        profile_data->>'last_name',
        profile_data->>'first_name',
        profile_data->>'full_name',
        profile_data->>'gender',
        profile_data->>'phone',
        NULLIF(profile_data->>'dob', '')::date,
        profile_data->>'user_type',
        profile_data->>'occupation_status',
        profile_data->>'worker_status',
        profile_data->>'company_name',
        profile_data->>'job_title',
        profile_data->>'final_education',
        profile_data->>'school_type',
        profile_data->>'school_name',
        profile_data->>'source_of_knowledge',
        profile_data->>'referral_source',
        profile_data->>'usage_purpose',
        profile_data->>'instagram_url'
      );
   END IF;
END;
$$;
