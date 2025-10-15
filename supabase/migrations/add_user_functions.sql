/*
  # Kullanıcı Yönetimi Fonksiyonları

  1. Yeni Fonksiyonlar
    - `create_user_with_password` - Şifreli kullanıcı oluşturma
    - Mevcut `update_user_password` fonksiyonunu güncelle
    - Mevcut `verify_user_password` fonksiyonunu güncelle

  2. Güvenlik
    - SECURITY DEFINER ile admin yetkisi
    - Şifre hash'leme bcrypt ile
*/

-- Kullanıcı oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_user_with_password(username text, password text)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO app_users (username, password_hash, created_by)
  VALUES (username, crypt(password, gen_salt('bf')), 'admin')
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Şifre doğrulama fonksiyonu (güncelleme)
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

-- Şifre güncelleme fonksiyonu (güncelleme)
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