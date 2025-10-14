-- Fix security warning: Set search_path for verify_admin_password function
CREATE OR REPLACE FUNCTION public.verify_admin_password(pw text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  matches boolean;
BEGIN
  SELECT (password_hash = extensions.crypt(pw, password_hash)) INTO matches
  FROM public.admin_settings
  ORDER BY updated_at DESC
  LIMIT 1;

  RETURN COALESCE(matches, false);
END;
$$;