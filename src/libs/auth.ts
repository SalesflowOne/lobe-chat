import type { Session, User } from '@supabase/supabase-js';

import { APP_ID } from '@/config/supabase';
import { createSupabaseBrowserClient } from '@/libs/supabase/client';

import type { AppRole, SignUpProfileData } from './auth-types/types';

export type { AppRole, GlobalProfile, SignUpProfileData } from './auth-types/types';

const getClient = () => createSupabaseBrowserClient();

export const signIn = async (email: string, password: string) => {
  const supabase = getClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, profileData?: SignUpProfileData) => {
  const supabase = getClient();

  return supabase.auth.signUp({
    email,
    options: {
      data: {
        display_name: profileData?.displayName,
        first_name: profileData?.firstName,
        last_name: profileData?.lastName,
        phone: profileData?.phone,
      },
    },
    password,
  });
};

export const signOut = async () => {
  const supabase = getClient();
  return supabase.auth.signOut();
};

export const resetPassword = async (email: string, redirectTo: string) => {
  const supabase = getClient();
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
};

export const updatePassword = async (newPassword: string) => {
  const supabase = getClient();
  return supabase.auth.updateUser({ password: newPassword });
};

export const getSession = async (): Promise<Session | null> => {
  const supabase = getClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = getClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const requireAuth = async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Authentication required');
  return user;
};

export const hasRole = async (role: AppRole, appId: string = APP_ID): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const response = await fetch(`/api/auth/roles?appId=${encodeURIComponent(appId)}`);
  if (!response.ok) return false;

  const data = (await response.json()) as { roles?: AppRole[] };
  return data.roles?.includes(role) ?? false;
};

export const hasAppAccess = async (appId: string = APP_ID): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;

  const response = await fetch(`/api/auth/access?appId=${encodeURIComponent(appId)}`);
  if (!response.ok) return false;

  const data = (await response.json()) as { hasAccess?: boolean };
  return Boolean(data.hasAccess);
};

export const mapSupabaseUserToLobeUser = (user: User | null) => {
  if (!user) return undefined;

  const meta = user.user_metadata ?? {};

  return {
    avatar: meta.avatar_url as string | undefined,
    email: user.email,
    firstName: meta.first_name as string | undefined,
    fullName:
      (meta.display_name as string | undefined) ||
      [meta.first_name, meta.last_name].filter(Boolean).join(' ') ||
      undefined,
    id: user.id,
    latestName: meta.last_name as string | undefined,
    username: (meta.username as string | undefined) || user.email?.split('@')[0],
  };
};
