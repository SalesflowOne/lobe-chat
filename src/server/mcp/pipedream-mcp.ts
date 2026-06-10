import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { getPipedreamExternalUserId } from '@/config/agentops';
import { pipedreamEnv } from '@/config/pipedream';

const PIPEDREAM_MCP_URL = 'https://remote.mcp.pipedream.net/v3';

export interface PipedreamMcpContext {
  appSlug: string;
  externalUserId: string;
}

export const buildPipedreamMcpContext = (params: {
  appSlug: string;
  orgId?: string | null;
  userId: string;
}): PipedreamMcpContext => ({
  appSlug: params.appSlug,
  externalUserId: getPipedreamExternalUserId({
    orgId: params.orgId,
    userId: params.userId,
  }),
});

export const createPipedreamMcpClient = async (context: PipedreamMcpContext): Promise<Client> => {
  const projectId = pipedreamEnv.PIPEDREAM_PROJECT_ID;
  if (!projectId) {
    throw new Error('PIPEDREAM_PROJECT_ID is required for MCP');
  }

  const transport = new StreamableHTTPClientTransport(new URL(PIPEDREAM_MCP_URL), {
    requestInit: {
      headers: {
        'x-pd-app-slug': context.appSlug,
        'x-pd-environment': pipedreamEnv.PIPEDREAM_PROJECT_ENVIRONMENT,
        'x-pd-external-user-id': context.externalUserId,
        'x-pd-project-id': projectId,
      },
    },
  });

  const client = new Client({
    name: 'agentops',
    version: '1.0.0',
  });

  await client.connect(transport);
  return client;
};

export const listPipedreamMcpTools = async (context: PipedreamMcpContext) => {
  const client = await createPipedreamMcpClient(context);
  try {
    const { tools } = await client.listTools();
    return tools;
  } finally {
    await client.close();
  }
};

export const callPipedreamMcpTool = async (
  context: PipedreamMcpContext,
  toolName: string,
  args: Record<string, unknown>,
) => {
  const client = await createPipedreamMcpClient(context);
  try {
    return await client.callTool({
      arguments: args,
      name: toolName,
    });
  } finally {
    await client.close();
  }
};
