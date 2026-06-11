import { NextResponse } from 'next/server';

import { authEnv } from '@/config/auth';
import { updateSupabaseSession } from '@/libs/supabase/middleware';
import NextAuthEdge from '@/libs/next-auth/edge';

import { OAUTH_AUTHORIZED } from './const/auth';

export const config = {
  matcher: [
    '/(api|trpc)(.*)',
    '/',
    '/chat(.*)',
    '/settings(.*)',
    '/integrations',
    '/integrations/(.*)',
    '/artifacts(.*)',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/profile(.*)',
    '/onboard',
    '/auth/callback',
  ],
};

const defaultMiddleware = () => NextResponse.next();

const nextAuthMiddleware = NextAuthEdge.auth((req) => {
  if (req.nextUrl.pathname === '/') return NextResponse.next();

  const session = req.auth;
  const isLoggedIn = !!session?.expires;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete(OAUTH_AUTHORIZED);
  if (isLoggedIn) requestHeaders.set(OAUTH_AUTHORIZED, 'true');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export default authEnv.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH
  ? updateSupabaseSession
  : authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? nextAuthMiddleware
    : defaultMiddleware;
