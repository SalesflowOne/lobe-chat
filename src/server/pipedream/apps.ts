import {
  FEATURED_INTEGRATION_CATEGORIES,
  FEATURED_INTEGRATION_SLUGS,
  agentOpsEnv,
} from '@/config/agentops';
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

export interface FeaturedIntegrationCategory {
  apps: IntegrationApp[];
  title: string;
}

interface AppsCache {
  categories: FeaturedIntegrationCategory[];
  expiresAt: number;
}

let featuredAppsCache: AppsCache | null = null;

const featuredSlugSet = new Set<string>(FEATURED_INTEGRATION_SLUGS);

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
  isFeatured: featuredSlugSet.has(app.nameSlug),
  name: app.name,
  nameSlug: app.nameSlug,
});

const fetchAppBySlug = async (slug: string): Promise<IntegrationApp | null> => {
  const client = getPipedreamClient();

  try {
    const page = await client.apps.list({
      hasActions: true,
      limit: 10,
      q: slug,
    });

    for await (const app of page) {
      if (app.nameSlug === slug) return mapApp(app);
    }
  } catch {
    return null;
  }

  return null;
};

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

/** Featured connectors grouped by category — fetched per slug for reliability. */
export const fetchFeaturedIntegrationCategories = async (): Promise<
  FeaturedIntegrationCategory[]
> => {
  const ttlMs = agentOpsEnv.AGENTOPS_APPS_CACHE_TTL_SECONDS * 1000;

  if (featuredAppsCache && featuredAppsCache.expiresAt > Date.now()) {
    return featuredAppsCache.categories;
  }

  if (!isPipedreamConfigured()) return [];

  const slugApps = await Promise.all(
    FEATURED_INTEGRATION_SLUGS.map(async (slug) => [slug, await fetchAppBySlug(slug)] as const),
  );
  const bySlug = new Map(slugApps.filter(([, app]) => app).map(([slug, app]) => [slug, app!]));

  const categories = FEATURED_INTEGRATION_CATEGORIES.map((category) => ({
    apps: category.slugs
      .map((slug) => bySlug.get(slug))
      .filter((app): app is IntegrationApp => Boolean(app)),
    title: category.title,
  })).filter((category) => category.apps.length > 0);

  featuredAppsCache = { categories, expiresAt: Date.now() + ttlMs };
  return categories;
};

/** Flat featured list (all categories combined). */
export const fetchFeaturedIntegrationApps = async (): Promise<IntegrationApp[]> => {
  const categories = await fetchFeaturedIntegrationCategories();
  return categories.flatMap((category) => category.apps);
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
