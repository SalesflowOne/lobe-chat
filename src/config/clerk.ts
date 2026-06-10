/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { agentOpsEnv } from '@/config/agentops';

export const getClerkSatelliteConfig = () => {
  const appUrl = agentOpsEnv.NEXT_PUBLIC_AGENTOPS_APP_URL;

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
      NEXT_PUBLIC_CLERK_DOMAIN:
        process.env.NEXT_PUBLIC_CLERK_DOMAIN ??
        (appUrl ? new URL(appUrl).hostname : 'pathofsoler.com'),
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    },
  });
};

export const clerkSatelliteEnv = getClerkSatelliteConfig();

export const isClerkSatelliteReady = (): boolean =>
  Boolean(
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_IS_SATELLITE &&
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_DOMAIN &&
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL &&
    clerkSatelliteEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  );
