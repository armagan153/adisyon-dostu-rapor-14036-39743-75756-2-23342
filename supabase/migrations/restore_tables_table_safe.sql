/*
      # Tables Tablosunu ve RLS Policy'lerini Güvenli Şekilde Geri Yükle

      1. Yeni/Mevcut Tablo
        - `tables`
          - `id` (integer, primary key): Masa numarası
          - `name` (text, not null): Masa adı
          - `is_occupied` (boolean, default false): Masanın dolu/boş durumu
          - `opened_at` (timestamp, nullable): Masanın açıldığı zaman
          - `created_at` (timestamp, default now()): Oluşturulma zamanı
          - `updated_at` (timestamp, default now()): Güncellenme zamanı

      2. Security
        - RLS aktif edildi
        - Tüm authenticated kullanıcılar için SELECT, INSERT, UPDATE, DELETE policy'leri (varsa tekrar oluşturulmaz)

      3. Notlar
        - Tablo ve policy'ler zaten varsa tekrar oluşturulmaz, veri kaybı olmaz
    */

    CREATE TABLE IF NOT EXISTS tables (
      id integer PRIMARY KEY,
      name text NOT NULL,
      is_occupied boolean NOT NULL DEFAULT false,
      opened_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

    -- SELECT Policy
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE polname = 'Authenticated users can select tables' AND tablename = 'tables'
      ) THEN
        CREATE POLICY "Authenticated users can select tables"
          ON tables
          FOR SELECT
          TO authenticated
          USING (true);
      END IF;
    END $$;

    -- INSERT Policy
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE polname = 'Authenticated users can insert tables' AND tablename = 'tables'
      ) THEN
        CREATE POLICY "Authenticated users can insert tables"
          ON tables
          FOR INSERT
          TO authenticated
          WITH CHECK (true);
      END IF;
    END $$;

    -- UPDATE Policy
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE polname = 'Authenticated users can update tables' AND tablename = 'tables'
      ) THEN
        CREATE POLICY "Authenticated users can update tables"
          ON tables
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);
      END IF;
    END $$;

    -- DELETE Policy
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE polname = 'Authenticated users can delete tables' AND tablename = 'tables'
      ) THEN
        CREATE POLICY "Authenticated users can delete tables"
          ON tables
          FOR DELETE
          TO authenticated
          USING (true);
      END IF;
    END $$;