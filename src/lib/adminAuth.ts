import { supabase } from '@/integrations/supabase/client';

export async function checkAdminPassword(password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-admin-password', {
      body: { password }
    });

    if (error) {
      console.error('Error checking admin password:', error);
      return false;
    }

    return data?.valid || false;
  } catch (error) {
    console.error('Error checking admin password:', error);
    return false;
  }
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem('admin_logged_in') === 'true';
}

export function setAdminSession(): void {
  sessionStorage.setItem('admin_logged_in', 'true');
}

export function clearAdminSession(): void {
  sessionStorage.removeItem('admin_logged_in');
}
