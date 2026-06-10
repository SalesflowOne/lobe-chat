import { Sandbox } from '@vercel/sandbox';

const PREVIEW_PORT = 4173;

export interface ArtifactSandboxFile {
  content: string;
  path: string;
}

export interface ArtifactSandboxResult {
  previewUrl: string;
  sandboxId: string;
}

/**
 * Deploy artifact files to an isolated Vercel Sandbox for live preview.
 * Uses Vercel Sandbox — the future-proof path for untrusted generated code.
 */
export const deployArtifactToSandbox = async (
  files: ArtifactSandboxFile[],
): Promise<ArtifactSandboxResult> => {
  const sandbox = await Sandbox.create({
    name: `agentops-artifact-${Date.now()}`,
    ports: [PREVIEW_PORT],
    runtime: 'node24',
    timeout: 30 * 60 * 1000,
  });

  const artifactFiles = [...files];
  const hasIndex = artifactFiles.some(
    (f) => f.path === 'index.html' || f.path.endsWith('/index.html'),
  );

  if (!hasIndex) {
    artifactFiles.unshift({
      content: '<!DOCTYPE html><html><body><p>No index.html in artifact.</p></body></html>',
      path: 'index.html',
    });
  }

  for (const file of artifactFiles) {
    const normalizedPath = file.path.replace(/^\//, '');
    await sandbox.fs.writeFile(`${sandbox.cwd}/${normalizedPath}`, file.content);
  }

  await sandbox.runCommand({
    args: ['-y', 'serve', sandbox.cwd, '-l', String(PREVIEW_PORT)],
    cmd: 'npx',
    detached: true,
  });

  return {
    previewUrl: `https://${sandbox.domain(PREVIEW_PORT)}`,
    sandboxId: sandbox.name,
  };
};
