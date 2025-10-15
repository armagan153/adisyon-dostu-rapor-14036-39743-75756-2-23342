/*
  # Fix Tables RLS Policies

  1. Changes
    - Disable RLS on tables table (since this is an internal admin operation)
    - OR add proper RLS policies for anonymous users
  
  2. Security
    - Tables should be accessible for POS operations
*/

-- First, check if RLS is enabled and disable it for tables
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;

-- Ensure the table can be updated properly
-- Add updated_at trigger to automatically update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_tables_updated_at'
  ) THEN
    CREATE TRIGGER update_tables_updated_at
      BEFORE UPDATE ON tables
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
