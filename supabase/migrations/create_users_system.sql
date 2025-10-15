/*
  # Kullanıcı Yönetim Sistemi

  1. Yeni Tablolar
    - `app_users` - Uygulama kullanıcıları
      - `id` (uuid, primary key)
      - `username` (text, unique, kullanıcı adı)
      - `password_hash` (text, şifre hash'i)
      - `is_active` (boolean, aktif durumu)
      - `created_by` (text, oluşturan admin)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_sessions` - Kullanıcı oturumları
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `token` (text, unique, oturum token'ı)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
    
    - `table_operations` - Masa işlemleri kaydı
      - `id` (uuid, primary key)
      - `table_id` (integer, foreign key)
      - `user_id` (uuid, foreign key)
      - `operation_type` (text, işlem tipi: open, add_item, close)
      - `details` (jsonb, işlem detayları)
      - `created_at` (timestamp)

  2. Güvenlik
    - RLS devre dışı (admin kontrolü)
    - Şifre hash'leme fonksiyonu
*/

-- app_users tablosu
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_by text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- user_sessions tablosu
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- table_operations tablosu
CREATE TABLE IF NOT EXISTS table_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id integer REFERENCES tables(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  username text NOT NULL, -- Kullanıcı silinse bile kim olduğunu bilelim
  operation_type text NOT NULL CHECK (operation_type IN ('open', 'add_item', 'remove_item', 'close')),
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Şifre doğrulama fonksiyonu
CREATE OR REPLACE FUNCTION verify_user_password(uname text, pw text)
RETURNS TABLE(user_id uuid, is_valid boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    (u.password_hash = crypt(pw, u.password_hash)) as is_valid
  FROM app_users u
  WHERE u.username = uname AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Şifre güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_user_password(user_id uuid, new_password text)
RETURNS boolean AS $$
BEGIN
  UPDATE app_users
  SET 
    password_hash = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- İlk admin kullanıcısını oluştur (şifre: admin123)
INSERT INTO app_users (username, password_hash, created_by)
VALUES ('admin', crypt('admin123', gen_salt('bf')), 'system')
ON CONFLICT (username) DO NOTHING;

-- Tablolarda RLS devre dışı
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE table_operations DISABLE ROW LEVEL SECURITY;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_table_operations_table ON table_operations(table_id);
CREATE INDEX IF NOT EXISTS idx_table_operations_user ON table_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_table_operations_created ON table_operations(created_at DESC);
