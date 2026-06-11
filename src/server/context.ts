/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from 'next-auth';
import { NextRequest } from 'next/server';

import { JWTPayload, LOBE_CHAT_AUTH_HEADER, enableNextAuth, enableSupabaseAuth } from '@/const/auth';
import NextAuthEdge from '@/libs/next-auth/edge';
import { getServerAuthUserId } from '@/server/auth/getServerUser';

export interface AuthContext {
  authorizationHeader?: string | null;
  jwtPayload?: JWTPayload | null;
  nextAuth?: User;
  userId?: string | null;
}

export const createContextInner = async (params?: {
  authorizationHeader?: string | null;
  nextAuth?: User;
  userId?: string | null;
}): Promise<AuthContext> => ({
  authorizationHeader: params?.authorizationHeader,
  nextAuth: params?.nextAuth,
  userId: params?.userId,
});

export type Context = Awaited<ReturnType<typeof createContextInner>>;

export const createContext = async (request: NextRequest): Promise<Context> => {
  const authorization = request.headers.get(LOBE_CHAT_AUTH_HEADER);

  if (enableSupabaseAuth) {
    const userId = await getServerAuthUserId();
    return createContextInner({ authorizationHeader: authorization, userId });
  }

  if (enableNextAuth) {
    try {
      const session = await NextAuthEdge.auth();
      if (session && session?.user?.id) {
        return createContextInner({
          authorizationHeader: authorization,
          nextAuth: session.user,
          userId: session.user.id,
        });
      }
    } catch {
      // NextAuth session unavailable
    }
  }

  return createContextInner({ authorizationHeader: authorization, userId: null });
};
