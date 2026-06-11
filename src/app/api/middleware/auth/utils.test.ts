import { describe, expect, it, vi } from 'vitest';

import { ChatErrorType } from '@/types/fetch';

import { checkAuthMethod } from './utils';

let enableSupabaseAuthMock = false;

vi.mock('@/const/auth', () => ({
  get enableSupabaseAuth() {
    return enableSupabaseAuthMock;
  },
  get enableNextAuth() {
    return false;
  },
}));

vi.mock('@/config/app', () => ({
  getAppConfig: () => ({ ACCESS_CODES: ['valid'] }),
}));

describe('checkAuthMethod', () => {
  it('should pass when Supabase user is authenticated', () => {
    enableSupabaseAuthMock = true;
    expect(() =>
      checkAuthMethod({
        authUserId: 'user-123',
      }),
    ).not.toThrow();
    enableSupabaseAuthMock = false;
  });

  it('should throw when Supabase user is missing', () => {
    enableSupabaseAuthMock = true;
    try {
      checkAuthMethod({
        authUserId: null,
      });
    } catch (e) {
      expect(e).toEqual({ errorType: 'InvalidClerkUser' });
    }
    enableSupabaseAuthMock = false;
  });

  it('should pass with valid access code when auth disabled', () => {
    expect(() =>
      checkAuthMethod({
        accessCode: 'valid',
      }),
    ).not.toThrow();
  });

  it('should throw with invalid access code', () => {
    try {
      checkAuthMethod({
        accessCode: 'invalid',
      });
    } catch (e) {
      expect(e).toEqual({ errorType: ChatErrorType.InvalidAccessCode });
    }
  });
});
