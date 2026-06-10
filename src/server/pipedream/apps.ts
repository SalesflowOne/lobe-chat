import { FEATURED_INTEGRATION_SLUGS , agentOpsEnv } from '@/config/agentops';
import { isPipedreamConfigured } from '@/config/pipedream';

import { getPipedreamClient } from './client';

export interface IntegrationApp {
  authType: string | null;
  categories: string[];
  description: string | null;
  featuredWeight: number;
  imgSrc: string;
  isFeatured: boolean;
  name: string;
  nameSlug: string;
}

export interface IntegrationAppsPage {
  apps: IntegrationApp[];
  pageInfo: {
    endCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
  };
}

interface AppsCache {
  apps: IntegrationApp[];
  expiresAt: number;
}

let featuredAppsCache: AppsCache | null = null;

const mapApp = (app: {
  authType?: string | null;
  categories?: string[];
  description?: string | null;
  featuredWeight?: number;
  imgSrc: string;
  name: string;
  nameSlug: string;
}): IntegrationApp => ({
  authType: app.authType ?? null,
  categories: app.categories ?? [],
  description: app.description ?? null,
  featuredWeight: app.featuredWeight ?? 0,
  imgSrc: app.imgSrc,
  isFeatured: FEATURED_INTEGRATION_SLUGS.includes(
    app.nameSlug as (typeof FEATURED_INTEGRATION_SLUGS)[number],
  ),
  name: app.name,
  nameSlug: app.nameSlug,
});

/** Paginated catalog — avoids loading 3000+ apps into memory at once. */
export const listIntegrationAppsPage = async (params: {
  after?: string;
  limit?: number;
  q?: string;
}): Promise<IntegrationAppsPage> => {
  if (!isPipedreamConfigured()) {
    return { apps: [], pageInfo: { endCursor: null, hasMore: false } };
  }

  const client = getPipedreamClient();
  const limit = Math.min(params.limit ?? 48, 100);

  const page = await client.apps.list({
    after: params.after,
    hasActions: true,
    limit,
    q: params.q,
    sortDirection: params.q ? 'desc' : 'asc',
    sortKey: params.q ? 'featured_weight' : 'name',
  });

  const apps: IntegrationApp[] = [];
  for await (const app of page) {
    apps.push(mapApp(app));
  }

  const response = page.response;
  const endCursor = response?.pageInfo?.endCursor ?? null;
  const hasMore = Boolean(endCursor && page.hasNextPage());

  return {
    apps,
    pageInfo: {
      endCursor,
      hasMore,
      totalCount: response?.pageInfo?.totalCount,
    },
  };
};

/** Featured connectors — small cached set for the top of the catalog. */
export const fetchFeaturedIntegrationApps = async (): Promise<IntegrationApp[]> => {
  const ttlMs = agentOpsEnv.AGENTOPS_APPS_CACHE_TTL_SECONDS * 1000;

  if (featuredAppsCache && featuredAppsCache.expiresAt > Date.now()) {
    return featuredAppsCache.apps;
  }

  if (!isPipedreamConfigured()) return [];

  const client = getPipedreamClient();
  const page = await client.apps.list({
    hasActions: true,
    limit: 100,
    sortDirection: 'desc',
    sortKey: 'featured_weight',
  });

  const featuredSet = new Set<string>(FEATURED_INTEGRATION_SLUGS);
  const bySlug = new Map<string, IntegrationApp>();

  for await (const app of page) {
    if (featuredSet.has(app.nameSlug)) {
      bySlug.set(app.nameSlug, mapApp(app));
    }
  }

  const apps = FEATURED_INTEGRATION_SLUGS.map((slug) => bySlug.get(slug)).filter(
    Boolean,
  ) as IntegrationApp[];

  featuredAppsCache = { apps, expiresAt: Date.now() + ttlMs };
  return apps;
};

export const searchIntegrationApps = async (query: {
  limit?: number;
  q?: string;
}): Promise<IntegrationApp[]> => {
  const page = await listIntegrationAppsPage({
    limit: query.limit ?? 50,
    q: query.q,
  });
  return page.apps;
};
