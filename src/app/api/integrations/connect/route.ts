import { NextResponse } from 'next/server';

import { getPipedreamExternalUserId } from '@/config/agentops';
import { getAllowedOrigins, resolveAppOriginFromRequest } from '@/config/auth-paths';
import { isPipedreamConfigured } from '@/config/pipedream';
import { getPipedreamClient } from '@/server/pipedream/client';
import { requireServerAuthUserId } from '@/server/auth/getServerUser';

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
  let userId: string;
  try {
    userId = await requireServerAuthUserId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isPipedreamConfigured()) {
    return NextResponse.json({ error: 'Pipedream not configured' }, { status: 503 });
  }

  const body = (await req.json()) as { appSlug?: string };
  const appSlug = body.appSlug;

  if (!appSlug) {
    return NextResponse.json({ error: 'appSlug is required' }, { status: 400 });
  }

  const externalUserId = getPipedreamExternalUserId({ userId });
  const client = getPipedreamClient();
  const appOrigin = resolveAppOriginFromRequest(req);

  const tokenResponse = await client.tokens.create({
    allowedOrigins: getAllowedOrigins(req),
    externalUserId,
    successRedirectUri: `${appOrigin}/integrations?connected=${appSlug}`,
  });

  const connectUrl = new URL(tokenResponse.connectLinkUrl);
  connectUrl.searchParams.set('app', appSlug);

  return NextResponse.json({ connectUrl: connectUrl.toString() });
};
