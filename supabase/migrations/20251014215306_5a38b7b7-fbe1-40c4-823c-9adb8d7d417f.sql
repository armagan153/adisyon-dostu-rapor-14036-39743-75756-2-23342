-- Ensure pgcrypto exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure function to verify the admin password using Postgres crypt
CREATE OR REPLACE FUNCTION public.verify_admin_password(pw text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matches boolean;
BEGIN
  SELECT (password_hash = crypt(pw, password_hash)) INTO matches
  FROM admin_settings
  ORDER BY updated_at DESC
  LIMIT 1;

  RETURN COALESCE(matches, false);
END;
$$;

-- Grant execute to anon and authenticated (not critical for edge functions using service key, but harmless)
GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;