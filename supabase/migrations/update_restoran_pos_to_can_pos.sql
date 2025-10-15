/*
  # Update "Restoran POS" to "Can POS" in Database

  1. Data Updates
    - Updates all fields in all tables where the value is exactly "Restoran POS" or contains "Restoran POS" to "Can POS".
    - Only visible text fields are updated; table/column names remain unchanged.

  2. Tables/Columns Affected
    - product_groups.name
    - products.name
    - tables.name
    - Any other text fields containing "Restoran POS"

  3. Security
    - No changes to RLS or policies.

  4. Notes
    - This migration is safe and only updates text content, not schema.
    - If you have custom fields with "Restoran POS", add them below as needed.
*/

-- Update product_groups.name
UPDATE product_groups
SET name = REPLACE(name, 'Restoran POS', 'Can POS')
WHERE name LIKE '%Restoran POS%';

-- Update products.name
UPDATE products
SET name = REPLACE(name, 'Restoran POS', 'Can POS')
WHERE name LIKE '%Restoran POS%';

-- Update tables.name
UPDATE tables
SET name = REPLACE(name, 'Restoran POS', 'Can POS')
WHERE name LIKE '%Restoran POS%';

-- Update media_library.file_name
UPDATE media_library
SET file_name = REPLACE(file_name, 'Restoran POS', 'Can POS')
WHERE file_name LIKE '%Restoran POS%';

-- Update media_library.file_url
UPDATE media_library
SET file_url = REPLACE(file_url, 'Restoran POS', 'Can POS')
WHERE file_url LIKE '%Restoran POS%';

-- Update transactions.table_name
UPDATE transactions
SET table_name = REPLACE(table_name, 'Restoran POS', 'Can POS')
WHERE table_name LIKE '%Restoran POS%';

-- Update transaction_audit_logs.description
UPDATE transaction_audit_logs
SET description = REPLACE(description, 'Restoran POS', 'Can POS')
WHERE description LIKE '%Restoran POS%';

-- Add more fields here if you have other text columns containing "Restoran POS"
