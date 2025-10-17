-- Fix RLS policies for user_sessions (public access needed for login)
DROP POLICY IF EXISTS "Service role can manage user sessions" ON public.user_sessions;

CREATE POLICY "Anyone can select sessions"
ON public.user_sessions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete sessions"
ON public.user_sessions
FOR DELETE
USING (true);

-- Fix RLS policies for audit_logs (public access needed)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can create audit logs" ON public.audit_logs;

CREATE POLICY "Anyone can select audit logs"
ON public.audit_logs
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Enable RLS on table_operations
ALTER TABLE public.table_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view table operations"
ON public.table_operations
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert table operations"
ON public.table_operations
FOR INSERT
WITH CHECK (true);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Update tables RLS to allow updates
CREATE POLICY "Anyone can update tables"
ON public.tables
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can insert tables"
ON public.tables
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete tables"
ON public.tables
FOR DELETE
USING (true);