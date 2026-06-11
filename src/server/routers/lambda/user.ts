import { z } from 'zod';

import { enableSupabaseAuth } from '@/const/auth';
import { MessageModel } from '@/database/server/models/message';
import { SessionModel } from '@/database/server/models/session';
import { UserModel, UserNotFoundError } from '@/database/server/models/user';
import { authedProcedure, router } from '@/libs/trpc';
import { getServerAuthUser } from '@/server/auth/getServerUser';
import { UserService } from '@/server/services/user';
import { UserInitializationState, UserPreference } from '@/types/user';

const userProcedure = authedProcedure.use(async (opts) => {
  return opts.next({
    ctx: { userModel: new UserModel() },
  });
});

export const userRouter = router({
  getUserState: userProcedure.query(async ({ ctx }): Promise<UserInitializationState> => {
    let state: Awaited<ReturnType<UserModel['getUserState']>> | undefined;

    while (!state) {
      try {
        state = await ctx.userModel.getUserState(ctx.userId);
      } catch (error) {
        if (enableSupabaseAuth && error instanceof UserNotFoundError) {
          const authUser = await getServerAuthUser();
          if (authUser) {
            const userService = new UserService();
            await userService.ensureUserFromSupabase(authUser);
            continue;
          }
        }
        throw error;
      }
    }

    const messageModel = new MessageModel(ctx.userId);
    const messageCount = await messageModel.count();

    const sessionModel = new SessionModel(ctx.userId);
    const sessionCount = await sessionModel.count();

    return {
      canEnablePWAGuide: messageCount >= 2,
      canEnableTrace: messageCount >= 4,
      hasConversation: messageCount > 0 || sessionCount > 1,
      isOnboard: state.isOnboarded ?? false,
      preference: state.preference as UserPreference,
      settings: state.settings,
      userId: ctx.userId,
    };
  }),

  makeUserOnboarded: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.updateUser(ctx.userId, { isOnboarded: true });
  }),

  resetSettings: userProcedure.mutation(async ({ ctx }) => {
    return ctx.userModel.deleteSetting(ctx.userId);
  }),

  updatePreference: userProcedure.input(z.any()).mutation(async ({ ctx, input }) => {
    return ctx.userModel.updatePreference(ctx.userId, input);
  }),

  updateProfile: userProcedure
    .input(
      z.object({
        avatar: z.string().optional(),
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        username: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userService = new UserService();
      await userService.updateProfile(ctx.userId, input);
      return { success: true };
    }),

  updateSettings: userProcedure
    .input(z.object({}).passthrough())
    .mutation(async ({ ctx, input }) => {
      return ctx.userModel.updateSetting(ctx.userId, input);
    }),
});

export type UserRouter = typeof userRouter;
