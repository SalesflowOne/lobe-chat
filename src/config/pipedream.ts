/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const getPipedreamConfig = () => {
  return createEnv({
    server: {
      PIPEDREAM_CLIENT_ID: z.string().optional(),
      PIPEDREAM_CLIENT_SECRET: z.string().optional(),
      PIPEDREAM_PROJECT_ID: z.string().optional(),
      PIPEDREAM_PROJECT_ENVIRONMENT: z
        .enum(['development', 'production'])
        .optional()
        .default('production'),
    },
    runtimeEnv: {
      PIPEDREAM_CLIENT_ID: process.env.PIPEDREAM_CLIENT_ID,
      PIPEDREAM_CLIENT_SECRET: process.env.PIPEDREAM_CLIENT_SECRET,
      PIPEDREAM_PROJECT_ID: process.env.PIPEDREAM_PROJECT_ID,
      PIPEDREAM_PROJECT_ENVIRONMENT: process.env.PIPEDREAM_PROJECT_ENVIRONMENT,
    },
  });
};

export const pipedreamEnv = getPipedreamConfig();

export const isPipedreamConfigured = (): boolean =>
  Boolean(
    pipedreamEnv.PIPEDREAM_CLIENT_ID &&
    pipedreamEnv.PIPEDREAM_CLIENT_SECRET &&
    pipedreamEnv.PIPEDREAM_PROJECT_ID,
  );
