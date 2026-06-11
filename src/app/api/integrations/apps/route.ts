import { NextResponse } from 'next/server';

import { agentOpsEnv } from '@/config/agentops';
import { isPipedreamConfigured } from '@/config/pipedream';
import { requireServerAuthUserId } from '@/server/auth/getServerUser';
import {
  fetchFeaturedIntegrationApps,
  fetchFeaturedIntegrationCategories,
  listIntegrationAppsPage,
} from '@/server/pipedream/apps';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = async (req: Request) => {
  try {
    await requireServerAuthUserId();
  } catch {
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
  const after = searchParams.get('after') ?? undefined;
  const featured = searchParams.get('featured') === 'true';
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

  if (featured && !q) {
    const categories = await fetchFeaturedIntegrationCategories();
    const apps = categories.flatMap((category) => category.apps);
    return NextResponse.json(
      { apps, categories, configured: true, featured: true, total: apps.length },
      {
        headers: {
          'Cache-Control': `s-maxage=${agentOpsEnv.AGENTOPS_APPS_CACHE_TTL_SECONDS}, stale-while-revalidate=600`,
        },
      },
    );
  }

  const page = await listIntegrationAppsPage({ after, limit, q });

  return NextResponse.json(
    {
      apps: page.apps,
      configured: true,
      pageInfo: page.pageInfo,
      total: page.pageInfo.totalCount ?? page.apps.length,
    },
    {
      headers: q
        ? undefined
        : {
            'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
          },
    },
  );
};
