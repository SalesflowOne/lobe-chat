import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { APP_ID } from '@/config/supabase';

import { serverDB } from '../core/db';
import { userRoles } from '../schemas/lobechat/auth';

const listRoles = async (userId: string, appId: string = APP_ID) => {
  const rows = await serverDB
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.appId, appId)));

  return rows.map((row) => row.role);
};

const grantDefault = async (userId: string, appId: string = APP_ID) => {
  const existing = await listRoles(userId, appId);
  if (existing.length > 0) return;

  await serverDB.insert(userRoles).values({
    appId,
    id: nanoid(),
    role: 'user',
    userId,
  });
};

export const UserRoleModel = { grantDefault, listRoles };
