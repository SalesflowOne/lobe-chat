import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserStore } from '@/store/user';

import { createAuthSlice } from './action';

let enableSupabaseAuth = false;

vi.mock('@/const/auth', () => ({
  get enableSupabaseAuth() {
    return enableSupabaseAuth;
  },
}));

describe('createAuthSlice', () => {
  beforeEach(() => {
    enableSupabaseAuth = false;
    useUserStore.setState({
      enabledNextAuth: false,
      supabaseSignOut: undefined,
    });
  });

  const getActions = () => {
    const slice = createAuthSlice(
      useUserStore.setState,
      useUserStore.getState,
      useUserStore,
    );
    return slice;
  };

  describe('logout', () => {
    it('should call supabaseSignOut when Supabase is enabled', async () => {
      enableSupabaseAuth = true;
      const supabaseSignOutMock = vi.fn();
      useUserStore.setState({ supabaseSignOut: supabaseSignOutMock });

      const assignMock = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { href: '', assign: assignMock },
      });

      await getActions().logout();
      expect(supabaseSignOutMock).toHaveBeenCalled();
    });
  });

  describe('openLogin', () => {
    it('should redirect to login when Supabase is enabled', async () => {
      enableSupabaseAuth = true;
      const assignMock = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { href: '', pathname: '/chat', search: '' },
      });

      await getActions().openLogin();
      expect(window.location.href).toContain('/login');
    });
  });

  describe('openUserProfile', () => {
    it('should redirect to profile when Supabase is enabled', async () => {
      enableSupabaseAuth = true;
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { href: '' },
      });

      await getActions().openUserProfile();
      expect(window.location.href).toBe('/profile');
    });
  });
});
