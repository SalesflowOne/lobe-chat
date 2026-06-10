/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import {
  AGENTOPS_ALLOWED_HOSTS,
  DEFAULT_APP_HOST,
  agentOpsEnv,
  isAllowedAppHost,
} from '@/config/agentops';

export const getAppOrigin = (): string => {
  const configured = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  return `https://${DEFAULT_APP_HOST}`;
};

/** Auth stays on the app domain — /login and /signup on pathofsoler.one */
export const getAgentOpsAuthUrls = () => {
  const origin = getAppOrigin();

  return {
    signInUrl: `${origin}/login`,
    signUpUrl: `${origin}/signup`,
  };
};

export const resolveAppOriginFromRequest = (req: Request): string => {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = (forwardedHost ?? req.headers.get('host') ?? '').split(',')[0].trim();

  if (host && isAllowedAppHost(host)) {
    const protocol = req.headers.get('x-forwarded-proto') ?? 'https';
    return `${protocol}://${host}`;
  }

  return getAppOrigin();
};

export const getAllowedOrigins = (req?: Request): string[] => {
  const origins = new Set<string>(AGENTOPS_ALLOWED_HOSTS.map((host) => `https://${host}`));
  origins.add(getAppOrigin());

  if (req) {
    origins.add(resolveAppOriginFromRequest(req));
  }

  return [...origins];
};

export const getClerkSatelliteConfig = () => {
  return createEnv({
    client: {
      NEXT_PUBLIC_CLERK_IS_SATELLITE: z
        .string()
        .optional()
        .transform((v) => v === 'true'),
      NEXT_PUBLIC_CLERK_DOMAIN: z.string().optional(),
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().url().optional(),
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_CLERK_IS_SATELLITE: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE,
      NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN ?? DEFAULT_APP_HOST,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    },
  });
};

export const clerkSatelliteEnv = getClerkSatelliteConfig();

/**
 * Satellite mode is opt-in only (e.g. sharing auth with a separate primary Clerk app).
 * Default: primary Clerk on pathofsoler.one — sign-in never leaves the domain.
 */
export const isClerkSatelliteReady = (): boolean =>
  Boolean(
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_IS_SATELLITE &&
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_DOMAIN &&
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL &&
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  );

export const getClerkProviderAuthUrls = () => {
  if (isClerkSatelliteReady()) {
    return {
      domain: clerkSatelliteEnv.NEXT_PUBLIC_CLERK_DOMAIN!,
      isSatellite: true as const,
      signInUrl: clerkSatelliteEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
      signUpUrl: clerkSatelliteEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
    };
  }

  const { signInUrl, signUpUrl } = getAgentOpsAuthUrls();

  return {
    signInUrl,
    signUpUrl,
  };
};
