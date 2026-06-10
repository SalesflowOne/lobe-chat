import { PipedreamClient } from '@pipedream/sdk';

import { isPipedreamConfigured, pipedreamEnv } from '@/config/pipedream';

let client: PipedreamClient | null = null;

export const getPipedreamClient = (): PipedreamClient => {
  if (!isPipedreamConfigured()) {
    throw new Error('Pipedream is not configured. Set PIPEDREAM_* environment variables.');
  }

  if (!client) {
    client = new PipedreamClient({
      clientId: pipedreamEnv.PIPEDREAM_CLIENT_ID!,
      clientSecret: pipedreamEnv.PIPEDREAM_CLIENT_SECRET!,
      projectEnvironment: pipedreamEnv.PIPEDREAM_PROJECT_ENVIRONMENT,
      projectId: pipedreamEnv.PIPEDREAM_PROJECT_ID!,
    });
  }

  return client;
};
