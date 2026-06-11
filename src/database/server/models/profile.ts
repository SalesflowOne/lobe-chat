import { eq } from 'drizzle-orm';

import { serverDB } from '../core/db';
import { profiles, type NewProfile } from '../schemas/lobechat/auth';

export class ProfileModel {
  static upsert = async (params: NewProfile) => {
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
}
