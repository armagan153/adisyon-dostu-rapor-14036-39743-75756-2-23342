import { supabase } from '@/integrations/supabase/client';

export async function isAdminLoggedIn(): Promise<boolean> {
  // Check if a session exists in Supabase Auth
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}
