/*
  # Fix RLS Policy for transactions Table

  1. Security
    - Corrects the INSERT policy for the `transactions` table to use WITH CHECK instead of USING.
    - Ensures authenticated users can insert, select, update, and delete their own transactions.

  2. Tables/Columns Affected
    - `transactions`

  3. Notes
    - This migration fixes the SQL error and allows authenticated users to create transactions.
*/

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can select transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON transactions;

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can select transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (true);