/*
      # Tables Tablosunu ve RLS Policy'lerini Geri Yükle

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
        - Tüm authenticated kullanıcılar için SELECT, INSERT, UPDATE, DELETE policy'leri eklendi

      3. Notlar
        - Tablo zaten varsa tekrar oluşturulmaz, veri kaybı olmaz
        - Policy'ler ile tüm authenticated kullanıcılar masaları görebilir ve yönetebilir
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

    -- SELECT Policy: Authenticated kullanıcılar tüm masaları görebilir
    CREATE POLICY "Authenticated users can select tables"
      ON tables
      FOR SELECT
      TO authenticated
      USING (true);

    -- INSERT Policy: Authenticated kullanıcılar masa ekleyebilir
    CREATE POLICY "Authenticated users can insert tables"
      ON tables
      FOR INSERT
      TO authenticated
      WITH CHECK (true);

    -- UPDATE Policy: Authenticated kullanıcılar masa güncelleyebilir
    CREATE POLICY "Authenticated users can update tables"
      ON tables
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);

    -- DELETE Policy: Authenticated kullanıcılar masa silebilir
    CREATE POLICY "Authenticated users can delete tables"
      ON tables
      FOR DELETE
      TO authenticated
      USING (true);