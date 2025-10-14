-- Allow updating transactions
DROP POLICY IF EXISTS "Public can update transactions" ON public.transactions;
CREATE POLICY "Public can update transactions"
ON public.transactions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create transaction_audit_logs table
CREATE TABLE IF NOT EXISTS public.transaction_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  edited_by text NOT NULL,
  edit_type text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.transaction_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public to insert audit logs
CREATE POLICY "Public can insert audit logs"
ON public.transaction_audit_logs
FOR INSERT
WITH CHECK (true);

-- Allow public to view audit logs
CREATE POLICY "Public can view audit logs"
ON public.transaction_audit_logs
FOR SELECT
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_transaction_id ON public.transaction_audit_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.transaction_audit_logs(created_at DESC);