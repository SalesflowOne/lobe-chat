import { StateCreator } from 'zustand/vanilla';

import { AUTH_PATHS } from '@/config/auth-paths';
import { enableSupabaseAuth } from '@/const/auth';

import { UserStore } from '../../store';

export interface UserAuthAction {
  enableAuth: () => boolean;
  logout: () => Promise<void>;
  openLogin: () => Promise<void>;
  openUserProfile: () => Promise<void>;
}

export const createAuthSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  UserAuthAction
> = (set, get) => ({
  enableAuth: () => {
    return enableSupabaseAuth || get()?.enabledNextAuth || false;
  },
  logout: async () => {
    if (enableSupabaseAuth) {
      await get().supabaseSignOut?.();
      window.location.href = AUTH_PATHS.signInUrl;
      return;
    }

    const enableNextAuth = get().enabledNextAuth;
    if (enableNextAuth) {
      const { signOut } = await import('next-auth/react');
      signOut();
    }
  },
  openLogin: async () => {
    if (enableSupabaseAuth) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${AUTH_PATHS.signInUrl}?redirect=${redirect}`;
      return;
    }

    const enableNextAuth = get().enabledNextAuth;
    if (enableNextAuth) {
      const { signIn } = await import('next-auth/react');
      const providers = get()?.oAuthSSOProviders;
      if (providers && providers.length === 1) {
        signIn(providers[0]);
        return;
      }
      signIn();
    }
  },

  openUserProfile: async () => {
    if (enableSupabaseAuth) {
      window.location.href = AUTH_PATHS.profileUrl;
      return;
    }
  },
});
