import { NextResponse } from 'next/server';

import { requireServerAuthUserId } from '@/server/auth/getServerUser';

import { getPipedreamExternalUserId } from '@/config/agentops';
import { isPipedreamConfigured } from '@/config/pipedream';
import { getPipedreamClient } from '@/server/pipedream/client';

export const runtime = 'nodejs';

export const GET = async () => {
  let userId: string;
  try {
    userId = await requireServerAuthUserId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isPipedreamConfigured()) {
    return NextResponse.json({ accounts: [], configured: false });
  }

  const externalUserId = getPipedreamExternalUserId({ userId });
  const client = getPipedreamClient();

  const accounts: Array<{
    appSlug: string;
    healthy?: boolean;
    id: string;
    name?: string;
  }> = [];

  let page = await client.accounts.list({ externalUserId });
  for await (const account of page) {
    accounts.push({
      appSlug: account.app?.nameSlug ?? 'unknown',
      healthy: account.healthy,
      id: account.id,
      name: account.name ?? undefined,
    });
  }

  while (page.hasNextPage()) {
    page = await page.getNextPage();
    for await (const account of page) {
      accounts.push({
        appSlug: account.app?.nameSlug ?? 'unknown',
        healthy: account.healthy,
        id: account.id,
        name: account.name ?? undefined,
      });
    }
  }

  return NextResponse.json({
    accounts,
    configured: true,
    externalUserId,
  });
};
