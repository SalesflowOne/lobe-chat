'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  getCurrentUser,
  getSession,
  hasAppAccess,
  hasRole,
  mapSupabaseUserToLobeUser,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '@/libs/auth';
import type { AppRole, SignUpProfileData } from '@/libs/auth-types/types';
import { createSupabaseBrowserClient } from '@/libs/supabase/client';
import { useUserStore } from '@/store/user';

export const useAuth = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isSignedIn = useUserStore((s) => s.isSignedIn);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const syncUser = async () => {
      const current = await getCurrentUser();
      useUserStore.setState({
        isLoaded: true,
        isSignedIn: Boolean(current),
        user: mapSupabaseUserToLobeUser(current),
      });
      setIsLoaded(true);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const current = session?.user ?? null;
      useUserStore.setState({
        isLoaded: true,
        isSignedIn: Boolean(current),
        user: mapSupabaseUserToLobeUser(current),
      });
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    getSession,
    hasAppAccess: useCallback((appId?: string) => hasAppAccess(appId), []),
    hasRole: useCallback((role: AppRole, appId?: string) => hasRole(role, appId), []),
    isLoaded,
    isSignedIn,
    resetPassword,
    signIn,
    signOut: useCallback(async () => {
      await signOut();
      useUserStore.setState({ isSignedIn: false, user: undefined });
    }, []),
    signUp: useCallback(
      (email: string, password: string, profileData?: SignUpProfileData) =>
        signUp(email, password, profileData),
      [],
    ),
    updatePassword,
    user,
  };
};
