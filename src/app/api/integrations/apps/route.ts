import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { isPipedreamConfigured } from '@/config/pipedream';
import { fetchAllIntegrationApps, searchIntegrationApps } from '@/server/pipedream/apps';

export const runtime = 'nodejs';

export const GET = async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isPipedreamConfigured()) {
    return NextResponse.json({
      apps: [],
      configured: false,
      message: 'Pipedream is not configured on this deployment.',
    });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? undefined;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

  const apps = q ? await searchIntegrationApps({ limit, q }) : await fetchAllIntegrationApps();

  return NextResponse.json({
    apps,
    configured: true,
    total: apps.length,
  });
};
