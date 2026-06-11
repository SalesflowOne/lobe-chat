import { TRPCError } from '@trpc/server';

import { trpc } from '../init';

export const userAuth = trpc.middleware(async (opts) => {
  const { ctx } = opts;
  // `ctx.user` is nullable
  if (!ctx.userId) {
    // userId is resolved from Supabase session in createContext
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      // ✅ user value is known to be non-null now
      userId: ctx.userId,
    },
  });
});
