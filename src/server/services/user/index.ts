import type { User as SupabaseUser } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { AppAccessModel } from '@/database/server/models/appAccess';
import { ProfileModel } from '@/database/server/models/profile';
import { UserModel } from '@/database/server/models/user';
import { UserRoleModel } from '@/database/server/models/userRole';
import { pino } from '@/libs/logger';

export class UserService {
  ensureUserFromSupabase = async (user: SupabaseUser) => {
    const existing = await UserModel.findById(user.id);
    if (existing) return existing;

    pino.info('creating user from Supabase auth session');

    const meta = user.user_metadata ?? {};
    const firstName = (meta.first_name as string | undefined) ?? undefined;
    const lastName = (meta.last_name as string | undefined) ?? undefined;
    const displayName =
      (meta.display_name as string | undefined) ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      undefined;

    await UserModel.createUser({
      authCreatedAt: user.created_at ? new Date(user.created_at) : new Date(),
      avatar: (meta.avatar_url as string | undefined) ?? undefined,
      email: user.email ?? undefined,
      firstName,
      fullName: displayName,
      id: user.id,
      lastName,
      phone: (meta.phone as string | undefined) ?? undefined,
      username: user.email?.split('@')[0],
    });

    await ProfileModel.upsert({
      avatarUrl: (meta.avatar_url as string | undefined) ?? undefined,
      displayName,
      email: user.email ?? undefined,
      firstName,
      id: user.id,
      lastName,
      phone: (meta.phone as string | undefined) ?? undefined,
    });

    await UserRoleModel.grantDefault(user.id);
    await AppAccessModel.grantDefault(user.id);

    return UserModel.findById(user.id);
  };

  deleteUser = async (id?: string) => {
    if (id) {
      pino.info('delete user');
      await UserModel.deleteUser(id);
      return NextResponse.json({ message: 'user deleted' }, { status: 200 });
    }

    return NextResponse.json({ message: 'ok' }, { status: 200 });
  };

  updateProfile = async (
    userId: string,
    params: {
      avatar?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      username?: string;
    },
  ) => {
    const userModel = new UserModel();

    await userModel.updateUser(userId, {
      avatar: params.avatar,
      email: params.email,
      firstName: params.firstName,
      fullName:
        [params.firstName, params.lastName].filter(Boolean).join(' ') || undefined,
      id: userId,
      lastName: params.lastName,
      phone: params.phone,
      username: params.username,
    });

    await ProfileModel.upsert({
      avatarUrl: params.avatar,
      displayName:
        [params.firstName, params.lastName].filter(Boolean).join(' ') || undefined,
      email: params.email,
      firstName: params.firstName,
      id: userId,
      lastName: params.lastName,
      phone: params.phone,
    });
  };
}
