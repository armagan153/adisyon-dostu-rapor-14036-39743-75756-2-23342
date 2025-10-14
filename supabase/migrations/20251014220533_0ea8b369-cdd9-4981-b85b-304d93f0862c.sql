-- Fix verify_admin_password to use extensions.crypt instead of public.crypt
CREATE OR REPLACE FUNCTION public.verify_admin_password(pw text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  matches boolean;
BEGIN
  SELECT (password_hash = extensions.crypt(pw, password_hash)) INTO matches
  FROM admin_settings
  ORDER BY updated_at DESC
  LIMIT 1;

  RETURN COALESCE(matches, false);
END;
$$;

-- Re-hash admin password using extensions.crypt
UPDATE admin_settings 
SET password_hash = extensions.crypt('5555', extensions.gen_salt('bf')), 
    updated_at = now();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;