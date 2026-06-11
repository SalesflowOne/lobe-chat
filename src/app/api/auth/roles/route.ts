import { NextResponse } from 'next/server';

import { APP_ID } from '@/config/supabase';
import { UserRoleModel } from '@/database/server/models/userRole';
import { getServerAuthUserId } from '@/server/auth/getServerUser';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (request: Request) => {
  const userId = await getServerAuthUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId') ?? APP_ID;
  const roles = await UserRoleModel.listRoles(userId, appId);

  return NextResponse.json({ roles });
};
