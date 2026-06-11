import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { AUTH_PATHS } from '@/config/auth-paths';
import { supabaseEnv } from '@/config/supabase';

const AUTH_ROUTES = new Set([
  AUTH_PATHS.signInUrl,
  AUTH_PATHS.signUpUrl,
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
]);

const PROTECTED_PREFIXES = ['/settings', '/integrations', '/artifacts'];

export const updateSupabaseSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const url = supabaseEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([headerKey, headerValue]) => {
          supabaseResponse.headers.set(headerKey, headerValue);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const pathname = request.nextUrl.pathname;

  const isAuthRoute = AUTH_ROUTES.has(pathname) || pathname.startsWith('/auth/');
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!user && pathname === '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTH_PATHS.signInUrl;
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTH_PATHS.signInUrl;
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute && pathname !== '/auth/callback') {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/chat';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectTo;
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
};
