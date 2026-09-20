// @vitest-environment node
/** @file Verifies that deployment checks reject stale and corrupted served builds. */
import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { writeManifest, verifyDeployment } from '../../scripts/verify-deployment.mjs';

const cleanups = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'swa-verification-'));
  cleanups.push(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, 'assets'));
  await writeFile(join(directory, 'index.html'), '<script src="/assets/app.js"></script>');
  await writeFile(join(directory, 'assets/app.js'), 'console.log("expected build")');
  await writeFile(join(directory, 'staticwebapp.config.json'), '{}');
  const replacements = new Map();
  const server = createServer(async (request, response) => {
    const path = new URL(request.url, 'http://localhost').pathname.slice(1);
    try {
      response.end(replacements.has(path) ? replacements.get(path) : await readFile(join(directory, path)));
    } catch {
      response.writeHead(404).end('missing');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  cleanups.push(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return { directory, replacements, url: `http://127.0.0.1:${server.address().port}` };
}

describe('published build verification', () => {
  it('accepts matching served bytes and excludes the private Azure configuration', async () => {
    const { directory, url } = await fixture();
    const manifest = await writeManifest(directory, 'a'.repeat(40), 'run-1');
    expect(manifest.files.map(file => file.path)).toEqual(['assets/app.js', 'index.html']);
    await expect(verifyDeployment(directory, url)).resolves.toBe(2);
  });

  it('rejects an older deployment even when its assets are unchanged', async () => {
    const { directory, url, replacements } = await fixture();
    const oldManifest = await writeManifest(directory, 'a'.repeat(40), 'run-1');
    await writeManifest(directory, 'b'.repeat(40), 'run-2');
    replacements.set('deployment.json', JSON.stringify(oldManifest));
    await expect(verifyDeployment(directory, url)).rejects.toThrow('Deployment manifest does not match');
  });

  it('rejects a stale or corrupted JavaScript file despite a current manifest', async () => {
    const { directory, url, replacements } = await fixture();
    await writeManifest(directory, 'a'.repeat(40), 'run-1');
    replacements.set('assets/app.js', 'console.log("old build")');
    await expect(verifyDeployment(directory, url)).rejects.toThrow('Content mismatch: assets/app.js');
  });

  it('rejects an SPA fallback page returned with HTTP 200 for a missing asset', async () => {
    const { directory, url, replacements } = await fixture();
    await writeManifest(directory, 'a'.repeat(40), 'run-1');
    replacements.set('assets/app.js', '<html>SPA fallback</html>');
    await expect(verifyDeployment(directory, url)).rejects.toThrow('Content mismatch: assets/app.js');
  });
});
