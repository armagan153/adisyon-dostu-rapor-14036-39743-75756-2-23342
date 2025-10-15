/*
  # RLS Düzeltme ve Kullanıcı Takibi

  1. Değişiklikler
    - transactions tablosunda RLS'yi devre dışı bırak
    - tables tablosuna kullanıcı takibi ekle
    - transactions tablosuna kullanıcı takibi ekle

  2. Güvenlik
    - Çoklu kullanıcı operasyonları için RLS ayarları
*/

-- transactions tablosunda RLS'yi devre dışı bırak
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- tables tablosuna kullanıcı takip alanları ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tables' AND column_name = 'opened_by'
  ) THEN
    ALTER TABLE tables ADD COLUMN opened_by text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tables' AND column_name = 'last_modified_by'
  ) THEN
    ALTER TABLE tables ADD COLUMN last_modified_by text;
  END IF;
END $$;

-- transactions tablosuna kullanıcı takip alanları ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'opened_by'
  ) THEN
    ALTER TABLE transactions ADD COLUMN opened_by text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'closed_by'
  ) THEN
    ALTER TABLE transactions ADD COLUMN closed_by text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'items_added_by'
  ) THEN
    ALTER TABLE transactions ADD COLUMN items_added_by jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- table_items tablosuna kullanıcı takibi ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'table_items' AND column_name = 'added_by'
  ) THEN
    ALTER TABLE table_items ADD COLUMN added_by text;
  END IF;
END $$;