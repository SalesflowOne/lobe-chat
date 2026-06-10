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

interface AppsCache {
  apps: IntegrationApp[];
  expiresAt: number;
}

let appsCache: AppsCache | null = null;

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

/** Fetch the full Pipedream Connect app catalog (actions-capable apps only). */
export const fetchAllIntegrationApps = async (): Promise<IntegrationApp[]> => {
  const ttlMs = agentOpsEnv.AGENTOPS_APPS_CACHE_TTL_SECONDS * 1000;

  if (appsCache && appsCache.expiresAt > Date.now()) {
    return appsCache.apps;
  }

  if (!isPipedreamConfigured()) {
    return [];
  }

  const client = getPipedreamClient();
  const apps: IntegrationApp[] = [];

  let page = await client.apps.list({
    hasActions: true,
    limit: 100,
    sortDirection: 'desc',
    sortKey: 'featured_weight',
  });

  for await (const app of page) {
    apps.push(mapApp(app));
  }

  while (page.hasNextPage()) {
    page = await page.getNextPage();
    for await (const app of page) {
      apps.push(mapApp(app));
    }
  }

  const featuredSet = new Set<string>(FEATURED_INTEGRATION_SLUGS);
  const featured = FEATURED_INTEGRATION_SLUGS.map((slug) =>
    apps.find((a) => a.nameSlug === slug),
  ).filter(Boolean) as IntegrationApp[];
  const rest = apps
    .filter((app) => !featuredSet.has(app.nameSlug))
    .sort((a, b) => a.name.localeCompare(b.name));

  const sorted = [...featured, ...rest];

  appsCache = {
    apps: sorted,
    expiresAt: Date.now() + ttlMs,
  };

  return sorted;
};

export const searchIntegrationApps = async (query: {
  limit?: number;
  q?: string;
}): Promise<IntegrationApp[]> => {
  if (!isPipedreamConfigured()) return [];

  const client = getPipedreamClient();
  const apps: IntegrationApp[] = [];

  let page = await client.apps.list({
    hasActions: true,
    limit: query.limit ?? 50,
    q: query.q,
    sortDirection: 'desc',
    sortKey: 'featured_weight',
  });

  for await (const app of page) {
    apps.push(mapApp(app));
  }

  return apps;
};
