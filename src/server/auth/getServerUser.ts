import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/libs/supabase/server';

export const getServerAuthUser = async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const getServerAuthUserId = async (): Promise<string | null> => {
  const user = await getServerAuthUser();
  return user?.id ?? null;
};

export const requireServerAuthUserId = async (): Promise<string> => {
  const userId = await getServerAuthUserId();
  if (!userId) throw new Error('Unauthorized');
  return userId;
};

export const getServerAuthUserFromRequest = async () => {
  return getServerAuthUser();
};
