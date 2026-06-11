import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

import { requireServerAuthUserId } from '@/server/auth/getServerUser';

import { deployArtifactToSandbox } from '@/server/artifacts/sandbox';

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
  let userId: string;
  try {
    userId = await requireServerAuthUserId();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as {
    files?: Array<{ content: string; path: string }>;
    title?: string;
    type?: string;
  };

  if (!body.files?.length) {
    return NextResponse.json({ error: 'files array is required' }, { status: 400 });
  }

  const sandbox = await deployArtifactToSandbox(body.files);

  return NextResponse.json({
    artifact: {
      id: nanoid(),
      previewUrl: sandbox.previewUrl,
      sandboxId: sandbox.sandboxId,
      title: body.title ?? 'Untitled artifact',
      type: body.type ?? 'code',
      userId,
    },
  });
};
