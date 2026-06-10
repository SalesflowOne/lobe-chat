import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getPipedreamExternalUserId } from '@/config/agentops';
import { getAllowedOrigins, resolveAppOriginFromRequest } from '@/config/clerk';
import { isPipedreamConfigured } from '@/config/pipedream';
import { getPipedreamClient } from '@/server/pipedream/client';

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
  const { orgId, userId } = await auth();
  if (!userId) {
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

  const externalUserId = getPipedreamExternalUserId({ orgId, userId });
  const client = getPipedreamClient();
  const appOrigin = resolveAppOriginFromRequest(req);

  const tokenResponse = await client.tokens.create({
    allowedOrigins: getAllowedOrigins(req),
    externalUserId,
    successRedirectUri: `${appOrigin}/integrations?connected=${appSlug}`,
  });

  const connectUrl = new URL(tokenResponse.connectLinkUrl);
  connectUrl.searchParams.set('app', appSlug);

  return NextResponse.json({
    appSlug,
    connectLink: connectUrl.toString(),
    expiresAt: tokenResponse.expiresAt,
    externalUserId,
  });
};
