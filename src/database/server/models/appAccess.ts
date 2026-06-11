import { and, eq, gt, isNull, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { APP_ID } from '@/config/supabase';

import { serverDB } from '../core/db';
import { appAccess } from '../schemas/lobechat/auth';

const hasAccess = async (userId: string, appId: string = APP_ID) => {
  const rows = await serverDB
    .select()
    .from(appAccess)
    .where(
      and(
        eq(appAccess.userId, userId),
        eq(appAccess.appId, appId),
        or(isNull(appAccess.expiresAt), gt(appAccess.expiresAt, new Date())),
      ),
    )
    .limit(1);

  return rows.length > 0;
};

const grantDefault = async (userId: string, appId: string = APP_ID) => {
  const has = await hasAccess(userId, appId);
  if (has) return;

  await serverDB.insert(appAccess).values({
    appId,
    grantedAt: new Date(),
    id: nanoid(),
    userId,
  });
};

export const AppAccessModel = { grantDefault, hasAccess };
