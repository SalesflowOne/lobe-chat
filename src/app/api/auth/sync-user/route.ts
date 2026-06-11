import { NextResponse } from 'next/server';

import { UserService } from '@/server/services/user';
import { getServerAuthUser } from '@/server/auth/getServerUser';

export const runtime = 'nodejs';

export const POST = async () => {
  const user = await getServerAuthUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userService = new UserService();
  await userService.ensureUserFromSupabase(user);

  return NextResponse.json({ success: true, userId: user.id });
};
