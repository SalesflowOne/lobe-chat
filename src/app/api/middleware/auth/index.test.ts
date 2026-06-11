import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from './index';

let authUserId: string | null = 'user-1';

vi.mock('@/server/auth/getServerUser', () => ({
  getServerAuthUserId: vi.fn(async () => authUserId),
}));

vi.mock('@/const/auth', () => ({
  LOBE_CHAT_AUTH_HEADER: 'X-lobe-chat-auth',
  OAUTH_AUTHORIZED: 'X-oauth-authorized',
  get enableSupabaseAuth() {
    return true;
  },
}));

vi.mock('./utils', () => ({
  getJWTPayload: vi.fn(async () => ({ userId: 'jwt-user' })),
  checkAuthMethod: vi.fn(),
}));

describe('checkAuth middleware', () => {
  beforeEach(() => {
    authUserId = 'user-1';
  });

  it('passes through when auth is valid', async () => {
    const handler = vi.fn(async () => new Response('ok'));
    const wrapped = checkAuth(handler);

    const req = new Request('http://localhost', {
      headers: { 'X-lobe-chat-auth': 'token' },
    });

    const res = await wrapped(req, { params: { provider: 'openai' } });
    expect(res.status).toBe(200);
    expect(handler).toHaveBeenCalled();
  });
});
