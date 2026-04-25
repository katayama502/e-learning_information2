-- interviewship_admins の RLS ポリシーが自己参照で無限再帰を起こしていた問題を修正。
-- 従来の "Admins can manage interviewship admins" ポリシーは ALL cmd で
-- interviewship_admins 自身を参照する EXISTS 句を持っており、
-- SELECT を含むどの操作でも "infinite recursion detected in policy" エラーになっていた。
-- SECURITY DEFINER 関数経由で判定することで再帰を回避する。

DROP POLICY IF EXISTS "Admins can manage interviewship admins" ON public.interviewship_admins;

CREATE OR REPLACE FUNCTION public.is_interviewship_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.interviewship_admins
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_interviewship_admin() TO authenticated, anon;

CREATE POLICY "Admins can modify interviewship admins" ON public.interviewship_admins
  FOR ALL
  USING (public.is_interviewship_admin())
  WITH CHECK (public.is_interviewship_admin());
