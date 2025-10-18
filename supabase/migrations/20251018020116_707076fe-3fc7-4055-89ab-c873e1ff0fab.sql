-- Create secure function to get user basic info (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_app_user_basic(uid uuid)
RETURNS TABLE (id uuid, username text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username 
  FROM public.app_users 
  WHERE id = uid AND is_active = true;
$$;