-- Ensure pgcrypto extension is properly installed in public schema
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Update admin password to '5555' with proper bcrypt hash
UPDATE admin_settings 
SET password_hash = crypt('5555', gen_salt('bf')), 
    updated_at = now();

-- Recreate verify_admin_password function with explicit schema references
CREATE OR REPLACE FUNCTION public.verify_admin_password(pw text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matches boolean;
BEGIN
  SELECT (password_hash = public.crypt(pw, password_hash)) INTO matches
  FROM admin_settings
  ORDER BY updated_at DESC
  LIMIT 1;

  RETURN COALESCE(matches, false);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;