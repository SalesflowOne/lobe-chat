import { eq } from 'drizzle-orm';

import { serverDB } from '../core/db';
import { type NewProfile, profiles } from '../schemas/lobechat/auth';

const upsert = async (params: NewProfile) => {
  const [existing] = await serverDB
    .select()
    .from(profiles)
    .where(eq(profiles.id, params.id))
    .limit(1);

  if (existing) {
    await serverDB
      .update(profiles)
      .set({ ...params, updatedAt: new Date() })
      .where(eq(profiles.id, params.id));
    return;
  }

  await serverDB.insert(profiles).values(params);
};

export const ProfileModel = { upsert };
