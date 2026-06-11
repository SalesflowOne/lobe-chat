/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/** Canonical production host — sign-in and app URLs use this domain. */
export const DEFAULT_APP_HOST = 'pathofsoler.one';

/** Alternate hosts that also serve the app (redirected to canonical in production). */
export const ALTERNATE_APP_HOSTS = [
  'pathofsoler.com',
  'www.pathofsoler.com',
  'www.pathofsoler.one',
] as const;

export const AGENTOPS_ALLOWED_HOSTS = [DEFAULT_APP_HOST, ...ALTERNATE_APP_HOSTS] as const;

/** Well-known connectors pinned at the top of the integrations catalog. */
export const FEATURED_INTEGRATION_SLUGS = [
  'slack',
  'gmail',
  'google_sheets',
  'notion',
  'hubspot',
  'stripe',
  'github',
  'linear',
  'airtable',
  'salesforce',
  'microsoft_outlook',
  'microsoft_teams',
  'shopify',
  'twilio',
  'zendesk',
  'intercom',
  'asana',
  'trello',
  'dropbox',
  'google_drive',
  'google_calendar',
  'discord',
  'mailchimp',
  'openai',
  'anthropic',
] as const;

export type FeaturedIntegrationSlug = (typeof FEATURED_INTEGRATION_SLUGS)[number];

export const getAgentOpsConfig = () => {
  return createEnv({
    client: {
      NEXT_PUBLIC_AGENTOPS_APP_URL: z.string().url().optional(),
      NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME: z.string().optional().default('AgentOps'),
    },
    server: {
      AGENTOPS_APPS_CACHE_TTL_SECONDS: z.coerce.number().optional().default(3600),
    },
    runtimeEnv: {
      NEXT_PUBLIC_AGENTOPS_APP_URL:
        process.env.NEXT_PUBLIC_AGENTOPS_APP_URL ?? `https://${DEFAULT_APP_HOST}`,
      NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME: process.env.NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME,
      AGENTOPS_APPS_CACHE_TTL_SECONDS: process.env.AGENTOPS_APPS_CACHE_TTL_SECONDS,
    },
  });
};

export const agentOpsEnv = getAgentOpsConfig();

export const getPipedreamExternalUserId = (params: {
  orgId?: string | null;
  userId: string;
}): string => {
  if (params.orgId) return `org_${params.orgId}`;
  return `user_${params.userId}`;
};

export const isAllowedAppHost = (host: string): boolean => {
  const normalized = host.split(',')[0].trim().toLowerCase();
  if (AGENTOPS_ALLOWED_HOSTS.some((h) => h.toLowerCase() === normalized)) return true;

  // Vercel preview and production deployment URLs (e.g. lobe-chat-*.vercel.app)
  return normalized.endsWith('.vercel.app');
};
