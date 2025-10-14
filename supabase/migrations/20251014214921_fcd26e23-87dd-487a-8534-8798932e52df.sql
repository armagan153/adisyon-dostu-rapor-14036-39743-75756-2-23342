-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update admin password to '5555'
UPDATE admin_settings 
SET password_hash = crypt('5555', gen_salt('bf')),
    updated_at = now()
WHERE id = '16c9ae7a-815a-4c02-97cd-6be6c7fadd85';
