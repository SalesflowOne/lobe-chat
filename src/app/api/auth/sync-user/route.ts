import { NextResponse } from 'next/server';

import { getServerAuthUser } from '@/server/auth/getServerUser';
import { UserService } from '@/server/services/user';

export const dynamic = 'force-dynamic';
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
