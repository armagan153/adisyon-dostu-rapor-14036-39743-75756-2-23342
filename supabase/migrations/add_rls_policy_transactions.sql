/*
  # Enable RLS and Add Insert Policy for transactions Table

  1. Security
    - Enables Row Level Security (RLS) on the `transactions` table.
    - Adds a policy to allow authenticated users to insert new transactions.
    - Adds a policy to allow authenticated users to select their transactions.
    - Adds a policy to allow authenticated users to update and delete their transactions (optional, for future needs).

  2. Tables/Columns Affected
    - `transactions`

  3. Notes
    - This migration is required for the application to create transactions from the UI.
    - You can further restrict the policy if you want to limit access by user_id (if such a field exists).
*/

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  USING (true);

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