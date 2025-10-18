import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  username: string;
}

interface UserAuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  checkSession: async () => {},
});

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Session'ı kontrol et
  const checkSession = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Only get user_id from session
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (sessionError || !sessionData) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('auth');
        setUser(null);
      } else {
        // Use RPC to get username (bypasses RLS)
        const { data: userData, error: userError } = await supabase
          .rpc('get_app_user_basic', { uid: sessionData.user_id });

        if (userError || !userData || userData.length === 0) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('auth');
          setUser(null);
        } else {
          const userInfo = userData[0];
          setUser({
            id: userInfo.id,
            username: userInfo.username,
          });
          // Set localStorage.auth for backward compatibility
          localStorage.setItem('auth', JSON.stringify({ username: userInfo.username }));
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('auth');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Şifre doğrulama
      const { data: authData, error: authError } = await supabase
        .rpc('verify_user_password', {
          uname: username,
          pw: password
        });

      if (authError || !authData || authData.length === 0 || !authData[0].is_valid) {
        return false;
      }

      const userId = authData[0].user_id;

      // Token oluştur
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli

      // Session oluştur
      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert([{
          user_id: userId,
          token: token,
          expires_at: expiresAt.toISOString()
        }]);

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return false;
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem('userToken', token);
      
      // Set localStorage.auth for backward compatibility
      localStorage.setItem('auth', JSON.stringify({ username }));

      // User state'i güncelle
      setUser({
        id: userId,
        username: username
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    const token = localStorage.getItem('userToken');
    if (token) {
      // Session'ı sil
      supabase
        .from('user_sessions')
        .delete()
        .eq('token', token)
        .then(() => {
          localStorage.removeItem('userToken');
          localStorage.removeItem('auth');
          setUser(null);
        });
    } else {
      localStorage.removeItem('auth');
      setUser(null);
    }
  };

  return (
    <UserAuthContext.Provider value={{ user, loading, login, logout, checkSession }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}
