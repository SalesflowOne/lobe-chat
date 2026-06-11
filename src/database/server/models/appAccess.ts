import { and, eq, isNull, or, gt } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { APP_ID } from '@/config/supabase';

import { serverDB } from '../core/db';
import { appAccess } from '../schemas/lobechat/auth';

export class AppAccessModel {
  static hasAccess = async (userId: string, appId: string = APP_ID) => {
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

  static grantDefault = async (userId: string, appId: string = APP_ID) => {
    const has = await AppAccessModel.hasAccess(userId, appId);
    if (has) return;

    await serverDB.insert(appAccess).values({
      appId,
      grantedAt: new Date(),
      id: nanoid(),
      userId,
    });
  };
}
